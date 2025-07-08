import { createClient } from '@supabase/supabase-js'

// Database Types
export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
  last_sign_in_at?: string
  total_entries: number
  total_words: number
  current_streak: number
  longest_streak: number
}

export interface JournalEntry {
  id: string
  user_id: string
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

export interface CreateJournalEntry {
  theme: JournalEntry['theme']
  prompt: string
  content: string
  images: string[]
  is_bookmarked: boolean
  word_count: number
  tags: string[]
}

// Validate environment variables with graceful fallbacks for development
function getSupabaseConfig(): { supabaseUrl: string; supabaseAnonKey: string } {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // More specific validation
  if (!supabaseUrl || supabaseUrl === 'your_supabase_url_here' || supabaseUrl.includes('placeholder')) {
    console.warn('Supabase URL not configured. Please set NEXT_PUBLIC_SUPABASE_URL environment variable.')
  }

  if (!supabaseAnonKey || supabaseAnonKey === 'your_supabase_anon_key_here' || supabaseAnonKey.includes('placeholder')) {
    console.warn('Supabase Anon Key not configured. Please set NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable.')
  }

  // Provide fallback values for development
  const fallbackUrl = 'https://placeholder.supabase.co'
  const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDcxOTg0MzcsImV4cCI6MTk2Mjc3NDQzN30.SqnXPgTiNuFuauek1aBPtMacfC1KCl5cL6QEz5nAWgw'

  return {
    supabaseUrl: supabaseUrl && supabaseUrl !== 'your_supabase_url_here' ? supabaseUrl : fallbackUrl,
    supabaseAnonKey: supabaseAnonKey && supabaseAnonKey !== 'your_supabase_anon_key_here' ? supabaseAnonKey : fallbackKey
  }
}

// Check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig()
  return supabaseUrl !== 'https://placeholder.supabase.co' && 
         supabaseAnonKey !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDcxOTg0MzcsImV4cCI6MTk2Mjc3NDQzN30.SqnXPgTiNuFuauek1aBPtMacfC1KCl5cL6QEz5nAWgw'
}

const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig()

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Helper function to validate configuration before database operations
export function validateSupabaseConfig(): void {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not properly configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.')
  }
}

// Authentication functions
export const auth = {
  // Sign in with magic link
  async signInWithMagicLink(email: string) {
    validateSupabaseConfig()
    
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) {
        console.error('Auth error:', error)
        
        // Provide more specific error messages
        if (error.message.includes('Database error saving new user')) {
          throw new Error('There was an issue setting up your account. Please try again or contact support if the problem persists.')
        } else if (error.message.includes('Invalid email')) {
          throw new Error('Please enter a valid email address.')
        } else if (error.message.includes('rate limit')) {
          throw new Error('Too many login attempts. Please wait a moment before trying again.')
        } else {
          throw new Error(`Authentication failed: ${error.message}`)
        }
      }
      
      return { data, error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  },

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
      }
      return { error }
    } catch (error) {
      console.error('Sign out error:', error)
      return { error }
    }
  },

  // Get current session
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Session error:', error)
      }
      return { session, error }
    } catch (error) {
      console.error('Session error:', error)
      return { session: null, error }
    }
  },

  // Get current user
  async getUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        console.error('Get user error:', error)
      }
      return { user, error }
    } catch (error) {
      console.error('Get user error:', error)
      return { user: null, error }
    }
  },

  // Listen to auth changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// User functions
