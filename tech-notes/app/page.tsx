import Link from 'next/link';
import { getAllNotes } from '@/lib/notes';

export default function Home() {
  const notes = getAllNotes();

  // Group notes by category
  const notesByCategory = notes.reduce((acc, note) => {
    if (!acc[note.category]) {
      acc[note.category] = [];
    }
    acc[note.category].push(note);
    return acc;
  }, {} as Record<string, typeof notes>);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <header className="mb-16 text-center">
          <h1 className="text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            Tech Notes
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Technical notes and learning resources
          </p>
          <div className="mt-4">
            <a
              href="https://maryammasinan.me"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Back to main site
            </a>
          </div>
        </header>

        <main className="space-y-12">
          {Object.entries(notesByCategory).map(([category, categoryNotes]) => (
            <section key={category} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <h2 className="text-3xl font-bold mb-6 capitalize text-gray-900 dark:text-white border-b pb-3 border-gray-200 dark:border-gray-700">
                {category}
              </h2>
              <div className="grid gap-4">
                {categoryNotes.map((note) => (
                  <Link
                    key={note.slug}
                    href={`/notes/${note.category}/${note.slug}`}
                    className="block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all duration-200"
                  >
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {note.title}
                    </h3>
                    {note.description && (
                      <p className="text-gray-600 dark:text-gray-400">
                        {note.description}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </main>

        <footer className="mt-16 text-center text-gray-600 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Maryam Masinan</p>
        </footer>
      </div>
    </div>
  );
}
