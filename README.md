## SplitMate

SplitMate is a mobile-first trip expense tracker built with Next.js, Prisma, and Tailwind. Create trips, invite participants with weight-based splits, record expenses, and get instant settlement suggestions.

### Project Structure

- `app/` – App Router routes (home, trip dashboard, participant management, expense flow).
- `components/` – UI primitives and feature components.
- `lib/` – Prisma client, validation schemas, and ledger calculations.
- `prisma/` – Prisma schema for trips, participants, expenses, and participant mappings.

### Prerequisites

- Node.js 18+
- Postgres database (Neon works well). Duplicate `.env.example` into `.env` and supply `DATABASE_URL`.

### Install & Setup

```bash
npm install
npm run prisma:migrate   # creates tables via prisma migrate dev
npm run prisma:generate  # optional – regenerates Prisma Client types
npm run dev              # start the dev server on http://localhost:3000
```

### Core Scripts

- `npm run dev` – Next.js dev server with Turbopack
- `npm run build` / `npm run start` – production build & serve
- `npm run lint` – ESLint
- `npm run prisma:migrate` – run `prisma migrate dev`
- `npm run prisma:generate` – regenerate Prisma Client

### Testing Ideas

Vitest and Playwright are suggested in the roadmap but not configured yet. Add them when you are ready to automate logic tests (ledger calculations) and smoke the main flows.

### Deployment

Deploy SplitMate on Vercel backed by Neon Postgres. Remember to configure the `DATABASE_URL` environment variable in the deployment platform and run `prisma migrate deploy` as part of your release workflow.
