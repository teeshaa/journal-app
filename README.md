# Tech Leader Journal

A digital journal app for tech leaders to reflect, grow, and track progress.

**Live App:** [https://techleader-journal.vercel.app/](https://techleader-journal.vercel.app/)

---

## Features

- **Theme Picker:** Choose from Technology, Delivery, Business, Team, Org Impact
- **Dynamic Prompts:** AI-generated reflection prompts per theme
- **Rich Editor:** Headings, lists, markdown, image upload
- **Past Entries:** Chronological feed with markdown and image lightbox
- **Streak Tracker:** Contribution heatmap, streak stats
- **Bookmarks & Tags:** Flag entries, auto-extracted tags
- **Auth:** Passwordless magic-link via Supabase

---

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Configure environment**
   - Copy `.env.example` to `.env.local`
   - Fill in:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `GROQ_API_KEY`
3. **Run locally**
   ```bash
   npm run dev
   # App runs at http://localhost:3000
   ```

---

## Deployment

- Deployed on Vercel: [https://techleader-journal.vercel.app/](https://techleader-journal.vercel.app/)
- Add the following env vars in Vercel project settings:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `GROQ_API_KEY`

---

## Tech Stack

- Next.js 14, React 18, TypeScript, TailwindCSS
- Supabase (PostgreSQL, Auth, Storage)
- Groq Inference - With Llama 3.3 70b

---

## Scripts

- `npm run dev` – Start dev server
- `npm run build` – Production build
- `npm start` – Serve build locally

---

## Auth & Data

- Passwordless login via Supabase magic link
- Entries, tags, and images stored in Supabase

---

## History

- View and manage all past entries in a chronological feed

---
