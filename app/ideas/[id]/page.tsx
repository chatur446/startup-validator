'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Competitor {
  name: string
  differentiation: string
}

interface Idea {
  id: string
  title: string
  description: string
  problem: string
  customer: string
  market: string
  competitor: Competitor[]
  tech_stack: string[]
  risk_level: string
  profitability_score: number
  justification: string
  created_at: string
}

export default function IdeaDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [idea, setIdea] = useState<Idea | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetch(`/api/ideas/${id}`)
      .then(res => res.json())
      .then(data => {
        setIdea(data)
        setLoading(false)
      })
  }, [id])

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this idea?')) return
    setDeleting(true)
    await fetch(`/api/ideas/${id}`, { method: 'DELETE' })
    router.push('/ideas')
  }

  const riskColor = (risk: string) => {
    if (risk === 'Low') return 'text-green-400 bg-green-400/10 border-green-400/20'
    if (risk === 'Medium') return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
    return 'text-red-400 bg-red-400/10 border-red-400/20'
  }

  const scoreColor = (score: number) => {
    if (score >= 70) return 'text-green-400'
    if (score >= 40) return 'text-yellow-400'
    return 'text-red-400'
  }

  if (loading) return (
    <div className="text-center py-20 text-gray-400">
      Loading report...
    </div>
  )

  if (!idea) return (
    <div className="text-center py-20 text-gray-400">
      Idea not found.
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/ideas" className="text-gray-400 hover:text-white text-sm transition">
          ← Back to Dashboard
        </Link>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-red-400 hover:text-red-300 text-sm transition disabled:opacity-50"
        >
          {deleting ? 'Deleting...' : '🗑 Delete'}
        </button>
      </div>

      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{idea.title}</h1>
        <p className="text-gray-400">{idea.description}</p>
        <p className="text-gray-600 text-xs mt-2">
          Submitted on {new Date(idea.created_at).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'long', year: 'numeric'
          })}
        </p>
      </div>

      {/* Score + Risk */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
          <p className="text-gray-400 text-sm mb-1">Profitability Score</p>
          <p className={`text-5xl font-bold ${scoreColor(idea.profitability_score)}`}>
            {idea.profitability_score}
            <span className="text-xl text-gray-500">/100</span>
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
          <p className="text-gray-400 text-sm mb-1">Risk Level</p>
          <span className={`text-2xl font-bold px-4 py-1 rounded-full border ${riskColor(idea.risk_level)}`}>
            {idea.risk_level}
          </span>
        </div>
      </div>

      {/* Report Sections */}
      <div className="space-y-4">

        {/* Problem */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-blue-400 font-semibold text-sm uppercase tracking-wider mb-3">
            🎯 Problem Summary
          </h2>
          <p className="text-gray-300 leading-relaxed">{idea.problem}</p>
        </div>

        {/* Customer */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-purple-400 font-semibold text-sm uppercase tracking-wider mb-3">
            👤 Customer Persona
          </h2>
          <p className="text-gray-300 leading-relaxed">{idea.customer}</p>
        </div>

        {/* Market */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-cyan-400 font-semibold text-sm uppercase tracking-wider mb-3">
            📊 Market Overview
          </h2>
          <p className="text-gray-300 leading-relaxed">{idea.market}</p>
        </div>

        {/* Competitors */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-orange-400 font-semibold text-sm uppercase tracking-wider mb-3">
            ⚔️ Competitors
          </h2>
          <div className="space-y-3">
            {(idea.competitor ?? []).map((c, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span className="text-orange-400 font-bold shrink-0">{i + 1}.</span>
                <div>
                  <span className="font-semibold text-white">{c.name}</span>
                  <span className="text-gray-400"> — {c.differentiation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-green-400 font-semibold text-sm uppercase tracking-wider mb-3">
            🛠 Suggested Tech Stack
          </h2>
          <div className="flex flex-wrap gap-2">
            {(idea.tech_stack ?? []).map((tech, i) => (
              <span
                key={i}
                className="bg-green-400/10 text-green-400 border border-green-400/20 px-3 py-1 rounded-full text-sm"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Justification */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-yellow-400 font-semibold text-sm uppercase tracking-wider mb-3">
            💡 Justification
          </h2>
          <p className="text-gray-300 leading-relaxed">{idea.justification}</p>
        </div>

      </div>
    </div>
  )
}