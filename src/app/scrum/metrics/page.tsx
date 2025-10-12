'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useScrum } from '@/lib/hooks/useScrum';
import ScrumLayout from '@/components/scrum/ScrumLayout';

export default function MetricsRedirectPage() {
  const router = useRouter();
  const { sprints, loading } = useScrum();

  useEffect(() => {
    if (!loading) {
      // Find active sprint or use the first sprint
      const activeSprint = sprints.sprints.find((s) => s.status === 'active');
      const targetSprint = activeSprint || sprints.sprints[0];

      if (targetSprint) {
        // Redirect to metrics page with sprint ID
        router.replace(`/scrum/metrics/${targetSprint.id}`);
      }
    }
  }, [loading, sprints, router]);

  if (loading) {
    return (
      <ScrumLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
          <div className="flex items-center justify-center h-screen">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </ScrumLayout>
    );
  }

  // If no sprints exist, show message
  if (sprints.sprints.length === 0) {
    return (
      <ScrumLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Sprint Data Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create and start a sprint to see metrics and analytics
              </p>
              <button
                onClick={() => router.push('/scrum/planning')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Go to Planning
              </button>
            </div>
          </div>
        </div>
      </ScrumLayout>
    );
  }

  return (
    <ScrumLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="flex items-center justify-center h-screen">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    </ScrumLayout>
  );
}
