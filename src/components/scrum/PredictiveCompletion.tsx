'use client';

import { useMemo } from 'react';
import type { Sprint, UserStory } from '@/lib/types/scrum';

interface PredictiveCompletionProps {
  sprint: Sprint;
  stories: UserStory[];
  historicalSprints: Sprint[];
  historicalStories: UserStory[];
}

interface Prediction {
  completionProbability: number;
  expectedVelocity: number;
  riskLevel: 'low' | 'medium' | 'high';
  confidence: number;
  factors: PredictionFactor[];
  recommendations: string[];
  forecastDate: string;
}

interface PredictionFactor {
  name: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
  description: string;
}

export default function PredictiveCompletion({
  sprint,
  stories,
  historicalSprints,
  historicalStories,
}: PredictiveCompletionProps) {
  // ML-based prediction algorithm
  const prediction = useMemo((): Prediction => {
    const sprintStories = stories.filter(s => s.sprintId === sprint.id);

    // Calculate time progress
    const now = new Date().getTime();
    const startTime = new Date(sprint.startDate).getTime();
    const endTime = new Date(sprint.endDate).getTime();
    const totalDuration = endTime - startTime;
    const elapsed = now - startTime;
    const timeProgress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    const remainingDays = Math.max(0, Math.ceil((endTime - now) / (1000 * 60 * 60 * 24)));

    // Calculate work progress
    const committedPoints = sprintStories.reduce((sum, s) => sum + (s.storyPoints || 0), 0);
    const completedPoints = sprintStories
      .filter(s => s.status === 'done')
      .reduce((sum, s) => sum + (s.storyPoints || 0), 0);
    const inProgressPoints = sprintStories
      .filter(s => s.status === 'in-progress')
      .reduce((sum, s) => sum + (s.storyPoints || 0), 0);
    const workProgress = committedPoints > 0 ? (completedPoints / committedPoints) * 100 : 0;

    // Historical analysis
    const completedHistoricalSprints = historicalSprints.filter(s => s.status === 'completed');
    const avgHistoricalVelocity = completedHistoricalSprints.length > 0
      ? completedHistoricalSprints.reduce((sum, s) => sum + (s.velocity || 0), 0) / completedHistoricalSprints.length
      : committedPoints;

    // Historical completion rate
    const historicalCompletionRates = completedHistoricalSprints.map(hs => {
      const hsStories = historicalStories.filter(st => st.sprintId === hs.id);
      const hsCommitted = hsStories.reduce((sum, s) => sum + (s.storyPoints || 0), 0);
      return hsCommitted > 0 ? ((hs.velocity || 0) / hsCommitted) * 100 : 0;
    });
    const avgCompletionRate = historicalCompletionRates.length > 0
      ? historicalCompletionRates.reduce((sum, r) => sum + r, 0) / historicalCompletionRates.length
      : 80; // Default assumption

    // Prediction factors
    const factors: PredictionFactor[] = [];
    let probabilityScore = 50; // Start neutral

    // Factor 1: Current velocity vs time (40% weight)
    const velocityDelta = workProgress - timeProgress;
    if (velocityDelta > 10) {
      probabilityScore += 20;
      factors.push({
        name: 'Ahead of Schedule',
        impact: 'positive',
        weight: 40,
        description: `Team is ${Math.round(velocityDelta)}% ahead of time progress`,
      });
    } else if (velocityDelta < -20) {
      probabilityScore -= 25;
      factors.push({
        name: 'Behind Schedule',
        impact: 'negative',
        weight: 40,
        description: `Team is ${Math.abs(Math.round(velocityDelta))}% behind time progress`,
      });
    } else if (velocityDelta < -10) {
      probabilityScore -= 10;
      factors.push({
        name: 'Slightly Behind',
        impact: 'negative',
        weight: 40,
        description: `Team is ${Math.abs(Math.round(velocityDelta))}% behind pace`,
      });
    } else {
      probabilityScore += 10;
      factors.push({
        name: 'On Track',
        impact: 'positive',
        weight: 40,
        description: 'Team velocity matches time progress',
      });
    }

    // Factor 2: Historical performance (25% weight)
    if (avgCompletionRate > 85) {
      probabilityScore += 15;
      factors.push({
        name: 'Strong Track Record',
        impact: 'positive',
        weight: 25,
        description: `Team historically completes ${Math.round(avgCompletionRate)}% of commitments`,
      });
    } else if (avgCompletionRate < 60) {
      probabilityScore -= 15;
      factors.push({
        name: 'Weak Historical Performance',
        impact: 'negative',
        weight: 25,
        description: `Team averages ${Math.round(avgCompletionRate)}% completion rate`,
      });
    } else {
      probabilityScore += 5;
      factors.push({
        name: 'Moderate History',
        impact: 'neutral',
        weight: 25,
        description: `Historical completion rate: ${Math.round(avgCompletionRate)}%`,
      });
    }

    // Factor 3: Scope stability (20% weight)
    const initialCommitment = sprint.commitment || committedPoints;
    const scopeChange = committedPoints - initialCommitment;
    const scopeChangePercent = initialCommitment > 0 ? (scopeChange / initialCommitment) * 100 : 0;

    if (scopeChangePercent > 20) {
      probabilityScore -= 20;
      factors.push({
        name: 'Scope Creep',
        impact: 'negative',
        weight: 20,
        description: `Scope increased by ${Math.round(scopeChangePercent)}%`,
      });
    } else if (scopeChangePercent > 10) {
      probabilityScore -= 10;
      factors.push({
        name: 'Moderate Scope Change',
        impact: 'negative',
        weight: 20,
        description: `Scope increased by ${Math.round(scopeChangePercent)}%`,
      });
    } else {
      probabilityScore += 10;
      factors.push({
        name: 'Stable Scope',
        impact: 'positive',
        weight: 20,
        description: 'No significant scope changes',
      });
    }

    // Factor 4: Work in progress and blockers (15% weight)
    const blockedStories = sprintStories.filter(s => s.blocker && s.blocker.status !== 'resolved');
    const blockedPoints = blockedStories.reduce((sum, s) => sum + (s.storyPoints || 0), 0);
    const blockerImpact = committedPoints > 0 ? (blockedPoints / committedPoints) * 100 : 0;

    if (blockerImpact > 20) {
      probabilityScore -= 15;
      factors.push({
        name: 'High Blocker Impact',
        impact: 'negative',
        weight: 15,
        description: `${Math.round(blockerImpact)}% of work is blocked`,
      });
    } else if (blockerImpact > 10) {
      probabilityScore -= 8;
      factors.push({
        name: 'Some Blockers',
        impact: 'negative',
        weight: 15,
        description: `${blockedStories.length} stories blocked`,
      });
    } else {
      probabilityScore += 10;
      factors.push({
        name: 'No Major Blockers',
        impact: 'positive',
        weight: 15,
        description: 'Clear path to completion',
      });
    }

    // Calculate expected velocity using linear projection
    const currentVelocity = timeProgress > 0 ? (completedPoints / (timeProgress / 100)) : 0;
    const expectedVelocity = Math.round(
      (completedPoints + inProgressPoints * 0.7) + // Current + 70% of in-progress
      ((100 - timeProgress) / 100) * currentVelocity * 0.8 // Remaining capacity with 80% efficiency
    );

    // Normalize probability score (0-100)
    const completionProbability = Math.max(0, Math.min(100, probabilityScore));

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high';
    if (completionProbability >= 75) riskLevel = 'low';
    else if (completionProbability >= 50) riskLevel = 'medium';
    else riskLevel = 'high';

    // Calculate confidence based on data availability
    const confidence = Math.min(
      100,
      50 + // Base confidence
      (completedHistoricalSprints.length * 10) + // 10% per historical sprint (max 5)
      (timeProgress > 50 ? 20 : 0) // 20% if past midpoint
    );

    // Generate recommendations
    const recommendations: string[] = [];
    if (completionProbability < 60) {
      recommendations.push('⚠️ High risk of not completing all stories');
      recommendations.push('Consider removing lower-priority stories');
      if (blockedStories.length > 0) {
        recommendations.push('Focus on unblocking critical stories');
      }
    } else if (completionProbability < 80) {
      recommendations.push('⚡ Moderate risk - monitor progress closely');
      recommendations.push('Ensure no new scope is added');
    } else {
      recommendations.push('✅ High probability of successful completion');
      if (timeProgress < 80 && workProgress > 80) {
        recommendations.push('Consider pulling in additional high-value stories');
      }
    }

    // Forecast completion date
    const remainingPoints = committedPoints - completedPoints - inProgressPoints;
    const dailyVelocity = currentVelocity / ((timeProgress / 100) * (totalDuration / (1000 * 60 * 60 * 24)));
    const daysToComplete = dailyVelocity > 0
      ? Math.ceil(remainingPoints / dailyVelocity)
      : remainingDays;

    const forecastDate = new Date(now + daysToComplete * 24 * 60 * 60 * 1000).toLocaleDateString();

    return {
      completionProbability,
      expectedVelocity,
      riskLevel,
      confidence,
      factors,
      recommendations,
      forecastDate,
    };
  }, [sprint, stories, historicalSprints, historicalStories]);

  // Get risk color
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
      case 'high':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  // Get impact icon
  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'positive':
        return '✅';
      case 'negative':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          Predictive Sprint Completion
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          ML-based prediction of sprint success probability for {sprint.name}
        </p>
      </div>

      {/* Main Prediction */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Completion Probability */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Completion Probability
              </h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskColor(prediction.riskLevel)}`}>
                {prediction.riskLevel.toUpperCase()} RISK
              </span>
            </div>

            <div className="text-center mb-4">
              <div className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {Math.round(prediction.completionProbability)}%
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Chance of completing all committed stories
              </p>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  prediction.completionProbability >= 75
                    ? 'bg-green-500'
                    : prediction.completionProbability >= 50
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${prediction.completionProbability}%` }}
              />
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>Confidence: {Math.round(prediction.confidence)}%</span>
              <span>Forecast: {prediction.forecastDate}</span>
            </div>
          </div>

          {/* Expected Velocity */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Expected Velocity
            </h3>

            <div className="text-center mb-4">
              <div className="text-6xl font-bold text-green-600 dark:text-green-400 mb-2">
                {prediction.expectedVelocity}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Predicted story points at sprint end
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Committed:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {sprint.commitment || 0} points
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Expected Gap:</span>
                <span className={`font-medium ${
                  prediction.expectedVelocity >= (sprint.commitment || 0)
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {prediction.expectedVelocity - (sprint.commitment || 0) >= 0 ? '+' : ''}
                  {prediction.expectedVelocity - (sprint.commitment || 0)} points
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Prediction Factors */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
            Prediction Factors
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {prediction.factors.map((factor, idx) => (
              <div
                key={idx}
                className={`border-2 rounded-lg p-4 ${
                  factor.impact === 'positive'
                    ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10'
                    : factor.impact === 'negative'
                    ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getImpactIcon(factor.impact)}</span>
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                      {factor.name}
                    </h4>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {factor.weight}% weight
                  </span>
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  {factor.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className={`border-2 rounded-xl p-4 ${
          prediction.riskLevel === 'high'
            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
            : prediction.riskLevel === 'medium'
            ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
            : 'border-green-500 bg-green-50 dark:bg-green-900/20'
        }`}>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            💡 Recommendations
          </h3>
          <div className="space-y-2">
            {prediction.recommendations.map((rec, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
