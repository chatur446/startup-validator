'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!title || !description) {
      setError('Please fill in both fields')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push(`/ideas/${data.id}`)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
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
            onChange={e => setTitle(e.target.value)}
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
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe your startup idea in detail — what problem it solves, who it's for, how it works..."
            rows={5}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition resize-none"
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition"
        >
          {loading ? '⏳ Analyzing your idea...' : '✨ Validate My Idea'}
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