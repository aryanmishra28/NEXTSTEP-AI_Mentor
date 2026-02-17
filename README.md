# AI Career Coach

An AI-powered career coaching platform built with Next.js, Tailwind CSS, Prisma (PostgreSQL), Clerk authentication, and Google Gemini. Features include AI chat mentoring, resume builder, cover letter generator, interview prep quizzes, and industry insights updated via scheduled background jobs with Inngest.

## Tech Stack

- Next.js 15 (React 19) with App Router
- Tailwind CSS + Radix UI components (shadcn-style)
- Prisma 6 + PostgreSQL (e.g., Neon)
- Clerk for authentication
- Google Generative AI (Gemini 1.5) for AI features
- Inngest for scheduled background jobs

## Features

- AI Mentor chat for guidance and Q&A
- Resume builder with markdown editor and ATS feedback
- Cover letter generator, saving drafts and previews
- Interview prep quizzes with scoring and tips
- Dashboard with industry insights and growth tools

## Prerequisites

- Node.js 18+ (recommended LTS on Windows)
- A PostgreSQL database (Neon or any Postgres provider)
- Clerk account (Publishable + Secret keys)
- Google Generative AI key (Gemini)

## Getting Started

1) Install dependencies

```bash
npm install
```

2) Create `.env.local` in the project root and configure environment variables:

```env
# Database (PostgreSQL)
DATABASE_URL=postgres://<user>:<password>@<host>/<db>?sslmode=require

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Optional: customize Clerk routes (defaults below match the app)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Google Gemini
GEMINI_API_KEY=your_gemini_key
```

3) Set up the database schema

```bash
# Generate Prisma client (runs automatically on postinstall, safe to re-run)
npx prisma generate

# Apply migrations in development
npx prisma migrate dev

# Alternatively, push schema without migrations (dev-only)
# npx prisma db push
```

4) Run the development server

```bash
npm run dev
# App will be available at http://localhost:3000
```

## Scripts

- `dev`: Start Next.js in dev mode (Turbopack)
- `build`: Build the production bundle
- `start`: Start the production server
- `lint`: Run ESLint
- `postinstall`: Generate Prisma client

## Project Structure

- `app/`: App Router pages and layouts
	- `(auth)/`: Clerk sign-in/sign-up flows
	- `(main)/`: Main authenticated experience (dashboard, tools)
	- `api/ai-chat`: Chat route handler
	- `api/inngest`: Inngest Next integration entry
- `lib/`: Shared utilities and clients
	- `prisma.js`: Prisma client
	- `inngest/`: Inngest client and scheduled function
- `actions/`: Server actions (resume, cover letter, interview, user)
- `components/`: UI components (buttons, dialogs, etc.)
- `prisma/`: Prisma schema and migrations
- `data/`: Static content (FAQs, features, industries, etc.)

## Authentication (Clerk)

- Create a Clerk project and copy the Publishable and Secret keys into `.env.local`.
- Ensure the routes in the env match the app paths: `/sign-in`, `/sign-up`, `/onboarding`.
- Signed-in users are persisted to the database via `checkUser()`.

## AI & Background Jobs

- Gemini is used via `@google/generative-ai`; set `GEMINI_API_KEY`.
- Weekly industry insights refresh runs via Inngest cron:
	- Function: `Generate Industry Insights` (see `lib/inngest/function.js`)
	- Next.js route is available at `/api/inngest` for serve hooks.

## Database (Prisma + Postgres)

- Provider: `postgresql` (see `prisma/schema.prisma`).
- Migrations live under `prisma/migrations/`.
- Use `npx prisma migrate dev` during development; use `npx prisma migrate deploy` in production.

## Deployment

- Set all environment variables on your hosting platform.
- Run `npm run build` then `npm run start`.
- Ensure the Postgres database allows connections from your host and uses SSL if required (Neon uses `sslmode=require`).

## Troubleshooting

- Dev server fails at start:
	- Verify `.env.local` exists and keys are set (DB, Clerk, Gemini).
	- Ensure Postgres is reachable; try `npx prisma generate` then `npx prisma migrate dev`.
	- Confirm Node.js 18+.
- Clerk redirects: Make sure the route envs match the app paths listed above.
- Windows/OpenSSL + Postgres: use an SSL connection string (`sslmode=require`) with Neon.


