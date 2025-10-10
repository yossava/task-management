import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface KeyboardShortcutHandlers {
  onSearch?: () => void;
  onHelp?: () => void;
  onNewBoard?: () => void;
  onNewTask?: () => void;
  onExport?: () => void;
  onTemplate?: () => void;
  onToggleFilters?: () => void;
  onBoardView?: () => void;
  onListView?: () => void;
  onCalendarView?: () => void;
}

export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers) {
  const router = useRouter();

  useEffect(() => {
    let sequenceBuffer = '';
    let sequenceTimeout: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcuts when typing in input fields
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Allow Cmd/Ctrl+K and Esc even in input fields
        if (!(((e.metaKey || e.ctrlKey) && e.key === 'k') || e.key === 'Escape')) {
          return;
        }
      }

      // Cmd/Ctrl + K - Global Search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        handlers.onSearch?.();
        return;
      }

      // ? - Show keyboard shortcuts help
      if (e.key === '?' && !e.shiftKey) {
        e.preventDefault();
        handlers.onHelp?.();
        return;
      }

      // Esc is handled by individual components
      // Single key shortcuts (only when not in input)
      if (
        target.tagName !== 'INPUT' &&
        target.tagName !== 'TEXTAREA' &&
        !target.isContentEditable
      ) {
        switch (e.key.toLowerCase()) {
          case 'n':
            e.preventDefault();
            handlers.onNewBoard?.();
            break;

          case 'c':
            e.preventDefault();
            handlers.onNewTask?.();
            break;

          case 't':
            e.preventDefault();
            handlers.onTemplate?.();
            break;

          case 'e':
            e.preventDefault();
            handlers.onExport?.();
            break;

          case 'f':
            e.preventDefault();
            handlers.onToggleFilters?.();
            break;

          case '1':
            e.preventDefault();
            handlers.onBoardView?.();
            break;

          case '2':
            e.preventDefault();
            handlers.onListView?.();
            break;

          case '3':
            e.preventDefault();
            handlers.onCalendarView?.();
            break;

          case 'g':
            // Start sequence
            sequenceBuffer = 'g';
            clearTimeout(sequenceTimeout);
            sequenceTimeout = setTimeout(() => {
              sequenceBuffer = '';
            }, 1000);
            break;

          case 'b':
            if (sequenceBuffer === 'g') {
              e.preventDefault();
              router.push('/boards');
              sequenceBuffer = '';
            }
            break;

          case 'h':
            if (sequenceBuffer === 'g') {
              e.preventDefault();
              router.push('/');
              sequenceBuffer = '';
            }
            break;
        }
      }

      // Cmd/Ctrl + Enter - Quick save
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        // This will be handled by individual forms
        const event = new CustomEvent('quicksave');
        window.dispatchEvent(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(sequenceTimeout);
    };
  }, [handlers, router]);
}
