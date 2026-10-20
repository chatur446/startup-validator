
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Idea {
  id: string
  title: string
  description: string
  risk_level: string
  profitability_score: number
  created_at: string
}

export default function IdeasPage() {
  const router = useRouter()
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const loadIdeas = async () => {
      try {
        const { data, error: authError } = await supabase.auth.getUser()

        if (!active) return

        if (authError || !data.user) {
          router.push('/auth')
          return
        }

        const response = await fetch('/api/ideas')

        if (!response.ok) {
          throw new Error('Unable to load your ideas. Please try again.')
        }

        const result: unknown = await response.json()

        if (!Array.isArray(result)) {
          throw new Error('The server returned an invalid ideas response')
        }

        const validIdeas = result.filter(
          (idea): idea is Idea =>
            typeof idea === 'object' &&
            idea !== null &&
            typeof idea.id === 'string' &&
            typeof idea.title === 'string' &&
            typeof idea.description === 'string' &&
            typeof idea.risk_level === 'string' &&
            typeof idea.profitability_score === 'number' &&
            typeof idea.created_at === 'string'
        )

        if (active) {
          setIdeas(validIdeas)
        }
      } catch (err: unknown) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Something went wrong while loading ideas.'
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadIdeas()

    return () => {
      active = false
    }
  }, [router])

  const riskColor = (risk: string) => {
    if (risk === 'Low') return 'text-green-400 bg-green-400/10'
    if (risk === 'Medium') return 'text-yellow-400 bg-yellow-400/10'
    return 'text-red-400 bg-red-400/10'
  }

  const scoreColor = (score: number) => {
    if (score >= 70) return 'text-green-400'
    if (score >= 40) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link
          href="/"
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Idea
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading ideas...</span>
        </div>
      ) : error ? (
        <div role="alert" className="text-red-400">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm underline"
          >
            Try again
          </button>
        </div>
      ) : ideas.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-5xl mb-4">💡</p>
          <p className="text-lg">No ideas yet. Submit your first one!</p>
          <Link
            href="/"
            className="text-blue-400 hover:underline mt-2 inline-block"
          >
            Submit an idea →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {ideas.map((idea) => (
            <Link key={idea.id} href={`/ideas/${idea.id}`}>
              <div className="bg-gray-900 border border-gray-800 hover:border-blue-500 rounded-2xl p-6 transition cursor-pointer">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold mb-1">
                      {idea.title}
                    </h2>
                    <p className="text-gray-400 text-sm line-clamp-2">
                      {idea.description}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span
                      className={`text-xs font-medium px-3 py-1 rounded-full ${riskColor(idea.risk_level)}`}
                    >
                      {idea.risk_level} Risk
                    </span>
                    <span
                      className={`text-2xl font-bold ${scoreColor(idea.profitability_score)}`}
                    >
                      {idea.profitability_score}
                      <span className="text-sm text-gray-500">/100</span>
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 text-xs mt-3">
                  {new Date(idea.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
