import '@testing-library/jest-dom'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}))

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => Promise.resolve({
          data: [],
          error: null
        })),
        eq: jest.fn(() => Promise.resolve({
          data: [],
          error: null
        }))
      })),
      insert: jest.fn(() => Promise.resolve({
        data: [],
        error: null
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({
          data: [],
          error: null
        }))
      }))
    }))
  }
}))

// Mock fetch for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      prompt: "Test prompt",
      theme: "technology_impact",
      themeTitle: "Technology Impact"
    }),
  })
)

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.GROQ_API_KEY = 'test-groq-api-key' 