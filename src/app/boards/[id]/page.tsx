import { notFound } from 'next/navigation';

interface BoardPageProps {
  params: Promise<{ id: string }>;
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Board: {id}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Board detail view - Coming in Phase 2
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <p className="text-gray-600 dark:text-gray-400 text-center">
          Board functionality will be implemented in Phase 2
        </p>
      </div>
    </div>
  );
}
