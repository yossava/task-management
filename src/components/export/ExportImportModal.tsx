'use client';

import { useState, useRef } from 'react';
import { ExportService } from '@/lib/services/exportService';

interface ExportImportModalProps {
  onClose: () => void;
}

export default function ExportImportModal({ onClose }: ExportImportModalProps) {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importOptions, setImportOptions] = useState({
    replaceExisting: false,
    includeActivities: true,
  });
  const [importResult, setImportResult] = useState<{
    success: boolean;
    error?: string;
    imported?: { boards: number; templates: number; activities: number };
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJSON = () => {
    const data = ExportService.exportAll();
    ExportService.downloadJSON(data);
  };

  const handleExportCSV = () => {
    ExportService.downloadCSV();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;

    const data = await ExportService.readJSONFile(importFile);
    if (!data) {
      setImportResult({
        success: false,
        error: 'Invalid file format. Please select a valid PodoTask export file.',
      });
      return;
    }

    const result = ExportService.importData(data, importOptions);
    setImportResult(result);

    if (result.success) {
      // Reload after successful import
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Export & Import</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Backup and restore your data</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('export')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'export'
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Export
              </button>
              <button
                onClick={() => setActiveTab('import')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'import'
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Import
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {activeTab === 'export' ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Export Your Data</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Download all your boards, tasks, templates, and activity history in different formats.
                  </p>

                  <div className="space-y-3">
                    {/* JSON Export */}
                    <button
                      onClick={handleExportJSON}
                      className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900 dark:hover:to-indigo-900 border-2 border-blue-200 dark:border-blue-800 rounded-xl transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <h4 className="font-semibold text-gray-900 dark:text-white">Export as JSON</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Complete backup with all data and settings</p>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>

                    {/* CSV Export */}
                    <button
                      onClick={handleExportCSV}
                      className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900 dark:hover:to-emerald-900 border-2 border-green-200 dark:border-green-800 rounded-xl transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <h4 className="font-semibold text-gray-900 dark:text-white">Export as CSV</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Spreadsheet format for data analysis</p>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex gap-3">
                    <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-amber-800 dark:text-amber-200">
                      <p className="font-semibold mb-1">Backup Recommendation</p>
                      <p>We recommend exporting your data regularly to prevent data loss. JSON format includes complete data and can be reimported.</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Import Data</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Restore your data from a previous export file (JSON format only).
                  </p>

                  {/* File Upload */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    {importFile ? (
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{importFile.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {(importFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Click to upload file</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">or drag and drop</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">JSON files only</p>
                      </div>
                    )}
                  </div>

                  {/* Import Options */}
                  {importFile && (
                    <div className="mt-6 space-y-3">
                      <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <input
                          type="checkbox"
                          checked={importOptions.replaceExisting}
                          onChange={(e) => setImportOptions({ ...importOptions, replaceExisting: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">Replace existing data</span>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Warning: This will delete all current data</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <input
                          type="checkbox"
                          checked={importOptions.includeActivities}
                          onChange={(e) => setImportOptions({ ...importOptions, includeActivities: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Include activity history</span>
                      </label>
                    </div>
                  )}

                  {/* Import Result */}
                  {importResult && (
                    <div className={`mt-6 p-4 rounded-lg border-2 ${
                      importResult.success
                        ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
                    }`}>
                      <div className="flex gap-3">
                        <svg className={`w-5 h-5 flex-shrink-0 ${
                          importResult.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {importResult.success ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          )}
                        </svg>
                        <div className={`text-sm ${
                          importResult.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                        }`}>
                          {importResult.success ? (
                            <>
                              <p className="font-semibold mb-1">Import Successful!</p>
                              <p>
                                Imported {importResult.imported?.boards} boards, {importResult.imported?.templates} templates.
                                Page will reload shortly...
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="font-semibold mb-1">Import Failed</p>
                              <p>{importResult.error}</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Import Button */}
                  <button
                    onClick={handleImport}
                    disabled={!importFile || importResult?.success === true}
                    className="w-full mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                  >
                    Import Data
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
