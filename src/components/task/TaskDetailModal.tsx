'use client';

import { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { BoardTask, ChecklistItem, Priority } from '@/lib/types';
import PriorityPicker from '@/components/ui/PriorityPicker';
import PriorityBadge from '@/components/ui/PriorityBadge';

interface TaskDetailModalProps {
  task: BoardTask;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updates: Partial<BoardTask>) => void;
}

export default function TaskDetailModal({ task, isOpen, onClose, onUpdate }: TaskDetailModalProps) {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(task.checklist || []);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [priorityPickerOpen, setPriorityPickerOpen] = useState(false);
  const priorityButtonRef = useRef<HTMLButtonElement>(null);

  const editor = useEditor({
    extensions: [StarterKit],
    content: task.description || '<p>Write your description here...</p>',
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[300px] px-4 py-3 text-gray-900 dark:text-white',
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && task.description !== editor.getHTML()) {
      editor.commands.setContent(task.description || '<p>Write your description here...</p>');
    }
    setChecklist(task.checklist || []);
  }, [task, editor]);

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleSave();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  const handleSave = () => {
    onUpdate({
      description: editor?.getHTML() || '',
      progress: calculateProgress(),
      checklist,
    });
    onClose();
  };

  const handleSetPriority = (priority: Priority | undefined) => {
    onUpdate({
      priority,
    });
  };

  const handleAddChecklistItem = () => {
    if (newChecklistItem.trim()) {
      const newItem: ChecklistItem = {
        id: `check-${Date.now()}`,
        text: newChecklistItem.trim(),
        completed: false,
      };
      setChecklist([...checklist, newItem]);
      setNewChecklistItem('');
    }
  };

  const handleToggleChecklistItem = (id: string) => {
    setChecklist(checklist.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const handleDeleteChecklistItem = (id: string) => {
    setChecklist(checklist.filter(item => item.id !== id));
  };

  const calculateProgress = () => {
    if (checklist.length === 0) return 0;
    const completed = checklist.filter(item => item.completed).length;
    return Math.round((completed / checklist.length) * 100);
  };

  // Auto-update progress and completion status whenever checklist changes
  useEffect(() => {
    const newProgress = calculateProgress();
    const shouldBeCompleted = checklist.length > 0 && newProgress === 100;

    // Update parent immediately when checklist changes
    if (isOpen) {
      onUpdate({
        progress: newProgress,
        checklist,
        completed: shouldBeCompleted,
      });
    }
  }, [checklist]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleSave}
      />

      {/* Modal */}
      <div
        className="relative min-h-screen flex items-start justify-center pt-10 pb-10"
        onClick={handleSave}
      >
        <div
          className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {task.text}
                </h2>
                <div className="flex items-center gap-3 flex-wrap">
                  {task.dueDate && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    {task.priority ? (
                      <button
                        ref={priorityButtonRef}
                        onClick={() => setPriorityPickerOpen(!priorityPickerOpen)}
                        className="hover:opacity-80 transition-opacity"
                      >
                        <PriorityBadge priority={task.priority} />
                      </button>
                    ) : (
                      <button
                        ref={priorityButtonRef}
                        onClick={() => setPriorityPickerOpen(!priorityPickerOpen)}
                        className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 border border-dashed border-gray-300 dark:border-gray-600 rounded-md hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Set Priority
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={handleSave}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Priority Picker */}
          {priorityPickerOpen && (
            <PriorityPicker
              value={task.priority}
              onChange={handleSetPriority}
              onClose={() => setPriorityPickerOpen(false)}
              triggerRef={priorityButtonRef}
            />
          )}

          {/* Content */}
          <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Checklist */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Checklist
                </label>
                {checklist.length > 0 && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {checklist.filter(item => item.completed).length} / {checklist.length} completed ({calculateProgress()}%)
                  </span>
                )}
              </div>

              {/* Checklist items */}
              <div className="space-y-2 mb-3">
                {checklist.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-3 group/item p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => handleToggleChecklistItem(item.id)}
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className={`flex-1 text-sm ${item.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      {item.text}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleDeleteChecklistItem(item.id);
                      }}
                      className="opacity-0 group-hover/item:opacity-100 text-red-500 hover:text-red-600 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </label>
                ))}
              </div>

              {/* Add checklist item */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddChecklistItem();
                    }
                  }}
                  placeholder="Add checklist item..."
                  className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleAddChecklistItem}
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            {/* WYSIWYG Editor */}
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-3">
                Description
              </label>

              {/* Toolbar */}
              {editor && (
                <div className="flex flex-wrap gap-1 mb-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-t-lg border border-b-0 border-gray-200 dark:border-gray-600">
                  {/* Headings */}
                  <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={`px-3 py-1.5 text-xs font-semibold rounded border transition-colors ${
                      editor.isActive('heading', { level: 1 })
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600'
                    }`}
                    title="Heading 1"
                  >
                    H1
                  </button>
                  <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`px-3 py-1.5 text-xs font-semibold rounded border transition-colors ${
                      editor.isActive('heading', { level: 2 })
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600'
                    }`}
                    title="Heading 2"
                  >
                    H2
                  </button>
                  <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={`px-3 py-1.5 text-xs font-semibold rounded border transition-colors ${
                      editor.isActive('heading', { level: 3 })
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600'
                    }`}
                    title="Heading 3"
                  >
                    H3
                  </button>

                  <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

                  {/* Bold */}
                  <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`px-3 py-1.5 text-xs font-bold rounded border transition-colors ${
                      editor.isActive('bold')
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600'
                    }`}
                    title="Bold"
                  >
                    B
                  </button>

                  {/* Italic */}
                  <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`px-3 py-1.5 text-xs italic rounded border transition-colors ${
                      editor.isActive('italic')
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600'
                    }`}
                    title="Italic"
                  >
                    I
                  </button>

                  {/* Code */}
                  <button
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    className={`px-3 py-1.5 text-xs font-mono rounded border transition-colors ${
                      editor.isActive('code')
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600'
                    }`}
                    title="Code"
                  >
                    {'</>'}
                  </button>

                  <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

                  {/* Lists */}
                  <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`px-3 py-1.5 text-xs rounded border transition-colors ${
                      editor.isActive('bulletList')
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600'
                    }`}
                    title="Bullet List"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <button
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`px-3 py-1.5 text-xs rounded border transition-colors ${
                      editor.isActive('orderedList')
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600'
                    }`}
                    title="Numbered List"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </button>

                  <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

                  {/* Code Block */}
                  <button
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    className={`px-3 py-1.5 text-xs rounded border transition-colors ${
                      editor.isActive('codeBlock')
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600'
                    }`}
                    title="Code Block"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </button>

                  {/* Blockquote */}
                  <button
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={`px-3 py-1.5 text-xs rounded border transition-colors ${
                      editor.isActive('blockquote')
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600'
                    }`}
                    title="Blockquote"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </button>

                  <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

                  {/* Undo/Redo */}
                  <button
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    className="px-3 py-1.5 text-xs rounded border bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Undo"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                  </button>
                  <button
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    className="px-3 py-1.5 text-xs rounded border bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Redo"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Editor */}
              <EditorContent
                editor={editor}
                className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-b-lg overflow-auto"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
