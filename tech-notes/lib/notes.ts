import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const notesDirectory = path.join(process.cwd());

export interface Note {
  slug: string;
  title: string;
  category: string;
  content: string;
  description?: string;
}

function formatTitle(filename: string): string {
  return filename
    .replace('.md', '')
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function getAllNotes(): Note[] {
  const notes: Note[] = [];
  const categories = ['rust', 'database', 'system-design', 'maintainable-code'];

  categories.forEach((category) => {
    const categoryPath = path.join(notesDirectory, category);

    if (!fs.existsSync(categoryPath)) {
      return;
    }

    const files = fs.readdirSync(categoryPath);

    files.forEach((filename) => {
      if (filename.endsWith('.md')) {
        const slug = filename.replace('.md', '');
        const fullPath = path.join(categoryPath, filename);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);

        notes.push({
          slug,
          category,
          title: data.title || formatTitle(filename),
          content,
          description: data.description,
        });
      }
    });

    // Also check subdirectories (like rate-limitor in system-design)
    files.forEach((item) => {
      const itemPath = path.join(categoryPath, item);
      if (fs.statSync(itemPath).isDirectory()) {
        const subFiles = fs.readdirSync(itemPath);
        subFiles.forEach((subFilename) => {
          if (subFilename.endsWith('.md')) {
            const slug = `${item}-${subFilename.replace('.md', '')}`;
            const fullPath = path.join(itemPath, subFilename);
            const fileContents = fs.readFileSync(fullPath, 'utf8');
            const { data, content } = matter(fileContents);

            notes.push({
              slug,
              category,
              title: data.title || formatTitle(subFilename),
              content,
              description: data.description,
            });
          }
        });
      }
    });
  });

  return notes;
}

export function getNote(category: string, slug: string): Note | null {
  const notes = getAllNotes();
  return notes.find(note => note.category === category && note.slug === slug) || null;
}
