import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'                    // ← changed
import { supabase } from '@/lib/supabase'

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY!            // ← changed
})

export async function GET() {
  const { data, error } = await supabase
    .from('ideas')
    .select('id, title, description, risk_level, profitability_score, created_at')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
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

  const message = await client.chat.completions.create({   // ← changed
    model: 'llama-3.3-70b-versatile',                      // ← changed
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }]
  })

  const rawText = message.choices[0].message.content ?? '' // ← changed
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
      justification: analysis.justification
    }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}