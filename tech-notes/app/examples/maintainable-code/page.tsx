import Link from 'next/link';

const EXAMPLES = [
  { slug: 'elevator', title: 'Elevator System', description: 'Object-oriented elevator system design' },
  { slug: 'hotel', title: 'Hotel Booking System', description: 'Hotel room reservation and management' },
  { slug: 'library', title: 'Library Management System', description: 'Book lending and management system' },
  { slug: 'parkinglot', title: 'Parking Lot System', description: 'Multi-level parking lot management' },
  { slug: 'rate-limitor', title: 'Rate Limiter', description: 'Token bucket rate limiting implementation' },
  { slug: 'task-scheduler', title: 'Task Scheduler', description: 'Priority-based task scheduling system' },
  { slug: 'vending-machine', title: 'Vending Machine', description: 'State machine-based vending system' },
];

export default function MaintainableCodeExamples() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <nav className="mb-8">
          <Link
            href="/"
            className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center"
          >
            ← Back to all notes
          </Link>
        </nav>

        <header className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Maintainable Code Examples
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Object-oriented design patterns and best practices demonstrated through practical examples
          </p>
        </header>

        <div className="grid gap-6">
          {EXAMPLES.map((example) => (
            <Link
              key={example.slug}
              href={`/examples/maintainable-code/${example.slug}`}
              className="block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200 dark:border-gray-700"
            >
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                {example.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {example.description}
              </p>
              <div className="mt-4 text-blue-600 dark:text-blue-400 hover:underline">
                View code →
              </div>
            </Link>
          ))}
        </div>

        <footer className="mt-12">
          <Link
            href="/notes/maintainable-code/gist"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Read the Design Guide
          </Link>
        </footer>
      </div>
    </div>
  );
}
