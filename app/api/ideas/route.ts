import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY!
})

// Helper to create a server-side Supabase client

async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )
}


export async function GET() {
  const supabase =  await createClient()

  // Get logged in user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

  const { data, error } = await supabase
    .from('ideas')
    .select('id, title, description, risk_level, profitability_score, created_at')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase =  await createClient()

  // Get logged in user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })

  const { title, description } = await req.json()

  if (!title || !description) {
    return NextResponse.json({ error: 'Title and description are required' }, { status: 400 })
  }

  const prompt = `You are an expert startup consultant. Analyze the given startup idea and return a structured JSON object with the fields: problem, customer, market, competitor, tech_stack, risk_level, profitability_score, justification.
Rules:
- Keep answers concise and realistic.
- 'competitor' should be an array of exactly 3 objects, each with 'name' and 'differentiation' fields.
- 'tech_stack' should be an array of 4-6 practical technologies for MVP.
- 'profitability_score' must be an integer between 0-100.
- 'risk_level' must be one of: Low, Medium, High.
Return ONLY JSON, no markdown, no backticks.

Input: ${JSON.stringify({ title, description })}`

  const message = await client.chat.completions.create({
    model: 'openai/gpt-oss-120b',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }]
  })

  const rawText = message.choices[0].message.content ?? ''
  const analysis = JSON.parse(rawText)

  const { data, error } = await supabase
    .from('ideas')
    .insert([{
      title,
      description,
      problem: analysis.problem,
      customer: analysis.customer,
      market: analysis.market,
      competitor: analysis.competitor,
      tech_stack: analysis.tech_stack,
      risk_level: analysis.risk_level,
      profitability_score: analysis.profitability_score,
      justification: analysis.justification,
      user_id: user.id  // 👈 this is the key addition
    }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}