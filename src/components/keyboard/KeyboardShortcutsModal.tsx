'use client';

interface Shortcut {
  key: string;
  description: string;
  category: string;
}

interface KeyboardShortcutsModalProps {
  onClose: () => void;
}

const SHORTCUTS: Shortcut[] = [
  // Navigation
  { key: 'Ctrl/⌘ + K', description: 'Open global search', category: 'Navigation' },
  { key: '?', description: 'Show keyboard shortcuts', category: 'Navigation' },
  { key: 'Esc', description: 'Close modal/dialog', category: 'Navigation' },
  { key: 'G then B', description: 'Go to Boards page', category: 'Navigation' },
  { key: 'G then H', description: 'Go to Home page', category: 'Navigation' },

  // Board Actions
  { key: 'N', description: 'Create new board', category: 'Board Actions' },
  { key: 'T', description: 'Use template', category: 'Board Actions' },
  { key: 'E', description: 'Export/Import data', category: 'Board Actions' },
  { key: 'F', description: 'Toggle filters', category: 'Board Actions' },

  // Task Actions
  { key: 'C', description: 'Create new task', category: 'Task Actions' },
  { key: 'Enter', description: 'Save task/form', category: 'Task Actions' },
  { key: 'Ctrl/⌘ + Enter', description: 'Quick save and create new', category: 'Task Actions' },

  // View Controls
  { key: '1', description: 'Board view', category: 'View Controls' },
  { key: '2', description: 'List view', category: 'View Controls' },
  { key: '3', description: 'Calendar view', category: 'View Controls' },
];

const CATEGORY_COLORS: Record<string, string> = {
  'Navigation': 'from-blue-500 to-indigo-500',
  'Board Actions': 'from-purple-500 to-pink-500',
  'Task Actions': 'from-green-500 to-emerald-500',
  'View Controls': 'from-orange-500 to-amber-500',
};

export default function KeyboardShortcutsModal({ onClose }: KeyboardShortcutsModalProps) {
  const categories = Array.from(new Set(SHORTCUTS.map(s => s.category)));

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Keyboard Shortcuts</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Master the shortcuts to boost your productivity</p>
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
          </div>

          {/* Content */}
          <div className="p-8 overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categories.map((category) => (
                <div key={category} className="space-y-3">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`h-1 w-12 rounded-full bg-gradient-to-r ${CATEGORY_COLORS[category]}`} />
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                      {category}
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {SHORTCUTS.filter(s => s.category === category).map((shortcut, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {shortcut.description}
                        </span>
                        <kbd className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm">
                          {shortcut.key}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Tips Section */}
            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-2 border-blue-200 dark:border-blue-800 rounded-xl">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-blue-900 dark:text-blue-100 mb-2">Pro Tips</h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1.5">
                    <li>• Press <kbd className="px-1.5 py-0.5 text-xs bg-white dark:bg-blue-900 border border-blue-300 dark:border-blue-700 rounded">?</kbd> anytime to view this help</li>
                    <li>• Combine shortcuts for faster workflows</li>
                    <li>• Most shortcuts work globally across the app</li>
                    <li>• Press <kbd className="px-1.5 py-0.5 text-xs bg-white dark:bg-blue-900 border border-blue-300 dark:border-blue-700 rounded">Esc</kbd> to close any modal or cancel actions</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {SHORTCUTS.length} shortcuts available
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
