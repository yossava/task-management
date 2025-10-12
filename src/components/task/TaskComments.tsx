'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { TaskComment } from '@/lib/types';
import toast from 'react-hot-toast';

interface TaskCommentsProps {
  taskId: string;
  comments: TaskComment[];
  onUpdate: () => void;
}

export default function TaskComments({ taskId, comments, onUpdate }: TaskCommentsProps) {
  const { data: session } = useSession();
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Optimistic state for comments
  const [optimisticComments, setOptimisticComments] = useState<TaskComment[]>(comments);

  // Sync optimistic comments with prop changes
  useEffect(() => {
    setOptimisticComments(comments);
  }, [comments]);

  const handleAddComment = async () => {
    if (!newComment.trim() || isSubmitting) return;

    const author = session?.user?.email || session?.user?.name || 'Guest User';
    const tempId = `temp-comment-${Date.now()}`;
    const now = new Date();

    // Create optimistic comment
    const optimisticComment: TaskComment = {
      id: tempId,
      content: newComment.trim(),
      author,
      authorId: 'temp',
      createdAt: now,
      updatedAt: now,
    };

    // Store original state for rollback
    const originalComments = optimisticComments;

    // Optimistically add comment to UI
    setOptimisticComments([optimisticComment, ...originalComments]);
    setNewComment('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: optimisticComment.content, author }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add comment');
      }

      const result = await response.json();

      // Replace the optimistic comment with the real one from the server
      setOptimisticComments(prev =>
        prev.map(c => c.id === tempId ? result.comment : c)
      );

      toast.success('Comment added');
    } catch (error) {
      console.error('Error adding comment:', error);
      // Rollback optimistic update on error
      setOptimisticComments(originalComments);
      setNewComment(optimisticComment.content); // Restore the text
      toast.error(error instanceof Error ? error.message : 'Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = (commentId: string) => {
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
      setEditingId(commentId);
      setEditContent(comment.content);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editContent.trim() || isSubmitting) return;

    // Store original state for rollback
    const originalComments = optimisticComments;
    const originalEditContent = editContent;

    // Optimistically update comment in UI
    const updatedComments = optimisticComments.map(c =>
      c.id === editingId
        ? { ...c, content: editContent.trim(), updatedAt: new Date() }
        : c
    );
    setOptimisticComments(updatedComments);
    setEditingId(null);
    setEditContent('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/tasks/${taskId}/comments?commentId=${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: originalEditContent.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update comment');
      }

      const result = await response.json();

      // Update with the real comment from server
      setOptimisticComments(prev =>
        prev.map(c => c.id === editingId ? result.comment : c)
      );

      toast.success('Comment updated');
    } catch (error) {
      console.error('Error updating comment:', error);
      // Rollback optimistic update on error
      setOptimisticComments(originalComments);
      setEditingId(editingId);
      setEditContent(originalEditContent);
      toast.error(error instanceof Error ? error.message : 'Failed to update comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;

    // Store original state for rollback
    const originalComments = optimisticComments;

    // Optimistically remove comment from UI
    const updatedComments = optimisticComments.filter(c => c.id !== commentId);
    setOptimisticComments(updatedComments);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/tasks/${taskId}/comments?commentId=${commentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete comment');
      }

      // Comment already removed from optimistic state, no need to update again
      toast.success('Comment deleted');
    } catch (error) {
      console.error('Error deleting comment:', error);
      // Rollback optimistic update on error
      setOptimisticComments(originalComments);
      toast.error(error instanceof Error ? error.message : 'Failed to delete comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimestamp = (timestamp: number | Date) => {
    const date = typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime();
    const now = Date.now();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return new Date(date).toLocaleDateString('default', {
      month: 'short',
      day: 'numeric',
      year: now - date > 31536000000 ? 'numeric' : undefined,
    });
  };

  const sortedComments = [...optimisticComments].sort((a, b) => {
    const aTime = typeof a.createdAt === 'number' ? a.createdAt : new Date(a.createdAt).getTime();
    const bTime = typeof b.createdAt === 'number' ? b.createdAt : new Date(b.createdAt).getTime();
    return bTime - aTime;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Comments ({optimisticComments.length})
        </h3>
      </div>

      {/* Add Comment */}
      <div className="flex gap-2">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              handleAddComment();
            }
          }}
          placeholder="Add a comment... (Cmd/Ctrl+Enter to submit)"
          className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={2}
        />
        <button
          onClick={handleAddComment}
          disabled={!newComment.trim() || isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
        >
          Post
        </button>
      </div>

      {/* Comments List */}
      {sortedComments.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
          No comments yet. Be the first to comment!
        </div>
      ) : (
        <div className="space-y-3">
          {sortedComments.map((comment) => (
            <div
              key={comment.id}
              className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
            >
              {editingId === comment.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      disabled={!editContent.trim() || isSubmitting}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditContent('');
                      }}
                      className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-medium">
                          {comment.author.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {comment.author}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTimestamp(comment.createdAt)}
                          {comment.updatedAt &&
                            (typeof comment.updatedAt === 'number'
                              ? comment.updatedAt !== comment.createdAt
                              : new Date(comment.updatedAt).getTime() !== (typeof comment.createdAt === 'number' ? comment.createdAt : new Date(comment.createdAt).getTime())
                            ) && ' (edited)'}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditComment(comment.id)}
                        disabled={isSubmitting}
                        className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50"
                        title="Edit comment"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={isSubmitting}
                        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                        title="Delete comment"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                    {comment.content}
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
