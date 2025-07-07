import { createClient } from '@supabase/supabase-js'

// Validate environment variables with strict checks
function validateEnvironmentVariables(): { supabaseUrl: string; supabaseAnonKey: string } {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL environment variable is required and must be set')
  }

  if (!supabaseAnonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is required and must be set')
  }

  if (!supabaseUrl.startsWith('https://')) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL must be a valid HTTPS URL')
  }

  if (supabaseUrl.length < 20) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL appears to be invalid (too short)')
  }

  if (supabaseAnonKey.length < 100) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY appears to be invalid (too short)')
  }

  return { supabaseUrl, supabaseAnonKey }
}

const { supabaseUrl, supabaseAnonKey } = validateEnvironmentVariables()

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Strict Types for our database tables - no optional fields that should be required
export interface JournalEntry {
  id: string
  user_id: string | null
  theme: 'technology_impact' | 'delivery_impact' | 'business_impact' | 'team_impact' | 'org_impact'
  prompt: string
  content: string
  images: string[]
  is_bookmarked: boolean
  created_at: string
  updated_at: string
  word_count: number
  tags: string[]
}

export interface User {
  id: string
  email: string
  created_at: string
  updated_at: string
}

export interface CreateJournalEntry {
  theme: JournalEntry['theme']
  prompt: string
  content: string
  images: string[]
  is_bookmarked: boolean
  word_count: number
  tags: string[]
} 