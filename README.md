# HiveBot

> AI-powered task automation platform with visual workflow builder, web scraping, scheduling, and multi-channel notifications.

## Features

- **Task Dashboard** -- Centralized view of all automated tasks with status tracking and filtering
- **Visual Workflow Builder** -- ReactFlow-based drag-and-drop workflow editor for composing automation pipelines
- **Web Scraper** -- AI-assisted web scraping with Cheerio for HTML parsing and structured data extraction
- **Calendar & Scheduling** -- Cron-based scheduling with visual calendar interface for recurring tasks
- **Job Queue** -- BullMQ + Redis powered background job processing with retry and priority support
- **Email Notifications** -- Nodemailer integration for automated email alerts and reports
- **AI Integration** -- OpenAI-powered task planning, content generation, and data analysis
- **Drag & Drop UI** -- @dnd-kit powered sortable task lists and workflow nodes

## Tech Stack

| Layer      | Technology                                      |
| ---------- | ----------------------------------------------- |
| Framework  | Next.js 14 (App Router)                         |
| Language   | TypeScript                                      |
| AI         | OpenAI API                                      |
| Workflows  | ReactFlow                                       |
| Queue      | BullMQ, ioredis                                 |
| Scraping   | Cheerio                                         |
| Email      | Nodemailer                                      |
| UI         | Tailwind CSS, Radix UI, Framer Motion           |
| State      | Zustand                                         |
| Validation | Zod                                             |
| Backend    | Supabase (Auth + Database)                      |

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run database migrations
npm run db:migrate

# Seed initial data
npm run db:seed

# Start development server
npm run dev

# Start background worker (separate terminal)
npm run worker:dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
hivebot/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Redirect to dashboard
│   │   └── (app)/
│   │       ├── dashboard/        # Task dashboard
│   │       ├── tasks/            # Task management
│   │       ├── workflows/        # Visual workflow builder
│   │       ├── scraper/          # Web scraper
│   │       └── calendar/         # Scheduling calendar
│   ├── worker/                   # Background job worker
│   └── lib/
│       └── db/                   # Database seed
└── package.json
```

## License

MIT
