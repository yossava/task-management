'use client';

import React from 'react';
import { User } from '@/lib/types';
import { UserService } from '@/lib/services/userService';

interface UserAvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
}

export default function UserAvatar({
  user,
  size = 'md',
  showName = false,
  className = ''
}: UserAvatarProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const initials = UserService.getInitials(user);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-semibold text-white`}
        style={{ backgroundColor: user.color }}
        title={`${user.name} (${user.email})`}
      >
        {initials}
      </div>
      {showName && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {user.name}
        </span>
      )}
    </div>
  );
}
