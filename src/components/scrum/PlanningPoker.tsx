'use client';

import { useState, useMemo } from 'react';
import type { UserStory, TeamMember, EstimationVote } from '@/lib/types/scrum';

interface PlanningPokerProps {
  story: UserStory;
  teamMembers: TeamMember[];
  currentUser?: string;
  onEstimateComplete: (storyId: string, storyPoints: number, votes: EstimationVote[]) => void;
  onClose: () => void;
}

// Fibonacci sequence for story points
const FIBONACCI_SCALE = [0.5, 1, 2, 3, 5, 8, 13, 20, 40, 100];
const SPECIAL_CARDS = [
  { value: -1, label: '?', description: 'Not sure' },
  { value: -2, label: '☕', description: 'Need a break' },
];

export default function PlanningPoker({
  story,
  teamMembers,
  currentUser = 'Current User',
  onEstimateComplete,
  onClose,
}: PlanningPokerProps) {
  const [votes, setVotes] = useState<EstimationVote[]>([]);
  const [sessionStatus, setSessionStatus] = useState<'voting' | 'revealed' | 'finalized'>('voting');
  const [selectedValue, setSelectedValue] = useState<number | null>(null);

  // Check if current user has voted
  const currentUserVote = votes.find((v) => v.userName === currentUser);
  const hasVoted = !!currentUserVote;

  // Get team members who voted
  const votedMembers = useMemo(() => {
    return teamMembers.filter((m) => votes.some((v) => v.userName === m.name));
  }, [teamMembers, votes]);

  // Calculate voting progress
  const votingProgress = teamMembers.length > 0
    ? Math.round((votedMembers.length / teamMembers.length) * 100)
    : 0;

  // Calculate consensus
  const consensus = useMemo(() => {
    if (sessionStatus !== 'revealed' || votes.length === 0) return null;

    const validVotes = votes.filter((v) => typeof v.value === 'number' && v.value >= 0);
    if (validVotes.length === 0) return null;

    const values = validVotes.map((v) => v.value as number);
    const uniqueValues = Array.from(new Set(values));

    // Perfect consensus: all same value
    if (uniqueValues.length === 1) {
      return { value: uniqueValues[0], level: 'perfect' as const };
    }

    // Strong consensus: all within 1 Fibonacci step
    const sorted = uniqueValues.sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const minIndex = FIBONACCI_SCALE.indexOf(min);
    const maxIndex = FIBONACCI_SCALE.indexOf(max);

    if (minIndex !== -1 && maxIndex !== -1 && maxIndex - minIndex <= 1) {
      const median = sorted[Math.floor(sorted.length / 2)];
      return { value: median, level: 'strong' as const };
    }

    // Weak consensus: suggest average rounded to nearest Fibonacci
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    const nearest = FIBONACCI_SCALE.reduce((prev, curr) =>
      Math.abs(curr - avg) < Math.abs(prev - avg) ? curr : prev
    );
    return { value: nearest, level: 'weak' as const };
  }, [votes, sessionStatus]);

  // Handle vote submission
  const handleVote = (value: number) => {
    setSelectedValue(value);
  };

  const submitVote = () => {
    if (selectedValue === null) return;

    const newVote: EstimationVote = {
      userId: currentUser, // In real app, use actual user ID
      userName: currentUser,
      value: selectedValue,
      votedAt: new Date().toISOString(),
    };

    // Replace existing vote or add new one
    const updatedVotes = votes.filter((v) => v.userName !== currentUser);
    setVotes([...updatedVotes, newVote]);
    setSelectedValue(null);
  };

  // Reveal votes
  const handleReveal = () => {
    setSessionStatus('revealed');
  };

  // Start new round
  const handleVoteAgain = () => {
    setVotes([]);
    setSelectedValue(null);
    setSessionStatus('voting');
  };

  // Finalize estimation
  const handleFinalize = (finalValue: number) => {
    onEstimateComplete(story.id, finalValue, votes);
    setSessionStatus('finalized');
  };

  // Get vote display value
  const getVoteDisplay = (vote: EstimationVote) => {
    if (typeof vote.value === 'number') {
      if (vote.value === -1) return '?';
      if (vote.value === -2) return '☕';
      return vote.value.toString();
    }
    return String(vote.value);
  };

  // Get card color based on value
  const getCardColor = (value: number) => {
    if (value === selectedValue) {
      return 'bg-blue-600 text-white border-blue-700';
    }
    if (value < 0) {
      return 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600';
    }
    if (value <= 3) {
      return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900/30';
    }
    if (value <= 8) {
      return 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700 hover:bg-yellow-100 dark:hover:bg-yellow-900/30';
    }
    return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900/30';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6 z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Planning Poker
                </h2>
                {sessionStatus === 'voting' && (
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-full">
                    Voting in Progress
                  </span>
                )}
                {sessionStatus === 'revealed' && (
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium rounded-full">
                    Votes Revealed
                  </span>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Collaborate with your team to estimate story complexity
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Story Details */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {story.title}
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">{story.description}</p>
          {story.acceptanceCriteria.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Acceptance Criteria:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                {story.acceptanceCriteria.map((criteria, idx) => (
                  <li key={idx}>{criteria}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Voting Progress */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Voting Progress
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {votedMembers.length} / {teamMembers.length} voted
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{ width: `${votingProgress}%` }}
            />
          </div>
        </div>

        {/* Voting Area */}
        {sessionStatus === 'voting' && (
          <div className="p-6 space-y-6">
            {/* Team Member Votes (Hidden) */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Team Members
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {teamMembers.map((member) => {
                  const hasVoted = votes.some((v) => v.userName === member.name);
                  return (
                    <div
                      key={member.id}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        hasVoted
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-300">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {member.name}
                          </p>
                          {hasVoted && (
                            <p className="text-xs text-green-600 dark:text-green-400">Voted</p>
                          )}
                        </div>
                        {hasVoted && (
                          <svg
                            className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Voting Cards */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {hasVoted ? 'Your vote has been submitted' : 'Select your estimate'}
              </h4>

              {/* Fibonacci Cards */}
              <div className="grid grid-cols-5 md:grid-cols-10 gap-3 mb-3">
                {FIBONACCI_SCALE.map((value) => (
                  <button
                    key={value}
                    onClick={() => handleVote(value)}
                    disabled={hasVoted}
                    className={`aspect-[3/4] rounded-xl border-2 font-bold text-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${getCardColor(
                      value
                    )}`}
                  >
                    {value}
                  </button>
                ))}
              </div>

              {/* Special Cards */}
              <div className="grid grid-cols-2 gap-3">
                {SPECIAL_CARDS.map((card) => (
                  <button
                    key={card.value}
                    onClick={() => handleVote(card.value)}
                    disabled={hasVoted}
                    className={`p-4 rounded-xl border-2 font-bold text-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${getCardColor(
                      card.value
                    )}`}
                    title={card.description}
                  >
                    {card.label} - {card.description}
                  </button>
                ))}
              </div>

              {/* Submit Vote Button */}
              {selectedValue !== null && !hasVoted && (
                <button
                  onClick={submitVote}
                  className="w-full mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Submit Vote ({selectedValue === -1 ? '?' : selectedValue === -2 ? '☕' : selectedValue})
                </button>
              )}
            </div>

            {/* Reveal Button */}
            {votes.length >= teamMembers.length && (
              <button
                onClick={handleReveal}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Reveal All Votes
              </button>
            )}
          </div>
        )}

        {/* Revealed Votes */}
        {sessionStatus === 'revealed' && (
          <div className="p-6 space-y-6">
            {/* Consensus Indicator */}
            {consensus && (
              <div
                className={`p-4 rounded-xl border-2 ${
                  consensus.level === 'perfect'
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                    : consensus.level === 'strong'
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                    : 'bg-orange-50 dark:bg-orange-900/20 border-orange-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  {consensus.level === 'perfect' && (
                    <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 dark:text-white text-lg">
                      {consensus.level === 'perfect' && 'Perfect Consensus!'}
                      {consensus.level === 'strong' && 'Strong Consensus'}
                      {consensus.level === 'weak' && 'Weak Consensus - Discussion Recommended'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Suggested estimate: <span className="font-bold">{consensus.value} points</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Vote Results */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Team Votes
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {votes.map((vote) => (
                  <div
                    key={vote.userName}
                    className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-lg font-medium text-gray-600 dark:text-gray-300 mx-auto mb-2">
                        {vote.userName.charAt(0).toUpperCase()}
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate mb-1">
                        {vote.userName}
                      </p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {getVoteDisplay(vote)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleVoteAgain}
                className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Vote Again
              </button>
              {consensus && (
                <button
                  onClick={() => handleFinalize(consensus.value)}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Finalize Estimate ({consensus.value} points)
                </button>
              )}
            </div>
          </div>
        )}

        {/* Finalized */}
        {sessionStatus === 'finalized' && (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Estimation Complete!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Story has been estimated at {story.storyPoints} points
            </p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
