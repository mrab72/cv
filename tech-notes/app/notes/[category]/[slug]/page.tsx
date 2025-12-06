import { getNote, getAllNotes } from '@/lib/notes';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import 'highlight.js/styles/github-dark.css';

export async function generateStaticParams() {
  const notes = getAllNotes();
  return notes.map((note) => ({
    category: note.category,
    slug: note.slug,
  }));
}

export default function NotePage({
  params
}: {
  params: { category: string; slug: string }
}) {
  const note = getNote(params.category, params.slug);

  if (!note) {
    notFound();
  }

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

        <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 md:p-12">
          <header className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-6">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
              {params.category}
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              {note.title}
            </h1>
          </header>

          <div className="markdown prose prose-lg dark:prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight, rehypeRaw]}
            >
              {note.content}
            </ReactMarkdown>
          </div>
        </article>

        <footer className="mt-8 text-center">
          <Link
            href="/"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to all notes
          </Link>
        </footer>
      </div>
    </div>
  );
}
