# Development README — Mammoth ReServe

This helper README shows how to run the project locally with the Gemini (Google GenAI) proxy server. It assumes you're on Windows (PowerShell) and developing with the repo at the project root.

Important: keep your API key secret. Do NOT commit a real `.env` to the repository.

## Files of interest
- `server/index.js` — small Express proxy that calls the Google GenAI SDK server-side.
- `services/geminiService.ts` — client-side service that calls the local proxy (`/api/genai/*`) when running in the browser.
- `.env.example` — shows environment variables you need to set (copy to `.env`).

## Configure environment
1. Copy the example `.env` and add your API key:
```powershell
copy .env.example .env
# then open .env in an editor and set GEMINI_API_KEY to your key
```

2. Verify `.env` is ignored by git — `.env` is included in `.gitignore` by default.

## Install dependencies
```powershell
npm install
```

This will install frontend deps and the server deps used by `server/index.js` (Express + `@google/genai`).

## Run the app locally (recommended)
The repo includes a convenience script to run both the proxy server and Vite dev server concurrently.

Start both with:
```powershell
npm run dev:all
```

What this does:
- Starts Express proxy server on the port in `.env` (default `5174`). The server requires `GEMINI_API_KEY` to be set and will exit if it's missing.
- Starts the Vite dev server (default port `3000`) and proxies `/api/*` requests to the Express server (see `vite.config.ts`).

Open the app at: http://localhost:3000

## Run servers separately
If you prefer separate terminals:

Start the server (reads `.env`):
```powershell
npm run start:server
```

Start the frontend:
```powershell
npm run dev
```

## API endpoints (proxy)
The local proxy exposes these endpoints for the frontend:
- `POST /api/genai/analyze` — body: `{ base64Image: string }` returns JSON with `{ foodName, summary, observations, estimatedServings, estimatedWeightLbs }`.
- `POST /api/genai/alert` — body: `{ foodItem: string, servings: number }` returns `{ alertMessage }`.
- `GET /api/health` — returns `{ ok: true }`.

The frontend calls the proxy at `/api/genai/*`; Vite dev server proxies `/api` to the running `server/index.js` in development.

## Troubleshooting
- Server exits with `GEMINI_API_KEY not set`: copy `.env.example` to `.env` and set `GEMINI_API_KEY`.
- If calls to `/api` fail in the browser:
  - Ensure the Express server is running (port 5174 by default).
  - Ensure CORS/network issues are not blocking requests (server enables `cors`).
  - The client tries same-origin `/api/*` and falls back to `http://localhost:5174` if needed.
- If uploads are large and requests fail, increase the request body limit in `server/index.js` (currently `10mb` via `bodyParser.json({ limit: '10mb' })`).

## Security
- Never commit `.env` or API keys. Use `.env` locally and a secrets manager in production.
- For production, host the proxy on a secure server, enforce authentication and rate limiting, and never expose the API key to the client.

## Next steps (optional)
- Integrate the proxy into Vite dev middleware so you only need `npm run dev`.
- Add a lightweight auth layer to the server to protect the proxy endpoints.
- Add logging and request validation for the proxy server.

If you want, I can add Vite middleware integration so you don't need to run two processes in dev — say the word and I'll make that change.
