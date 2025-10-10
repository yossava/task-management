import { User } from '@/lib/types';
import { StorageService } from '@/lib/storage';

const USERS_KEY = 'users';
const CURRENT_USER_KEY = 'current_user';

export class UserService {
  /**
   * Get all users
   */
  static getAll(): User[] {
    const users = StorageService.get<User[]>(USERS_KEY, []);
    return users.length > 0 ? users : this.getDefaultUsers();
  }

  /**
   * Get default demo users
   */
  static getDefaultUsers(): User[] {
    const defaultUsers: User[] = [
      {
        id: 'user-1',
        name: 'You',
        email: 'you@example.com',
        color: '#3B82F6',
        avatar: undefined,
      },
      {
        id: 'user-2',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        color: '#10B981',
        avatar: undefined,
      },
      {
        id: 'user-3',
        name: 'Bob Smith',
        email: 'bob@example.com',
        color: '#F59E0B',
        avatar: undefined,
      },
      {
        id: 'user-4',
        name: 'Carol White',
        email: 'carol@example.com',
        color: '#8B5CF6',
        avatar: undefined,
      },
    ];

    StorageService.set(USERS_KEY, defaultUsers);
    return defaultUsers;
  }

  /**
   * Get user by ID
   */
  static getById(id: string): User | null {
    const users = this.getAll();
    return users.find((user) => user.id === id) || null;
  }

  /**
   * Get current user
   */
  static getCurrentUser(): User {
    const currentUserId = StorageService.get<string>(CURRENT_USER_KEY, '');
    if (currentUserId) {
      const user = this.getById(currentUserId);
      if (user) return user;
    }

    // Default to first user
    const users = this.getAll();
    return users[0];
  }

  /**
   * Set current user
   */
  static setCurrentUser(userId: string): boolean {
    const user = this.getById(userId);
    if (!user) return false;

    StorageService.set(CURRENT_USER_KEY, userId);
    return true;
  }

  /**
   * Create a new user
   */
  static create(userData: Omit<User, 'id'>): User {
    const users = this.getAll();
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    users.push(newUser);
    StorageService.set(USERS_KEY, users);

    return newUser;
  }

  /**
   * Update a user
   */
  static update(id: string, updates: Partial<Omit<User, 'id'>>): boolean {
    const users = this.getAll();
    const index = users.findIndex((u) => u.id === id);

    if (index === -1) return false;

    users[index] = { ...users[index], ...updates };
    StorageService.set(USERS_KEY, users);

    return true;
  }

  /**
   * Delete a user
   */
  static delete(id: string): boolean {
    const users = this.getAll();
    const filtered = users.filter((u) => u.id !== id);

    if (filtered.length === users.length) return false;

    StorageService.set(USERS_KEY, filtered);

    // If deleted user was current user, switch to first user
    const currentUserId = StorageService.get<string>(CURRENT_USER_KEY, '');
    if (currentUserId === id && filtered.length > 0) {
      this.setCurrentUser(filtered[0].id);
    }

    return true;
  }

  /**
   * Get users by IDs
   */
  static getByIds(ids: string[]): User[] {
    const users = this.getAll();
    return users.filter((user) => ids.includes(user.id));
  }

  /**
   * Search users by name or email
   */
  static search(query: string): User[] {
    const users = this.getAll();
    const lowerQuery = query.toLowerCase();

    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(lowerQuery) ||
        user.email.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get user initials for avatar
   */
  static getInitials(user: User): string {
    const names = user.name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  }
}
