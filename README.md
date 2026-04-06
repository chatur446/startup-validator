# 🚀 AI Startup Validator

An AI-powered web app that analyzes and validates your startup ideas. Get instant feedback on market potential, competitors, tech stack recommendations, risk level, and profitability score — all powered by Groq AI.

---

## ✨ Features

- **AI Analysis** — Submit a startup idea and get a detailed breakdown powered by Groq (Llama 3.3 70B)
- **Competitor Insights** — See 3 real competitors and how to differentiate from them
- **Tech Stack Suggestions** — Get practical MVP technology recommendations
- **Risk & Profitability Score** — Instant risk level (Low / Medium / High) and a profitability score out of 100
- **Dashboard** — View and manage all your previously submitted ideas
- **Persistent Storage** — All ideas saved to Supabase database

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| AI Model | Groq — Llama 3.3 70B Versatile |
| Database | Supabase (PostgreSQL) |
| Fonts | Inter (Google Fonts) |

---

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   └── ideas/
│   │       ├── route.ts          # GET all ideas, POST new idea (calls Groq AI)
│   │       └── [id]/
│   │           └── route.ts      # GET single idea, DELETE idea
│   ├── ideas/
│   │   ├── page.tsx              # Dashboard — list all ideas
│   │   └── [id]/
│   │       └── page.tsx          # Detail page for a single idea
│   ├── layout.tsx                # Root layout with navbar
│   ├── page.tsx                  # Home page — submit new idea
│   └── globals.css               # Global styles
├── lib/
│   └── supabase.ts               # Supabase client setup
├── .env.local                    # Environment variables (not committed)
└── package.json
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root of the project:

```env
GROQ_API_KEY=your_groq_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

- Get your Groq API key from [console.groq.com](https://console.groq.com)
- Get your Supabase credentials from [supabase.com](https://supabase.com)

### 4. Set up Supabase table

Run this SQL in your Supabase SQL editor:

```sql
create table ideas (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  problem text,
  customer text,
  market text,
  competitor jsonb,
  tech_stack jsonb,
  risk_level text,
  profitability_score integer,
  justification text,
  created_at timestamp with time zone default now()
);
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables

| Variable | Description |
|---|---|
| `GROQ_API_KEY` | Your Groq API key |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key |

---

## 📄 License

MIT
