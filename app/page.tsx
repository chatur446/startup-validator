
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser()

      if (!active) return

      if (error || !data.user) {
        router.push('/auth')
      }
    }

    void checkUser()

    return () => {
      active = false
    }
  }, [router])

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      setError('Please fill in both fields')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
        }),
      })

      const data: unknown = await res.json().catch(() => null)

      if (!res.ok) {
        const message =
          typeof data === 'object' &&
          data !== null &&
          'error' in data &&
          typeof data.error === 'string'
            ? data.error
            : 'Unable to validate your startup idea'

        throw new Error(message)
      }

      if (
        typeof data !== 'object' ||
        data === null ||
        !('id' in data) ||
        typeof data.id !== 'string'
      ) {
        throw new Error('The server returned an invalid response')
      }

      router.push(`/ideas/${data.id}`)
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.'
      )
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-3">
          Validate Your Startup Idea
        </h1>
        <p className="text-gray-400 text-lg">
          Get an AI-powered analysis of your startup idea in seconds
        </p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Startup Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. AI-powered fitness coach"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your startup idea in detail — what problem it solves, who it's for, how it works..."
            rows={5}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition resize-none"
          />
        </div>

        {error && (
          <p role="alert" className="text-red-400 text-sm">
            {error}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing your idea...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Validate My Idea
            </>
          )}
        </button>

        {loading && (
          <p className="text-center text-gray-400 text-sm">
            This takes about 10-15 seconds...
          </p>
        )}
      </div>
    </div>
  )
}
