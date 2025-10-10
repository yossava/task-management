'use client';

import { useState, useEffect } from 'react';
import { SprintReviewService, StoryService } from '@/lib/services/scrumService';
import type { SprintReview, Feedback, UserStory } from '@/lib/types/scrum';

interface SprintReviewBoardProps {
  sprintId: string;
  sprintName: string;
}

export default function SprintReviewBoard({ sprintId, sprintName }: SprintReviewBoardProps) {
  const [review, setReview] = useState<SprintReview | null>(null);
  const [stories, setStories] = useState<UserStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [newFeedback, setNewFeedback] = useState({ stakeholder: '', comment: '', sentiment: 'neutral' as Feedback['sentiment'] });

  // Load existing review or create new one
  useEffect(() => {
    const sprintStories = StoryService.getBySprintId(sprintId);
    setStories(sprintStories);

    const existing = SprintReviewService.getBySprintId(sprintId);
    if (existing) {
      setReview(existing);
    } else {
      const newReview: Omit<SprintReview, 'id' | 'createdAt'> = {
        sprintId,
        date: new Date().toISOString().split('T')[0],
        attendees: [],
        demonstratedStories: [],
        stakeholderFeedback: [],
        acceptedStories: [],
        rejectedStories: [],
        createdBy: 'current-user',
      };
      const created = SprintReviewService.create(newReview);
      setReview(created);
    }
    setLoading(false);
  }, [sprintId]);

  const toggleStoryDemonstrated = (storyId: string) => {
    if (!review) return;

    const updates: Partial<SprintReview> = {
      demonstratedStories: review.demonstratedStories.includes(storyId)
        ? review.demonstratedStories.filter(id => id !== storyId)
        : [...review.demonstratedStories, storyId],
    };

    const updated = SprintReviewService.update(review.id, updates);
    if (updated) setReview(updated);
  };

  const acceptStory = (storyId: string) => {
    if (!review) return;

    const updates: Partial<SprintReview> = {
      acceptedStories: [...review.acceptedStories.filter(id => id !== storyId), storyId],
      rejectedStories: review.rejectedStories.filter(id => id !== storyId),
    };

    const updated = SprintReviewService.update(review.id, updates);
    if (updated) setReview(updated);
  };

  const rejectStory = (storyId: string) => {
    if (!review) return;

    const updates: Partial<SprintReview> = {
      rejectedStories: [...review.rejectedStories.filter(id => id !== storyId), storyId],
      acceptedStories: review.acceptedStories.filter(id => id !== storyId),
    };

    const updated = SprintReviewService.update(review.id, updates);
    if (updated) setReview(updated);
  };

  const addFeedback = () => {
    if (!review || !newFeedback.stakeholder.trim() || !newFeedback.comment.trim()) return;

    const feedback: Feedback = {
      id: Date.now().toString(),
      stakeholder: newFeedback.stakeholder,
      comment: newFeedback.comment,
      sentiment: newFeedback.sentiment,
      createdAt: new Date().toISOString(),
    };

    const updates: Partial<SprintReview> = {
      stakeholderFeedback: [...review.stakeholderFeedback, feedback],
    };

    const updated = SprintReviewService.update(review.id, updates);
    if (updated) {
      setReview(updated);
      setNewFeedback({ stakeholder: '', comment: '', sentiment: 'neutral' });
    }
  };

  const deleteFeedback = (feedbackId: string) => {
    if (!review) return;

    const updates: Partial<SprintReview> = {
      stakeholderFeedback: review.stakeholderFeedback.filter(f => f.id !== feedbackId),
    };

    const updated = SprintReviewService.update(review.id, updates);
    if (updated) setReview(updated);
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!review) {
    return <div className="text-center py-8">Unable to load sprint review</div>;
  }

  const doneStories = stories.filter(s => s.status === 'done');
  const demonstratedStories = stories.filter(s => review.demonstratedStories.includes(s.id));
  const acceptedStories = stories.filter(s => review.acceptedStories.includes(s.id));
  const rejectedStories = stories.filter(s => review.rejectedStories.includes(s.id));

  const sentimentColors = {
    positive: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300',
    neutral: 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300',
    negative: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Sprint Review
        </h2>
        <p className="text-gray-600 dark:text-gray-400">{sprintName}</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Done Stories</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{doneStories.length}</div>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Demonstrated</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{demonstratedStories.length}</div>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Accepted</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{acceptedStories.length}</div>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Rejected</div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{rejectedStories.length}</div>
        </div>
      </div>

      {/* Stories Review */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Story Review
        </h3>
        {doneStories.length > 0 ? (
          <div className="space-y-3">
            {doneStories.map((story) => {
              const isDemonstrated = review.demonstratedStories.includes(story.id);
              const isAccepted = review.acceptedStories.includes(story.id);
              const isRejected = review.rejectedStories.includes(story.id);

              return (
                <div
                  key={story.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                        {story.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {story.description}
                      </p>
                      <div className="flex items-center gap-2">
                        {story.storyPoints && (
                          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                            {story.storyPoints} pts
                          </span>
                        )}
                        {isAccepted && (
                          <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
                            ✓ Accepted
                          </span>
                        )}
                        {isRejected && (
                          <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded">
                            ✗ Rejected
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => toggleStoryDemonstrated(story.id)}
                        className={`px-3 py-1.5 text-xs rounded transition-colors ${
                          isDemonstrated
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {isDemonstrated ? 'Demonstrated' : 'Demo'}
                      </button>
                      {isDemonstrated && (
                        <>
                          <button
                            onClick={() => acceptStory(story.id)}
                            className={`px-3 py-1.5 text-xs rounded transition-colors ${
                              isAccepted
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-green-600 hover:text-white'
                            }`}
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => rejectStory(story.id)}
                            className={`px-3 py-1.5 text-xs rounded transition-colors ${
                              isRejected
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-red-600 hover:text-white'
                            }`}
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-500 py-8">
            No completed stories in this sprint
          </div>
        )}
      </div>

      {/* Stakeholder Feedback */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Stakeholder Feedback
        </h3>

        {/* Add Feedback Form */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <input
              type="text"
              value={newFeedback.stakeholder}
              onChange={(e) => setNewFeedback({ ...newFeedback, stakeholder: e.target.value })}
              placeholder="Stakeholder name..."
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
            <select
              value={newFeedback.sentiment}
              onChange={(e) => setNewFeedback({ ...newFeedback, sentiment: e.target.value as Feedback['sentiment'] })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            >
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>
          </div>
          <div className="flex gap-2">
            <textarea
              value={newFeedback.comment}
              onChange={(e) => setNewFeedback({ ...newFeedback, comment: e.target.value })}
              placeholder="Add feedback comment..."
              rows={2}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
            <button
              onClick={addFeedback}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {/* Feedback List */}
        {review.stakeholderFeedback.length > 0 ? (
          <div className="space-y-3">
            {review.stakeholderFeedback.map((feedback) => (
              <div
                key={feedback.id}
                className={`border-2 rounded-lg p-4 ${sentimentColors[feedback.sentiment]}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{feedback.stakeholder}</span>
                      <span className="text-xs px-2 py-0.5 bg-white/50 dark:bg-black/20 rounded">
                        {feedback.sentiment}
                      </span>
                    </div>
                    <p className="text-sm">{feedback.comment}</p>
                  </div>
                  <button
                    onClick={() => deleteFeedback(feedback.id)}
                    className="text-xs hover:underline ml-4"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-500 py-6">
            No feedback yet
          </div>
        )}
      </div>
    </div>
  );
}
