'use client';

import React, { useState } from 'react';
import { BoardTask, Board } from '@/lib/types';
import { UserService } from '@/lib/services/userService';
import UserPicker from './UserPicker';
import UserAvatar from './UserAvatar';

interface AssigneeSectionProps {
  board: Board;
  task: BoardTask;
  onUpdate: (boardId: string, updates: Partial<Board>) => Promise<void>;
}

export default function AssigneeSection({
  board,
  task,
  onUpdate,
}: AssigneeSectionProps) {
  const [isEditing, setIsEditing] = useState(false);

  const assignedUsers = task.assigneeIds
    ? UserService.getByIds(task.assigneeIds)
    : [];

  const handleAssigneeChange = async (userIds: string[]) => {
    const updatedTasks = board.tasks.map(t =>
      t.id === task.id ? { ...t, assigneeIds: userIds } : t
    );
    await onUpdate(board.id, { tasks: updatedTasks });
    setIsEditing(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Assignees
        </h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            {assignedUsers.length === 0 ? 'Assign' : 'Edit'}
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <UserPicker
            selectedUserIds={task.assigneeIds || []}
            onSelectionChange={handleAssigneeChange}
            multiple={true}
            placeholder="Select assignees..."
          />
          <button
            onClick={() => setIsEditing(false)}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Cancel
          </button>
        </div>
      ) : assignedUsers.length === 0 ? (
        <div className="text-sm text-gray-500 dark:text-gray-400 italic">
          No assignees yet
        </div>
      ) : (
        <div className="space-y-2">
          {assignedUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <UserAvatar user={user} size="md" showName />
              <button
                onClick={async () => {
                  const newAssignees = task.assigneeIds?.filter(
                    (id) => id !== user.id
                  );
                  const updatedTasks = board.tasks.map(t =>
                    t.id === task.id ? { ...t, assigneeIds: newAssignees || [] } : t
                  );
                  await onUpdate(board.id, { tasks: updatedTasks });
                }}
                className="text-gray-400 hover:text-red-500 transition-colors"
                title="Remove assignee"
              >
                <svg
                  className="w-4 h-4"
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
  );
}
