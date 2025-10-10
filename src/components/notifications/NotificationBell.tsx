'use client';

import { useState, useEffect } from 'react';
import { NotificationService } from '@/lib/services/notificationService';

interface NotificationBellProps {
  onClick: () => void;
  isOpen: boolean;
}

export default function NotificationBell({ onClick, isOpen }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const updateUnreadCount = () => {
      const unread = NotificationService.getUnread();
      setUnreadCount(unread.length);
    };

    updateUnreadCount();

    // Update every 30 seconds
    const interval = setInterval(updateUnreadCount, 30000);

    // Listen for storage changes (from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'pm_app_notifications') {
        updateUnreadCount();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <button
      onClick={onClick}
      className={`relative p-2 rounded-lg transition-all duration-200 ${
        isOpen
          ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
      title="Notifications"
    >
      {/* Bell Icon */}
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>

      {/* Unread Badge */}
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-gradient-to-br from-red-500 to-pink-600 rounded-full shadow-lg animate-pulse">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
}
