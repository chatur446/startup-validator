# AI Startup Validator

An AI-powered full-stack web application that helps entrepreneurs
evaluate startup ideas through structured analysis of the problem,
target customers, market opportunities, competitors, recommended
technology stack, risk level, and profitability score.

**Live Demo:** https://startup-validator-eight.vercel.app/

**Repository:** https://github.com/chatur446/startup-validator

## Features

-   AI-powered startup idea analysis using Groq.
-   Structured reports covering the problem, target customers, market
    overview, competitors, and suggested MVP technology stack.
-   Risk assessment and profitability scoring.
-   User authentication and a personalized dashboard.
-   Persistent storage of startup ideas using Supabase PostgreSQL.
-   Individual report pages and PDF export.
-   User-scoped data access enforced through authenticated API requests
    and Supabase Row Level Security.
-   Input validation and error handling for API requests.
-   Automated API security regression tests.
-   GitHub Actions CI workflow for running tests and building the
    production application.

## Tech Stack

  Category         Technologies
  ---------------- ---------------------------------------
  Frontend         Next.js App Router, React, TypeScript
  Styling          Tailwind CSS
  Backend          Next.js API routes
  AI               Groq API, `openai/gpt-oss-120b`
  Database         Supabase PostgreSQL
  Authentication   Supabase Auth
  PDF Generation   jsPDF
  Testing          Vitest
  CI/CD            GitHub Actions
  Deployment       Vercel

## Getting Started

### Prerequisites

-   Node.js and npm
-   A Supabase project
-   A Groq API key

### 1. Clone the repository

``` bash
git clone https://github.com/chatur446/startup-validator.git
cd startup-validator
```

### 2. Install dependencies

``` bash
npm ci
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

``` env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_publishable_or_anon_key
GROQ_API_KEY=your_groq_api_key
```

Replace the placeholders with your own credentials. Never commit
`.env.local` or expose your Groq API key in client-side code.

### 4. Configure Supabase

Configure the database schema required by the application, enable Row
Level Security on the ideas table, and apply policies that restrict
users to their own records.

Configure Supabase Authentication and its permitted redirect URLs for
local development and your deployed application.

Use the schema and policies from your existing project rather than
creating a duplicate table if the database is already configured.

### 5. Run the application

``` bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Testing

Run the automated tests:

``` bash
npm run test
```

Build the production application:

``` bash
npm run build
```

The GitHub Actions workflow runs the test suite and production build on
pushes and pull requests targeting `main`.

## Deployment

The application is deployed on Vercel and connected to the GitHub
repository.

Configure the required environment variables in the Vercel project
settings before deploying. Pushes to the configured production branch
trigger deployments.

**Live application:** https://startup-validator-eight.vercel.app/

## Security

-   Authenticate requests before accessing user data.
-   Apply user ownership filters to database queries.
-   Enforce database-level access policies through Supabase Row Level
    Security.
-   Validate incoming API data and handle malformed requests.
-   Keep private API credentials in server-side environment variables.
-   Run automated regression tests and a production build in CI.

## License

This project is licensed under the MIT License.
