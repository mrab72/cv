import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import hljs from 'highlight.js/lib/core';
import python from 'highlight.js/lib/languages/python';
import 'highlight.js/styles/github-dark.css';

hljs.registerLanguage('python', python);

const EXAMPLES = [
  'elevator',
  'hotel',
  'library',
  'parkinglot',
  'rate-limitor',
  'task-scheduler',
  'vending-machine'
];

export async function generateStaticParams() {
  return EXAMPLES.map((slug) => ({
    slug,
  }));
}

function getExampleCode(slug: string): string | null {
  try {
    const filePath = path.join(process.cwd(), 'maintainable-code', `${slug}.py`);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return null;
  }
}

function formatTitle(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function ExamplePage({
  params
}: {
  params: { slug: string }
}) {
  const code = getExampleCode(params.slug);

  if (!code) {
    notFound();
  }

  const highlightedCode = hljs.highlight(code, { language: 'python' }).value;
  const title = formatTitle(params.slug);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
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
              Maintainable Code Example
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              {title}
            </h1>
          </header>

          <div className="overflow-x-auto">
            <pre className="rounded-lg">
              <code
                className="hljs language-python text-sm"
                dangerouslySetInnerHTML={{ __html: highlightedCode }}
              />
            </pre>
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
