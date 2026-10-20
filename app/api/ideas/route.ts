
import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

interface Analysis {
  problem: string
  customer: string
  market: string
  competitor: {
    name: string
    differentiation: string
  }[]
  tech_stack: string[]
  risk_level: 'Low' | 'Medium' | 'High'
  profitability_score: number
  justification: string
}

const MAX_TITLE_LENGTH = 120
const MAX_DESCRIPTION_LENGTH = 5000

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isValidAnalysis(value: unknown): value is Analysis {
  if (!isRecord(value)) return false

  const stringFields = [
    'problem',
    'customer',
    'market',
    'justification',
  ]

  if (
    !stringFields.every(
      (field) =>
        typeof value[field] === 'string' &&
        value[field].trim().length > 0
    )
  ) {
    return false
  }

  if (
    !Array.isArray(value.competitor) ||
    value.competitor.length !== 3 ||
    !value.competitor.every(
      (item) =>
        isRecord(item) &&
        typeof item.name === 'string' &&
        item.name.trim().length > 0 &&
        typeof item.differentiation === 'string' &&
        item.differentiation.trim().length > 0
    )
  ) {
    return false
  }

  if (
    !Array.isArray(value.tech_stack) ||
    value.tech_stack.length < 4 ||
    value.tech_stack.length > 6 ||
    !value.tech_stack.every(
      (item) => typeof item === 'string' && item.trim().length > 0
    )
  ) {
    return false
  }

  if (!['Low', 'Medium', 'High'].includes(String(value.risk_level))) {
    return false
  }

  return (
    typeof value.profitability_score === 'number' &&
    Number.isInteger(value.profitability_score) &&
    value.profitability_score >= 0 &&
    value.profitability_score <= 100
  )
}

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('ideas')
      .select(
        'id, title, description, risk_level, profitability_score, created_at'
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to retrieve startup ideas:', error)
      return NextResponse.json(
        { error: 'Unable to retrieve startup ideas' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error: unknown) {
    console.error('Startup ideas GET failed:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: unknown

    try {
      body = await req.json()
    } catch {
      return NextResponse.json(
        { error: 'Request body must contain valid JSON' },
        { status: 400 }
      )
    }

    if (!isRecord(body)) {
      return NextResponse.json(
        { error: 'Request body must be a JSON object' },
        { status: 400 }
      )
    }

    const { title, description } = body

    if (typeof title !== 'string' || typeof description !== 'string') {
      return NextResponse.json(
        { error: 'Title and description must be strings' },
        { status: 400 }
      )
    }

    const cleanTitle = title.trim()
    const cleanDescription = description.trim()

    if (!cleanTitle || !cleanDescription) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      )
    }

    if (cleanTitle.length > MAX_TITLE_LENGTH) {
      return NextResponse.json(
        { error: `Title must not exceed ${MAX_TITLE_LENGTH} characters` },
        { status: 400 }
      )
    }

    if (cleanDescription.length > MAX_DESCRIPTION_LENGTH) {
      return NextResponse.json(
        {
          error: `Description must not exceed ${MAX_DESCRIPTION_LENGTH} characters`,
        },
        { status: 400 }
      )
    }

    if (!process.env.GROQ_API_KEY) {
      console.error('GROQ_API_KEY is not configured')
      return NextResponse.json(
        { error: 'AI service is currently unavailable' },
        { status: 503 }
      )
    }

    const client = new Groq({ apiKey: process.env.GROQ_API_KEY })

    const prompt = `You are an expert startup consultant. Analyze the given startup idea and return a structured JSON object with the fields: problem, customer, market, competitor, tech_stack, risk_level, profitability_score, justification.
Rules:
- Keep answers concise and realistic.
- 'competitor' must be an array of exactly 3 objects, each with 'name' and 'differentiation' string fields.
- 'tech_stack' must be an array of 4-6 technology strings for an MVP.
- 'profitability_score' must be an integer between 0 and 100.
- 'risk_level' must be one of: Low, Medium, High.
- 'problem', 'customer', 'market', and 'justification' must be non-empty strings.
Return ONLY valid JSON, no markdown, no backticks.

Input: ${JSON.stringify({
      title: cleanTitle,
      description: cleanDescription,
    })}`

    let rawText: string

    try {
      const message = await client.chat.completions.create({
        model: 'openai/gpt-oss-120b',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      })

      rawText = message.choices[0]?.message?.content ?? ''
    } catch (error: unknown) {
      console.error('Groq startup analysis failed:', error)
      return NextResponse.json(
        { error: 'AI analysis failed. Please try again later.' },
        { status: 502 }
      )
    }

    let analysis: unknown

    try {
      analysis = JSON.parse(rawText)
    } catch {
      return NextResponse.json(
        { error: 'AI returned an invalid analysis. Please try again.' },
        { status: 502 }
      )
    }

    if (!isValidAnalysis(analysis)) {
      return NextResponse.json(
        { error: 'AI returned an incomplete analysis. Please try again.' },
        { status: 502 }
      )
    }

    const { data, error } = await supabase
      .from('ideas')
      .insert({
        title: cleanTitle,
        description: cleanDescription,
        problem: analysis.problem,
        customer: analysis.customer,
        market: analysis.market,
        competitor: analysis.competitor,
        tech_stack: analysis.tech_stack,
        risk_level: analysis.risk_level,
        profitability_score: analysis.profitability_score,
        justification: analysis.justification,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to save startup analysis:', error)
      return NextResponse.json(
        { error: 'Unable to save startup analysis' },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error: unknown) {
    console.error('Startup analysis request failed:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
