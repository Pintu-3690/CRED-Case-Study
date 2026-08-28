# Vercel Deployment Guide

### Deployment Architecture
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Serverless API Routes:**
  - `GET /api/case-study` (from `api/case-study.js`)
  - `GET /api/health` (from `api/health.js`)
- **SPA Routing:** Fallback rewrite for all non-API paths to `index.html`.

### Verification Steps
1. Push all changes to GitHub (`git add . && git commit -m "Configure Vercel deployment" && git push`).
2. Import repository on [Vercel](https://vercel.com/dashboard).
3. The project will build and deploy cleanly using `vercel.json` settings.

