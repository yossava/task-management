const STORAGE_VERSION = '1.0.0';

export const STORAGE_KEYS = {
  // UI preferences only - all data now stored in database
  SETTINGS: 'pm_app_settings',
  NOTIFICATIONS: 'pm_app_notifications',
  VERSION: 'pm_app_version',
} as const;

export class StorageService {
  private static checkVersion(): void {
    if (typeof window === 'undefined') return;

    const version = localStorage.getItem(STORAGE_KEYS.VERSION);
    if (!version) {
      localStorage.setItem(STORAGE_KEYS.VERSION, STORAGE_VERSION);
    } else if (version !== STORAGE_VERSION) {
      console.warn('Storage version mismatch. Migration may be needed.');
    }
  }

  static get<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;

    try {
      this.checkVersion();
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  }

  static set<T>(key: string, value: T): boolean {
    if (typeof window === 'undefined') return false;

    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      if (error instanceof DOMException && error.code === 22) {
        console.error('localStorage quota exceeded');
      } else {
        console.error('Error writing to localStorage:', error);
      }
      return false;
    }
  }

  static remove(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  }

  static clear(): void {
    if (typeof window === 'undefined') return;

    const keysToKeep = [STORAGE_KEYS.SETTINGS];
    const settings = keysToKeep.map(key => ({
      key,
      value: localStorage.getItem(key),
    }));

    localStorage.clear();

    settings.forEach(({ key, value }) => {
      if (value) localStorage.setItem(key, value);
    });

    localStorage.setItem(STORAGE_KEYS.VERSION, STORAGE_VERSION);
  }
}
