
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({
  createServerClient: vi.fn(),
  cookies: vi.fn(),
}))

vi.mock('@supabase/ssr', () => ({
  createServerClient: mocks.createServerClient,
}))

vi.mock('next/headers', () => ({
  cookies: mocks.cookies,
}))

import {
  GET as listIdeas,
  POST as createIdea,
} from '../app/api/ideas/route'

import {
  GET as getIdea,
  DELETE as deleteIdea,
} from '../app/api/ideas/[id]/route'

describe('Ideas API security', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mocks.cookies.mockResolvedValue({
      getAll: () => [],
      set: vi.fn(),
    })

    mocks.createServerClient.mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: null,
        }),
      },
    })
  })

  it('rejects unauthenticated requests to list ideas', async () => {
    const response = await listIdeas()

    expect(response.status).toBe(401)
  })

  it('rejects unauthenticated requests to create ideas', async () => {
    const request = new NextRequest('http://localhost:3000/api/ideas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test startup',
        description: 'A test startup idea',
      }),
    })

    const response = await createIdea(request)

    expect(response.status).toBe(401)
  })

  it('rejects an invalid ID when fetching an idea', async () => {
    const response = await getIdea(
      new NextRequest('http://localhost:3000/api/ideas/invalid'),
      { params: Promise.resolve({ id: 'invalid' }) }
    )

    expect(response.status).toBe(400)
  })

  it('rejects an invalid ID when deleting an idea', async () => {
    const response = await deleteIdea(
      new NextRequest('http://localhost:3000/api/ideas/invalid', {
        method: 'DELETE',
      }),
      { params: Promise.resolve({ id: 'invalid' }) }
    )

    expect(response.status).toBe(400)
  })

  it('returns 404 when an idea is not owned by the authenticated user', async () => {
    const userId = '11111111-1111-4111-8111-111111111111'
    const ideaId = '22222222-2222-4222-8222-222222222222'

    const maybeSingle = vi.fn().mockResolvedValue({
      data: null,
      error: null,
    })

    const query = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle,
    }

    mocks.createServerClient.mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: userId } },
          error: null,
        }),
      },
      from: vi.fn().mockReturnValue(query),
    })

    const response = await getIdea(
      new NextRequest(`http://localhost:3000/api/ideas/${ideaId}`),
      { params: Promise.resolve({ id: ideaId }) }
    )

    expect(response.status).toBe(404)
    expect(query.eq).toHaveBeenCalledWith('id', ideaId)
    expect(query.eq).toHaveBeenCalledWith('user_id', userId)
  })

  it('returns 404 when the user tries to delete an idea they do not own', async () => {
    const userId = '11111111-1111-4111-8111-111111111111'
    const ideaId = '22222222-2222-4222-8222-222222222222'

    const maybeSingle = vi.fn().mockResolvedValue({
      data: null,
      error: null,
    })

    const query = {
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      maybeSingle,
    }

    mocks.createServerClient.mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: userId } },
          error: null,
        }),
      },
      from: vi.fn().mockReturnValue(query),
    })

    const response = await deleteIdea(
      new NextRequest(`http://localhost:3000/api/ideas/${ideaId}`, {
        method: 'DELETE',
      }),
      { params: Promise.resolve({ id: ideaId }) }
    )

    expect(response.status).toBe(404)
    expect(query.eq).toHaveBeenCalledWith('id', ideaId)
    expect(query.eq).toHaveBeenCalledWith('user_id', userId)
  })
})
