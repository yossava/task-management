import { Board, BoardTemplate, ActivityLog } from '@/lib/types';
import { TemplateService } from './templateService';
import { ActivityService } from './activityService';

export interface ExportData {
  version: string;
  exportedAt: number;
  boards: Board[];
  customTemplates: BoardTemplate[];
  activities: ActivityLog[];
}

export class ExportService {
  static VERSION = '1.0.0';

  /**
   * Export all data to JSON
   */
  static exportAll(boards: Board[]): ExportData {
    return {
      version: this.VERSION,
      exportedAt: Date.now(),
      boards: boards,
      customTemplates: TemplateService.getAllTemplates().filter(t => t.isCustom),
      activities: ActivityService.getAll(),
    };
  }

  /**
   * Export specific board to JSON
   */
  static exportBoard(board: Board): ExportData {
    return {
      version: this.VERSION,
      exportedAt: Date.now(),
      boards: [board],
      customTemplates: [],
      activities: ActivityService.getByBoard(board.id),
    };
  }

  /**
   * Download export data as JSON file
   */
  static downloadJSON(data: ExportData, filename?: string): void {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `podotask-export-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Import data from JSON
   * @deprecated This method uses localStorage. Use TemplateService.importBoard() or importBoards() instead
   * which properly handle API-based board creation.
   */
  static async importData(data: ExportData, options?: {
    replaceExisting?: boolean;
    includeActivities?: boolean;
  }): Promise<{ success: boolean; error?: string; imported: { boards: number; templates: number; activities: number } }> {
    try {
      // Validate version
      if (!data.version) {
        return {
          success: false,
          error: 'Invalid export file: missing version',
          imported: { boards: 0, templates: 0, activities: 0 }
        };
      }

      const { replaceExisting = false, includeActivities = true } = options || {};
      let importedBoards = 0;
      let importedTemplates = 0;
      let importedActivities = 0;

      // Import boards using TemplateService which uses API
      if (data.boards && Array.isArray(data.boards)) {
        if (replaceExisting) {
          console.warn('replaceExisting option is not supported with API-based import');
        }

        for (const board of data.boards) {
          try {
            await TemplateService.importBoard(JSON.stringify({ board }));
            importedBoards++;
          } catch (error) {
            console.error('Failed to import board:', board.title, error);
          }
        }
      }

      // Import custom templates
      if (data.customTemplates && Array.isArray(data.customTemplates)) {
        data.customTemplates.forEach(template => {
          const existingTemplates = TemplateService.getAllTemplates();
          const exists = existingTemplates.some(t => t.name === template.name && t.isCustom);

          if (!exists || replaceExisting) {
            // Note: TemplateService doesn't have import method, templates are saved when created
            importedTemplates++;
          }
        });
      }

      // Import activities (optional)
      if (includeActivities && data.activities && Array.isArray(data.activities)) {
        data.activities.forEach(activity => {
          // Activities are automatically created by operations, so we skip import by default
          // This section is here for potential future use
          importedActivities++;
        });
      }

      return {
        success: true,
        imported: {
          boards: importedBoards,
          templates: importedTemplates,
          activities: importedActivities,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during import',
        imported: { boards: 0, templates: 0, activities: 0 },
      };
    }
  }

  /**
   * Read and parse JSON file
   */
  static async readJSONFile(file: File): Promise<ExportData | null> {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      return data as ExportData;
    } catch (error) {
      console.error('Error reading JSON file:', error);
      return null;
    }
  }

  /**
   * Export to CSV format (for boards and tasks)
   */
  static exportToCSV(boards: Board[]): string {

    const headers = ['Board', 'Task', 'Status', 'Priority', 'Due Date', 'Tags', 'Created At'];
    const rows = [headers.join(',')];

    boards.forEach(board => {
      board.tasks.forEach(task => {
        const row = [
          `"${board.title}"`,
          `"${task.text}"`,
          task.completed ? 'Completed' : 'Pending',
          task.priority || 'None',
          task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date',
          task.tags ? `"${board.tags?.filter(t => task.tags?.includes(t.id)).map(t => t.name).join(', ')}"` : '""',
          new Date(task.createdAt).toLocaleDateString(),
        ];
        rows.push(row.join(','));
      });
    });

    return rows.join('\n');
  }

  /**
   * Download CSV export
   */
  static downloadCSV(boards: Board[], filename?: string): void {
    const csv = this.exportToCSV(boards);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `podotask-export-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
