'use client';

import { useState } from 'react';
import type { TeamMember } from '@/lib/types/scrum';

interface TeamMemberCardProps {
  member: TeamMember;
  onEdit: (member: TeamMember) => void;
  onRemove: (id: string) => void;
}

export default function TeamMemberCard({ member, onEdit, onRemove }: TeamMemberCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const getRoleColor = (role: TeamMember['role']) => {
    switch (role) {
      case 'product-owner':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
      case 'scrum-master':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'developer':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'tester':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  const getRoleLabel = (role: TeamMember['role']) => {
    switch (role) {
      case 'product-owner':
        return 'Product Owner';
      case 'scrum-master':
        return 'Scrum Master';
      case 'developer':
        return 'Developer';
      case 'tester':
        return 'Tester';
    }
  };

  const getRoleIcon = (role: TeamMember['role']) => {
    switch (role) {
      case 'product-owner':
        return '👔';
      case 'scrum-master':
        return '🎯';
      case 'developer':
        return '💻';
      case 'tester':
        return '🧪';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const effectiveCapacity = Math.round((member.capacity * member.availability) / 100);
  const joinedDate = new Date(member.joinedAt).toLocaleDateString();

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 hover:shadow-lg transition-shadow relative">
      {/* Menu Button */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <svg
            className="w-5 h-5 text-gray-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
            <button
              onClick={() => {
                onEdit(member);
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit Member
            </button>
            <button
              onClick={() => {
                if (confirm(`Remove ${member.name} from the team?`)) {
                  onRemove(member.id);
                }
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 flex items-center gap-2"
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Remove
            </button>
          </div>
        )}
      </div>

      {/* Avatar */}
      <div className="flex items-start gap-4 mb-4">
        <div className="relative">
          {member.avatar && (member.avatar.startsWith('http://') || member.avatar.startsWith('https://')) ? (
            <img
              src={member.avatar}
              alt={member.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : member.avatar ? (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-4xl shadow-lg">
              {member.avatar}
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
              {getInitials(member.name)}
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 text-2xl">
            {getRoleIcon(member.role)}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {member.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {member.email}
          </p>
          <span
            className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(
              member.role
            )}`}
          >
            {getRoleLabel(member.role)}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
            Capacity
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {member.capacity}
            <span className="text-sm font-normal text-gray-600 dark:text-gray-400 ml-1">
              pts
            </span>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
            Availability
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {member.availability}
            <span className="text-sm font-normal text-gray-600 dark:text-gray-400 ml-1">
              %
            </span>
          </div>
        </div>
      </div>

      {/* Effective Capacity */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Effective Capacity
          </span>
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {effectiveCapacity} pts
          </span>
        </div>
        <div className="mt-2 w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300"
            style={{ width: `${member.availability}%` }}
          ></div>
        </div>
      </div>

      {/* Skills */}
      {member.skills && member.skills.length > 0 && (
        <div className="mb-4">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
            Skills
          </div>
          <div className="flex flex-wrap gap-2">
            {member.skills.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-full"
              >
                {skill}
              </span>
            ))}
            {member.skills.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                +{member.skills.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Joined Date */}
      <div className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
            clipRule="evenodd"
          />
        </svg>
        Joined {joinedDate}
      </div>
    </div>
  );
}
