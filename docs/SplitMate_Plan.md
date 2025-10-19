# SplitMate – Build Plan

## Goals
- Simple, mobile‑first trip cost splitting app using Next.js (App Router, TypeScript, Tailwind).
- Manage multiple trips; each trip has its own participants and expenses.
- Weighted equal split per expense (participant “weight”/“share factor”).
- Show per‑participant totals paid/owed, balance, and suggested minimal transfers to settle.

## Scope (MVP)
- Create/select trip on homepage.
- Add/edit participants with `displayName` and integer `weight` (≥1).
- Add expenses: amount, currency (AUD), date, description, payer, participating subset (checkboxes; Select All default with quick toggle).
- Compute: totals per participant, balances, and settlement suggestions.
- Localized formatting for currency; amounts stored in integer cents to avoid rounding drift.
- Primary color is #008080 (shade of teal). But make that a variable so it can be changed easily.

## Tech Stack
- Next.js App Router, TypeScript, Tailwind CSS.
- UI: shadcn/ui (Radix primitives) for consistent, accessible components.
- Persistence: Prisma + Neon Postgres. Server Actions for CRUD.
- State: minimal client state with React + Zod schemas for validation.
- Testing (optional): Vitest (logic) + Playwright (smoke flows).

## Data Model (Prisma)
Note: participant weights are per trip. Participants are trip-scoped records so households can be represented with a trip-specific `weight`. You do not need a global `Person` table for the MVP. If later you want to reuse identities across trips, add `Person` and keep `TripParticipant` as the per-trip pivot that stores `weight`.
```
model Trip {
  id          String   @id @default(cuid())
  name        String
  currency    String 
  participants TripParticipant[]
  expenses    Expense[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model TripParticipant {
  id        String  @id @default(cuid())
  tripId    String
  trip      Trip    @relation(fields: [tripId], references: [id], onDelete: Cascade)
  name      String
  weight    Int     // >= 1
  // Derived values (paid/owed/balance) computed, not persisted.
}

model Expense {
  id           String  @id @default(cuid())
  tripId       String
  trip         Trip    @relation(fields: [tripId], references: [id], onDelete: Cascade)
  description  String
  amountCents  Int     // store in cents
  payerId      String
  payer        TripParticipant @relation(fields: [payerId], references: [id])
  date         DateTime @default(now())
  // ExpenseParticipants: mapping table for subset selection
  participants ExpenseParticipant[]
}

model ExpenseParticipant {
  expenseId     String
  participantId String
  expense       Expense     @relation(fields: [expenseId], references: [id], onDelete: Cascade)
  participant   TripParticipant @relation(fields: [participantId], references: [id], onDelete: Cascade)
  @@id([expenseId, participantId])
}
```

## App Structure (App Router)
- `app/layout.tsx` – App shell header and providers.
- `app/page.tsx` – Homepage: list existing trips, create new.
- `app/trip/[id]/page.tsx` – Trip dashboard: participants, expenses, totals, balances, transfers.
- `app/trip/[id]/participants/page.tsx` – Manage participants (name, weight).
- `app/trip/[id]/expenses/new/page.tsx` – Add expense.
- API via Server Actions colocated with forms/components (e.g., `createTrip`, `upsertParticipant`, `addExpense`).

## UI/UX (Mobile‑first)
- Homepage:
  - List trips (name, last updated). CTA: New Trip.
- Create Trip flow:
  - Step 1: Name
  - Step 2: Participants: name, weight (integer stepper). Validate weight ≥1.
  - Finish → create trip, navigate to dashboard.
- Trip Dashboard:
  - Summary cards: per‑participant paid, owed, balance. Total expenses.
  - Actions: Add Expense, Manage Participants, Calculate Transfers.
  - Transfers list appears on demand with clear “A pays B $X” items.
- Add Expense:
  - Form: description, amount (cents input with currency mask), date, payer (select), participants (checkbox list with Select All / None). Select All default.
  - Save → back to dashboard.

## User Flow
1. Open app; land on the homepage.
2. Select an existing trip or tap New Trip.
3. Enter trip name and confirm currency; proceed.
4. Add participants: enter display name and weight per household; save.
5. Land on trip dashboard with summary cards.
6. Add expenses: choose payer, enter amount and details, select participating subset (Select All by default with quick All/None toggle); save.
7. Review updated per‑participant totals and balances.
8. Tap Calculate Transfers to generate minimal settlement suggestions.
9. Optionally share/export the summary (future enhancement).

## Components
- Core: `TripCard`, `ParticipantRow`, `WeightInput`, `MoneyInput`, `ExpenseRow`, `SelectAllToggle`, `TransferItem`, `SummaryStat`.
- shadcn/ui usage:
  - Button, Input, Label, Select, Checkbox, Switch (optional), Card, Table, Dialog/Sheet (for forms), Tabs (optional), Toast.
- Snackbar/toast for actions; inline field errors.

## Validation & Rounding
- Zod schemas for all forms; guard `weight >= 1`, `amountCents > 0`.
- Monetary parsing/formatting with a single currency per trip (no FX in MVP).
- Split rounding using remainder distribution as described.

## Accessibility
- Semantic form controls, large touch targets, label associations.

## Performance
- Lightweight pages, minimal client JS; prefer server components where possible.
- Optimistic UI for create/edit operations where safe.

## Security & Privacy
- No auth in MVP; local multi‑user not assumed.
- Sanitize inputs server‑side; rate‑limit not required for MVP.

## Milestones
1. Scaffold Next.js + Tailwind; init shadcn/ui.
2. Prisma schema + migrations; DB wiring (Neon in dev/prod).
3. Create Trip flow (name, currency, participants) + persist.
4. Trip dashboard skeleton (server data fetch, empty states).
5. Add Expense flow (+ split logic util).
6. Aggregation & summary cards (paid/owed/balance).
7. Settlement suggestions UI + algorithm.
8. Polish mobile UX, validation, tests.
9. Deploy (Vercel + Postgres) and smoke test.
