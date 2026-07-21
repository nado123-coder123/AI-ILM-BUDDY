# ILM Buddy — Website

Next.js (App Router, TypeScript, Tailwind) website for ILM Buddy, replacing
the earlier React Native mobile app. Deploys to Vercel.

**Verified:** `npm run build` (production build, Turbopack) completes with
zero errors — all 6 routes compile, typecheck, and prerender as static
pages. `next start` was booted and every route smoke-tested to a 200.

## Pages

| Route | Backend endpoints used |
|---|---|
| `/` | — (static) |
| `/chat` | `POST /chat` |
| `/prayer-times` | `GET /prayer-times`, `GET /qibla` (uses browser geolocation) |
| `/calendar` | `GET /calendar/hijri-date`, `GET /calendar/ramadan-countdown` |
| `/zakat` | `POST /zakat/calculate` |
| `/duas` | `GET /duas`, `GET /duas/categories` |

## Why the backend is NOT also on Vercel

The FastAPI backend keeps a `sentence-transformers` embedding model and a
FAISS index loaded in memory for the RAG chatbot. Vercel's serverless
functions are stateless per invocation — every cold start would reload
that model from scratch, which is slow and burns compute unnecessarily.
Host the backend somewhere that keeps a process warm instead:
**Render, Fly.io, Railway, or a small VM/Cloud Run instance** all work
well and have straightforward FastAPI deploy guides. Point this frontend
at whichever URL you land on.

## Local development

```bash
npm install
cp .env.local.example .env.local   # point at your backend
npm run dev
```

Visit `http://localhost:3000`.

## Deploying to Vercel

1. Push this project to a GitHub repo.
2. In Vercel: **New Project** → import the repo → framework auto-detects
   as Next.js.
3. Add the environment variable before your first deploy:
   - `NEXT_PUBLIC_API_BASE_URL` = your deployed backend's URL (e.g.
     `https://ilm-buddy-api.onrender.com`)
4. Deploy. Because `NEXT_PUBLIC_*` vars are baked in at build time, if you
   change this later you need to **redeploy**, not just restart.

## Design

Same palette as the original mobile design — deep teal (`#0B3D3A`) + warm
gold (`#C9A961`) on warm off-white, drawn from mosque tilework rather than
a generic light-mode default — plus the same signature element (a thin
gold divider with a rotated square) between an assistant's answer and its
cited sources. `tailwind.config.js` holds all the tokens.

## Next slices (not built yet)

- CORS: the backend's `CORSMiddleware` currently allows `*` — once you
  know your Vercel domain, lock `CORS_ORIGINS` in the backend's `.env` to
  that domain specifically.
- Auth (Firebase Auth client SDK) — needed before wiring up Tasbeeh, which
  the backend now requires a verified token for.
- Remaining feature pages: Tasbeeh, Quran Reader, Hadith Library, Mosque
  Finder, Education Hub, Profile.
- A live device-compass version of the Qibla page (this one shows a fixed
  bearing, not a real-time heading — that needs the Device Orientation
  API and a user gesture to request permission on iOS Safari).
