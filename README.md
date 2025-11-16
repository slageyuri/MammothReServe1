# Mammoth ReServe

Connecting campus surplus food with students and local organizations — fast, safe, and with a little help from AI.

## Overview
Mammoth ReServe is a React + TypeScript application that helps a university dining hall efficiently route surplus food to students, student groups, and local food banks. The app streamlines donation logging, highlights availability in real time, and uses Gemini to generate concise pickup alerts and image-based estimates of servings/weight to reduce waste and improve safety.

## Intent & Problems We’re Solving
- Reduce campus food waste by making excess meals visible and reservable.
- Lower coordination friction between dining staff and community partners.
- Provide quick, consistent summaries (and estimates) for donated items.
- Encourage safe use via clear safety/allergen context and simple confirmations.

## What It Does
- Role-based entry points:
  - Student: browse available items, reserve servings, and track pickups.
  - Dining Hall Staff: log donations with photos, approve/revoke organizations, and manage pickup confirmations.
  - Student Groups / Food Banks: sign in to receive and coordinate donations.
- AI assistance via Gemini:
  - Image Analysis: estimates servings and weight; summarizes observations to help set expectations.
  - Alert Generation: creates a concise, friendly message for quick broadcasts.
- Clean, mobile-friendly UI with clear flows for donation, reservation, and confirmation.

## Key Features
- Donation logging with optional photo upload and safety/allergen details.
- AI-generated summary and estimates for faster, consistent posting.
- Reservation workflow with pickup time and partial/all servings.
- Dining staff dashboards for user approvals and pickup confirmations.
- Role-based navigation and sign-in/register flows for organizations.

## Architecture
- Frontend (Vite/React/TS):
  - SPA served by Vite during development on `http://localhost:3000`.
  - Proxies API calls from `/api/*` to the local server.
- Backend (Express proxy):
  - Runs on `http://localhost:5174` by default.
  - Calls Gemini through `@google/genai` strictly on the server (API key never sent to the browser).
  - Endpoints:
    - `POST /api/genai/analyze` → `{ base64Image }` → `{ foodName, summary, observations[], estimatedServings, estimatedWeightLbs }`
    - `POST /api/genai/alert` → `{ foodItem, servings }` → `{ alertMessage }`
    - `GET /api/health` → `{ ok: true }`

## Tech Stack
- Frontend: React 19, TypeScript 5.8, Vite 6, Tailwind CSS (CDN), Recharts.
- Backend: Node.js (ESM), Express 4, `@google/genai` (Gemini), `cors`, `body-parser`, `dotenv`.
- Dev tooling: `concurrently` (optional dual-run), Vite proxy for `/api`.

## Run Locally

**Prerequisites:** Node.js 18+ and a Gemini API key

1) Install dependencies
```powershell
npm install
```

2) Configure your API key (server-side only)
- Option A: create `.env` (or `.env.local`) and set `GEMINI_API_KEY=your_key`
- Option B: copy the example and edit it
```powershell
copy .env.example .env
# then open .env and set GEMINI_API_KEY
```

3) Start the Gemini proxy server (Terminal 1)
```powershell
npm run start:server
```

4) Start the Vite dev server (Terminal 2)
```powershell
npm run dev
```

App: http://localhost:3000  (Vite proxies `/api/*` to the server on port 5174)

Optional: start both together (may not work in some shells)
```powershell
npm run dev:all
```

## Usage Walkthrough
1. Role Selection: Choose Student, Dining Hall Staff, or Organization.
2. Dining Hall Staff:
   - Add donations with optional photos and safety/allergen details.
   - Review and approve/revoke organizations.
   - Confirm pickups as completed.
3. Students / Organizations:
   - Browse available items; reserve servings and specify pickup time.
   - Track reservations and pickups.

## Security & Privacy
- API key stays on the server; never expose `GEMINI_API_KEY` to the client.
- Use `.env` locally and a proper secrets manager in production.
- Consider adding rate limiting and authentication before internet exposure.

## Roadmap Ideas
- AuthN/AuthZ for proxy endpoints and role management.
- Historical analytics on surplus patterns and pickup rates.
- Automated notification integrations (email/SMS/Slack).
- Accessibility and localization improvements.

## Acknowledgments
- Built with React, Vite, and the Google Gemini SDK.
- Logo: `mammoth.png` used throughout the UI.