export const userService = {
  // Get user profile
  async getProfile(userId?: string): Promise<{ data: User | null; error: any }> {
    validateSupabaseConfig()
    
    try {
      let query = supabase
        .from('users')
        .select('*')

      if (userId) {
        query = query.eq('id', userId)
      } else {
        const { user } = await auth.getUser()
        if (!user) return { data: null, error: 'Not authenticated' }
        query = query.eq('id', user.id)
      }

      const { data, error } = await query.single()
      
      if (error && error.code === 'PGRST116') {
        // User profile doesn't exist, create it
        const { user } = await auth.getUser()
        if (user) {
          const newProfile = {
            id: user.id,
            email: user.email!,
            full_name: user.user_metadata?.full_name || user.email!.split('@')[0],
            avatar_url: user.user_metadata?.avatar_url,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            total_entries: 0,
            total_words: 0,
            current_streak: 0,
            longest_streak: 0
          }
          
          const { data: createdProfile, error: createError } = await supabase
            .from('users')
            .insert([newProfile])
            .select()
            .single()
            
          if (createError) {
            console.error('Error creating profile:', createError)
            return { data: null, error: createError }
          }
          
          return { data: createdProfile, error: null }
        }
      }
      
      return { data, error }
    } catch (error) {
      console.error('Error getting profile:', error)
      return { data: null, error }
    }
  },

  // Update user profile
  async updateProfile(updates: Partial<User>): Promise<{ data: User | null; error: any }> {
    validateSupabaseConfig()
    
    try {
      const { user } = await auth.getUser()
      if (!user) return { data: null, error: 'Not authenticated' }

      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error updating profile:', error)
      return { data: null, error }
    }
  },

  // Update last sign in
  async updateLastSignIn(): Promise<{ error: any }> {
    validateSupabaseConfig()
    
    try {
      const { user } = await auth.getUser()
      if (!user) return { error: 'Not authenticated' }

      const { error } = await supabase
        .from('users')
        .update({ 
          last_sign_in_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      return { error }
    } catch (error) {
      console.error('Error updating last sign in:', error)
      return { error }
    }
  }
}

// Journal entry functions
export const journalService = {
  // Create journal entry
  async createEntry(entry: CreateJournalEntry): Promise<{ data: JournalEntry | null; error: any }> {
    validateSupabaseConfig()
    
    try {
      const { user } = await auth.getUser()
      if (!user) return { data: null, error: 'Not authenticated' }

      const { data, error } = await supabase
        .from('journal_entries')
        .insert([{
          ...entry,
          user_id: user.id
        }])
        .select()
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error creating entry:', error)
      return { data: null, error }
    }
  },

  // Get user's journal entries
  async getEntries(options?: {
    limit?: number
    offset?: number
    theme?: string
    bookmarked?: boolean
  }): Promise<{ data: JournalEntry[] | null; error: any }> {
    validateSupabaseConfig()
    
    try {
      const { user } = await auth.getUser()
      if (!user) return { data: null, error: 'Not authenticated' }

      let query = supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (options?.theme && options.theme !== 'all') {
        query = query.eq('theme', options.theme)
      }

      if (options?.bookmarked) {
        query = query.eq('is_bookmarked', true)
      }

      if (options?.limit) {
        query = query.limit(options.limit)
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
      }

      const { data, error } = await query
      return { data, error }
    } catch (error) {
      console.error('Error getting entries:', error)
      return { data: null, error }
    }
  },

  // Update journal entry
  async updateEntry(id: string, updates: Partial<JournalEntry>): Promise<{ data: JournalEntry | null; error: any }> {
    validateSupabaseConfig()
    
    try {
      const { user } = await auth.getUser()
      if (!user) return { data: null, error: 'Not authenticated' }

      const { data, error } = await supabase
        .from('journal_entries')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error updating entry:', error)
      return { data: null, error }
    }
  },

  // Delete journal entry
  async deleteEntry(id: string): Promise<{ error: any }> {
    validateSupabaseConfig()
    
    try {
      const { user } = await auth.getUser()
      if (!user) return { error: 'Not authenticated' }

      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      return { error }
    } catch (error) {
      console.error('Error deleting entry:', error)
      return { error }
    }
  },

  // Toggle bookmark
  async toggleBookmark(id: string, isBookmarked: boolean): Promise<{ data: JournalEntry | null; error: any }> {
    return await this.updateEntry(id, { is_bookmarked: !isBookmarked })
  }
}

// Image storage functions
export const imageService = {
  // Upload image to Supabase storage
  async uploadImage(file: File, userId: string): Promise<{ data: string | null; error: any }> {
    validateSupabaseConfig()
    
    try {
      // Generate unique filename
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15)
      const fileExtension = file.name.split('.').pop()
      const fileName = `${timestamp}-${randomString}.${fileExtension}`
      const filePath = `${userId}/${fileName}`

      // Upload file to Supabase storage
      const { data, error } = await supabase.storage
        .from('journal-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Error uploading image:', error)
        return { data: null, error }
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('journal-images')
        .getPublicUrl(filePath)

      return { data: publicUrlData.publicUrl, error: null }
    } catch (error) {
      console.error('Error uploading image:', error)
      return { data: null, error }
    }
  },

  // Delete image from Supabase storage
  async deleteImage(imageUrl: string, userId: string): Promise<{ error: any }> {
    validateSupabaseConfig()
    
    try {
      // Extract file path from URL
      const url = new URL(imageUrl)
      const pathParts = url.pathname.split('/')
      const bucketIndex = pathParts.indexOf('journal-images')
      
      if (bucketIndex === -1) {
        return { error: 'Invalid image URL' }
      }
      
      const filePath = pathParts.slice(bucketIndex + 1).join('/')
      
      // Verify the file belongs to the user
      if (!filePath.startsWith(`${userId}/`)) {
        return { error: 'Unauthorized access to image' }
      }

      const { error } = await supabase.storage
        .from('journal-images')
        .remove([filePath])

      if (error) {
        console.error('Error deleting image:', error)
        return { error }
      }

      return { error: null }
    } catch (error) {
      console.error('Error deleting image:', error)
      return { error }
    }
  },

  // Get image URL (already public, but this can be used for validation)
  getImageUrl(filePath: string): string {
    const { data } = supabase.storage
      .from('journal-images')
      .getPublicUrl(filePath)
    
    return data.publicUrl
  },

  // Validate image file
  validateImageFile(file: File): { isValid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    
    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'Invalid file type. Please upload JPEG, PNG, WebP, or GIF images.' }
    }
    
    if (file.size > maxSize) {
      return { isValid: false, error: 'File size too large. Please upload images smaller than 10MB.' }
    }
    
    return { isValid: true }
  }
} 