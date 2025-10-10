'use client';

import { useState, useMemo } from 'react';
import { Board, BoardTask } from '@/lib/types';
import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface CalendarViewProps {
  boards: Board[];
  onTaskUpdate?: (boardId: string, taskId: string, updates: Partial<BoardTask>) => void;
}

interface CalendarTask extends BoardTask {
  boardId: string;
  boardTitle: string;
  boardColor?: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: CalendarTask[];
}

function CalendarDayCell({ day, tasks }: { day: CalendarDay; tasks: CalendarTask[] }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `calendar-day-${day.date.toISOString()}`,
    data: {
      type: 'calendar-day',
      date: day.date.getTime(),
    },
  });

  const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6;

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[120px] border border-gray-200 dark:border-gray-700 p-2 transition-all ${
        !day.isCurrentMonth ? 'bg-gray-50 dark:bg-gray-900 opacity-50' : 'bg-white dark:bg-gray-800'
      } ${isWeekend && day.isCurrentMonth ? 'bg-blue-50/30 dark:bg-blue-950/30' : ''} ${
        day.isToday ? 'ring-2 ring-blue-500 ring-inset' : ''
      } ${isOver ? 'bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-400' : ''}`}
    >
      <div className="flex items-center justify-between mb-1">
        <span
          className={`text-sm font-semibold ${
            day.isToday
              ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center'
              : !day.isCurrentMonth
              ? 'text-gray-400 dark:text-gray-600'
              : 'text-gray-700 dark:text-gray-300'
          }`}
        >
          {day.date.getDate()}
        </span>
        {tasks.length > 0 && (
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">
            {tasks.length}
          </span>
        )}
      </div>

      <div className="space-y-1 overflow-hidden">
        {tasks.slice(0, 3).map((task) => (
          <CalendarTaskItem key={task.id} task={task} />
        ))}
        {tasks.length > 3 && (
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-1">
            +{tasks.length - 3} more
          </div>
        )}
      </div>
    </div>
  );
}

function CalendarTaskItem({ task }: { task: CalendarTask }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'calendar-task',
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isOverdue = task.dueDate && task.dueDate < Date.now() && !task.completed;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`text-xs p-1.5 rounded cursor-grab active:cursor-grabbing transition-all ${
        task.completed
          ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 line-through'
          : isOverdue
          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700'
          : task.color
          ? 'text-gray-800 dark:text-gray-200'
          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
      }`}
      style={{
        ...style,
        backgroundColor: task.completed ? undefined : task.color ? `${task.color}20` : undefined,
        borderLeft: task.color && !task.completed ? `3px solid ${task.color}` : undefined,
      }}
    >
      <div className="flex items-center gap-1 truncate">
        <div
          className={`flex-shrink-0 w-1.5 h-1.5 rounded-full`}
          style={{ backgroundColor: task.boardColor || '#3b82f6' }}
        />
        <span className="truncate">{task.text}</span>
      </div>
    </div>
  );
}

export default function CalendarView({ boards, onTaskUpdate }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get all tasks with due dates from all boards
  const allTasks = useMemo(() => {
    const tasks: CalendarTask[] = [];
    boards.forEach((board) => {
      board.tasks?.forEach((task) => {
        if (task.dueDate) {
          tasks.push({
            ...task,
            boardId: board.id,
            boardTitle: board.title,
            boardColor: board.color,
          });
        }
      });
    });
    return tasks;
  }, [boards]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);

    // Start from the last Monday before or on the first day
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - ((startDate.getDay() + 6) % 7));

    // End on the Sunday after or on the last day
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + ((7 - endDate.getDay()) % 7));

    const days: CalendarDay[] = [];
    const currentDateObj = new Date(startDate);

    while (currentDateObj <= endDate) {
      const dateString = currentDateObj.toDateString();
      const today = new Date().toDateString();

      // Find tasks for this day
      const dayTasks = allTasks.filter((task) => {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        return taskDate.toDateString() === dateString;
      });

      days.push({
        date: new Date(currentDateObj),
        isCurrentMonth: currentDateObj.getMonth() === month,
        isToday: dateString === today,
        tasks: dayTasks,
      });

      currentDateObj.setDate(currentDateObj.getDate() + 1);
    }

    return days;
  }, [currentDate, allTasks]);

  // Group days into weeks
  const weeks = useMemo(() => {
    const weeksArray: CalendarDay[][] = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeksArray.push(calendarDays.slice(i, i + 7));
    }
    return weeksArray;
  }, [calendarDays]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const taskStats = useMemo(() => {
    const total = allTasks.length;
    const completed = allTasks.filter(t => t.completed).length;
    const overdue = allTasks.filter(t => t.dueDate && t.dueDate < Date.now() && !t.completed).length;
    const dueSoon = allTasks.filter(t => {
      if (!t.dueDate || t.completed) return false;
      const daysUntilDue = (t.dueDate - Date.now()) / (1000 * 60 * 60 * 24);
      return daysUntilDue > 0 && daysUntilDue <= 7;
    }).length;

    return { total, completed, overdue, dueSoon };
  }, [allTasks]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">{monthName}</h2>
          <div className="flex gap-2">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Previous month"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors font-medium"
            >
              Today
            </button>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Next month"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white/20 rounded-lg p-3">
            <div className="text-sm opacity-90">Total Tasks</div>
            <div className="text-2xl font-bold">{taskStats.total}</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <div className="text-sm opacity-90">Completed</div>
            <div className="text-2xl font-bold">{taskStats.completed}</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <div className="text-sm opacity-90">Due Soon</div>
            <div className="text-2xl font-bold text-yellow-200">{taskStats.dueSoon}</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <div className="text-sm opacity-90">Overdue</div>
            <div className="text-2xl font-bold text-red-200">{taskStats.overdue}</div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div
              key={day}
              className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="space-y-0">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7">
              {week.map((day, dayIndex) => (
                <CalendarDayCell key={dayIndex} day={day} tasks={day.tasks} />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-600 to-purple-600" />
            <span className="text-gray-600 dark:text-gray-400">Today</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700" />
            <span className="text-gray-600 dark:text-gray-400">Has tasks</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700" />
            <span className="text-gray-600 dark:text-gray-400">Overdue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-50/30 dark:bg-blue-950/30" />
            <span className="text-gray-600 dark:text-gray-400">Weekend</span>
          </div>
        </div>
      </div>
    </div>
  );
}
