# Deployment Guide for tech-notes.maryammasinan.me

## Overview
This Next.js project is configured for static export and Vercel deployment.

## What's Included

### Content Structure
- **Rust Notes**: Located in `/rust/` directory
  - Includes interactive visualizations (tokio-concurrency-visualization.html, tokio-diagrams.html)
- **Database Notes**: Located in `/database/` directory
- **System Design Notes**: Located in `/system-design/` directory
  - Rate Limiter project with interactive Token Bucket demo

### Interactive Features
- **Token Bucket Demo**: `/demos/token-bucket` - Interactive visualization of rate limiting algorithm
- **HTML Visualizations**: Static HTML files served from `/public/demos/`

## Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Set up tech notes site for deployment"
git push origin main
```

### 2. Deploy to Vercel

#### Option A: Vercel Dashboard
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings
5. Click "Deploy"

#### Option B: Vercel CLI
```bash
npm install -g vercel
vercel login
vercel
# Follow the prompts
```

### 3. Configure Custom Subdomain

In Vercel Dashboard:
1. Go to your project → Settings → Domains
2. Add domain: `tech-notes.maryammasinan.me`
3. Vercel will provide DNS configuration:
   - Type: CNAME
   - Name: tech-notes
   - Value: cname.vercel-dns.com

### 4. Update DNS Settings

In your domain provider (where maryammasinan.me is registered):
1. Go to DNS settings
2. Add a new CNAME record:
   ```
   Type: CNAME
   Host: tech-notes
   Value: cname.vercel-dns.com
   TTL: 3600 (or Auto)
   ```
3. Save changes (may take 5-60 minutes to propagate)

### 5. Verify Deployment

Once DNS propagates, visit:
- https://tech-notes.maryammasinan.me
- Should see your notes homepage

## Project Structure

```
notes/
├── app/
│   ├── layout.tsx              # Root layout with metadata
│   ├── page.tsx                # Homepage with category listings
│   ├── globals.css             # Tailwind + markdown styles
│   ├── notes/[category]/[slug]/
│   │   └── page.tsx            # Dynamic note pages
│   └── demos/
│       └── token-bucket/
│           └── page.tsx        # Interactive token bucket demo
├── lib/
│   └── notes.ts                # Note loading logic
├── public/
│   └── demos/                  # Static HTML files
├── rust/                       # Markdown notes
├── database/                   # Markdown notes
├── system-design/              # Markdown notes
└── Configuration files
```

## Updating Content

### Adding New Notes
1. Add `.md` file to appropriate directory (rust/, database/, system-design/)
2. Optionally add frontmatter:
   ```markdown
   ---
   title: My Note Title
   description: Brief description
   ---

   # Content here
   ```
3. Build and deploy:
   ```bash
   npm run build
   git add . && git commit -m "Add new note" && git push
   ```
4. Vercel auto-deploys on push

### Adding New Categories
1. Create new directory at root level
2. Update `lib/notes.ts` to include new category in `categories` array
3. Add markdown files to new directory

### Adding Static Files (HTML/JS)
1. Place files in `public/demos/`
2. Link from markdown using `/demos/filename.html`

## Local Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev
# Visit http://localhost:3000

# Build for production
npm run build

# Preview production build
npm start
```

## Troubleshooting

### Build Errors
- Check that all markdown files are valid
- Ensure no broken links in markdown
- Verify all imports are correct

### DNS Not Propagating
- Wait up to 60 minutes
- Check DNS with: `nslookup tech-notes.maryammasinan.me`
- Clear DNS cache: `sudo dscacheutil -flushcache` (macOS)

### Styling Issues
- Verify Tailwind classes are in `content` array in `tailwind.config.ts`
- Check that `globals.css` is imported in `layout.tsx`

## Next Steps

After deploying tech-notes:
1. Update main site (maryammasinan.me) to link to tech-notes subdomain
2. Add link in navigation or footer
3. Consider adding blog/changelog functionality

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
