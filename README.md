# CRED Case Study — React + Node/Express

A redesigned, full-stack version of the CRED fintech case-study infographic:
a Node/Express API serving structured research data, and a React (Vite)
front end rendering it as a dark, glassmorphism, black/white/red themed
business-analysis site.

## Structure

```
cred-analysis/
├── server/          Node.js + Express API
│   ├── data.js       All case-study content (KPIs, SWOT, PESTLE, financials, etc.)
│   └── index.js       Express app: /api/case-study, /api/health, serves client/dist in prod
└── client/          React app (Vite)
    └── src/
        ├── components/   One component per site section
        ├── hooks/         useCaseStudy (data fetch), useReveal (scroll animations)
        ├── chartSetup.js  Shared Chart.js registration
        └── styles/global.css  Design tokens + all component styles
```

## Run in development (two servers, live reload)

```bash
# terminal 1 — API on http://localhost:4000
cd server
npm install
npm run dev

# terminal 2 — React dev server on http://localhost:5173 (proxies /api to :4000)
cd client
npm install
npm run dev
```

Open **http://localhost:5173**.

## Run in production (single server)

```bash
cd client
npm install
npm run build          # outputs client/dist

cd ../server
npm install
npm start               # serves both the API and the built client
```

Open **http://localhost:4000**.

## Deploy on Vercel

The repository includes `vercel.json` and native serverless handlers in
`api/`. Import the repository into Vercel with the repository root as the
project root. The configuration installs and builds the Vite client from
`client/`, publishes `client/dist`, serves the API at `/api/case-study` and
`/api/health`, and rewrites client-side routes to the app shell.

After deployment, verify the site at the Vercel URL and check
`/api/health` returns `{ "ok": true }`.

## Notes on images

The original brief asked for the official CRED logo and a verified photo of
Kunal Shah. This build intentionally uses a stylized text/monogram mark and
an initials avatar instead, since third-party brand assets and a named
public figure's photo can't be safely sourced/licensed inside this
environment. Swap in your own verified, rights-cleared images by replacing
the `.founder-chip__avatar` and `.nav__mark` markup in
`client/src/components/Hero.jsx` and `Navbar.jsx`.

## Editing the research content

Everything text/number-based (KPIs, financials, SWOT, PESTLE, competitor
table, timeline, etc.) lives in one file: `server/data.js`. Edit it and
restart the server — no front-end changes needed.
