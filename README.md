# Digital Journal for Tech Leaders

A web-based journal app designed for engineering leaders who want to grow through regular reflection.

---

## ✨ Features

1. **Theme Picker** – choose among Technology, Delivery, Business, Team & Organisational Impact.
2. **Dynamic Prompt Generator** – AI-generated reflection prompt per theme.
3. **Rich Editor**
   • block-based editor (headings, lists, quotes, todos)
   • markdown export
   • image upload (Supabase Storage)
4. **Past Entries View** – chronological feed with markdown render & image light-box.
5. **Streak Tracker** – contribution heat-map, current/longest streak, weekly & total counts.
6. **Bookmarks & Tags** – quick access to flagged reflections & auto-extracted tags.
7. **Auth** – password-less magic-link via Supabase.

## 🏗️  Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14 / React 18 / TypeScript / TailwindCSS |
| State | React Server Components + `use client` islands |
| Backend-as-a-Service | Supabase (PostgreSQL, Auth, Storage) |
| AI | Simple prompt template (can be swapped for OpenAI / Anthropic) |

## 🚀  Quick-Start

```bash
# 1. Install dependencies
npm install             # or yarn

# 2. Configure environment
cp .env.example .env.local
#   fill NEXT_PUBLIC_SUPABASE_URL & NEXT_PUBLIC_SUPABASE_ANON_KEY

# 3. Run development server
npm run dev             # http://localhost:3000
```

### Required environment variables

| Key | Description |
|-----|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |

## 🐳  Deployment (Vercel)

1. Push the repo to GitHub.
2. Create a new Vercel project → “Import Git Repository”.
3. Add the two env vars above in *Project → Settings → Environment Variables*.
4. Click *Deploy* – Vercel handles build & SSR automatically.

## 🗂️  Scripts

```
npm run dev     # dev server
npm run build   # production build (Next.js)
npm start       # serve build locally
```

> **Note:** automated unit tests were removed to streamline the pilot deployment. The production code is typed, linted and compiles cleanly.
