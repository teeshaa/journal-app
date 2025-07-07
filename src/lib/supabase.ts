import { createClient } from '@supabase/supabase-js'

// Validate environment variables with graceful fallbacks for development
function getSupabaseConfig(): { supabaseUrl: string; supabaseAnonKey: string } {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Provide fallback values for development
  const fallbackUrl = 'https://placeholder.supabase.co'
  const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDcxOTg0MzcsImV4cCI6MTk2Mjc3NDQzN30.SqnXPgTiNuFuauek1aBPtMacfC1KCl5cL6QEz5nAWgw'

  return {
    supabaseUrl: supabaseUrl && supabaseUrl !== 'your_supabase_url_here' ? supabaseUrl : fallbackUrl,
    supabaseAnonKey: supabaseAnonKey && supabaseAnonKey !== 'your_supabase_anon_key_here' ? supabaseAnonKey : fallbackKey
  }
}

// Helper function to check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig()
  return supabaseUrl !== 'https://placeholder.supabase.co' && 
         !supabaseAnonKey.includes('placeholder')
}

const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig()

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to validate configuration before database operations
export function validateSupabaseConfig(): void {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not properly configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.')
  }
}

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