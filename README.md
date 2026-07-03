# LookUpClients

Internal client discovery tool for finding local businesses without proper websites and tracking outreach.

Built for a two-person web development team:
- **Anamika** — finds and contacts potential clients
- **Jeet** — builds applications and brands

## Features (MVP)

- Search businesses by location and type (cafes, clinics, schools, etc.)
- Auto-detect website status: no website, social only, has website, unreachable
- Save and manage leads in a simple CRM pipeline
- Track pipeline stages: New → Contacted → Interested → Proposal → Won/Lost
- Dashboard with hot lead counts and recent activity

## Tech Stack

- Next.js 16 (App Router)
- TypeScript + Tailwind CSS
- Prisma 7 + SQLite
- **OpenStreetMap** (Nominatim + Overpass API) — completely free, no API key

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

No paid API keys required. Optionally set `NOMINATIM_USER_AGENT` in `.env` with your contact email (OpenStreetMap policy).

### 3. Run database migrations

```bash
npm run db:migrate
```

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Usage

1. Go to **Find Clients** and search by city + business type
2. Filter for **No Website** or **Social Only** — your best leads
3. Click **Save Lead** on promising businesses
4. Open the lead, add call notes, and update pipeline status
5. Use **Mark Contacted Today** after each outreach call

## Data Source

Business listings come from [OpenStreetMap](https://www.openstreetmap.org/) via:

- **Nominatim** — converts city names to map coordinates (free)
- **Overpass API** — fetches businesses in that area (free)

**Trade-off vs Google Maps:** OSM is free but community-maintained, so some small local businesses may be missing or have incomplete phone/website info. Anamika can still add details manually in lead notes.

## Project Structure

```
src/
  app/
    (dashboard)/     # Main app pages
    api/             # Search, leads, website check
  components/        # UI components
  lib/               # Prisma, OSM search, website checker
prisma/
  schema.prisma      # Lead data model
```

## Next Steps

- [ ] Add login for Jeet and Anamika
- [ ] Follow-up reminders ("call back in 2 weeks")
- [ ] Website quality scoring (outdated design, not mobile-friendly)
- [ ] Export leads to CSV
- [ ] Deploy to Vercel with PostgreSQL
