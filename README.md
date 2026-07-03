# LookUpClients

Internal client discovery tool for finding local businesses without proper websites and tracking outreach.

Built for a two-person web development team:
- **Anamika** — finds and contacts potential clients
- **Jeet** — builds applications and brands

## Features

- Search businesses by location and type (OSM + Geoapify)
- Manual **Add Lead** from Google Maps
- Auto-detect website status
- CRM pipeline: New → Contacted → Interested → Proposal → Won/Lost
- Dashboard with hot lead counts

## Tech Stack

- Next.js 16 (App Router)
- TypeScript + Tailwind CSS
- Prisma 7 + **PostgreSQL (Neon)**
- OpenStreetMap + Geoapify Places API

## Local setup

```bash
npm install
cp .env.example .env
# Add Neon DATABASE_URL and GEOAPIFY_API_KEY to .env
npm run db:migrate:deploy
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to production

See **[DEPLOY.md](./DEPLOY.md)** for step-by-step Vercel + Neon instructions.

## Usage

1. **Find Clients** — search by city + business type
2. **Add Lead** — paste businesses from Google Maps
3. Filter **No Website** / **Social Only** for hot leads
4. Track calls and follow-ups on each lead page

## Repository

https://github.com/selfxiron/LookUpClients
