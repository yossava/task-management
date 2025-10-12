'use client';

import React, { useState } from 'react';
import { BoardTask } from '@/lib/types';
import { UserService } from '@/lib/services/userService';
import UserPicker from './UserPicker';
import UserAvatar from './UserAvatar';
import toast from 'react-hot-toast';

interface AssigneeSectionProps {
  taskId: string;
  task: BoardTask;
  onUpdate: () => void;
}

export default function AssigneeSection({
  taskId,
  task,
  onUpdate,
}: AssigneeSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const assignedUsers = task.assigneeIds
    ? UserService.getByIds(task.assigneeIds)
    : [];

  const handleAssigneeChange = async (userIds: string[]) => {
    setLoading(true);
    try {
      // Add new assignees
      const currentIds = task.assigneeIds || [];
      const toAdd = userIds.filter(id => !currentIds.includes(id));
      const toRemove = currentIds.filter(id => !userIds.includes(id));

      // Add assignees
      for (const assigneeId of toAdd) {
        const response = await fetch(`/api/tasks/${taskId}/assignees`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assigneeId }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to add assignee');
        }
      }

      // Remove assignees
      for (const assigneeId of toRemove) {
        const response = await fetch(`/api/tasks/${taskId}/assignees?assigneeId=${assigneeId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to remove assignee');
        }
      }

      onUpdate();
      setIsEditing(false);
      toast.success('Assignees updated');
    } catch (error) {
      console.error('Error updating assignees:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update assignees');
    } finally {
      setLoading(false);
    }
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
                  setLoading(true);
                  try {
                    const response = await fetch(`/api/tasks/${taskId}/assignees?assigneeId=${user.id}`, {
                      method: 'DELETE',
                    });

                    if (!response.ok) {
                      const data = await response.json();
                      throw new Error(data.error || 'Failed to remove assignee');
                    }

                    onUpdate();
                    toast.success('Assignee removed');
                  } catch (error) {
                    console.error('Error removing assignee:', error);
                    toast.error(error instanceof Error ? error.message : 'Failed to remove assignee');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
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
