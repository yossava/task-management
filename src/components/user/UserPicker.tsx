'use client';

import React, { useState, useMemo } from 'react';
import { User } from '@/lib/types';
import { UserService } from '@/lib/services/userService';
import UserAvatar from './UserAvatar';

interface UserPickerProps {
  selectedUserIds: string[];
  onSelectionChange: (userIds: string[]) => void;
  multiple?: boolean;
  placeholder?: string;
}

export default function UserPicker({
  selectedUserIds,
  onSelectionChange,
  multiple = true,
  placeholder = 'Search users...',
}: UserPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const allUsers = UserService.getAll();
  const selectedUsers = UserService.getByIds(selectedUserIds);

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return allUsers;
    return UserService.search(searchQuery);
  }, [searchQuery, allUsers]);

  const handleToggleUser = (userId: string) => {
    if (multiple) {
      if (selectedUserIds.includes(userId)) {
        onSelectionChange(selectedUserIds.filter((id) => id !== userId));
      } else {
        onSelectionChange([...selectedUserIds, userId]);
      }
    } else {
      onSelectionChange([userId]);
      setIsOpen(false);
    }
  };

  const handleRemoveUser = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectionChange(selectedUserIds.filter((id) => id !== userId));
  };

  return (
    <div className="relative">
      {/* Selected Users Display */}
      <div
        className="min-h-[42px] p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedUsers.length === 0 ? (
          <div className="text-gray-400 dark:text-gray-500 text-sm py-1">
            {placeholder}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-full pl-1 pr-2 py-1"
              >
                <UserAvatar user={user} size="sm" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {user.name}
                </span>
                <button
                  onClick={(e) => handleRemoveUser(user.id, e)}
                  className="ml-1 text-gray-500 hover:text-red-500 transition-colors"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Content */}
          <div className="absolute z-20 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-80 overflow-hidden">
            {/* Search Input */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>

            {/* User List */}
            <div className="overflow-y-auto max-h-60">
              {filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                  No users found
                </div>
              ) : (
                filteredUsers.map((user) => {
                  const isSelected = selectedUserIds.includes(user.id);
                  return (
                    <div
                      key={user.id}
                      className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                      onClick={() => handleToggleUser(user.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <UserAvatar user={user} size="md" />
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {user.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {user.email}
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <svg
                            className="w-5 h-5 text-blue-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
