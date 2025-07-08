'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { auth, userService } from '@/lib/supabase'
import type { User } from '@/lib/supabase'
import { HeaderSimple } from '@/components/HeaderSimple'
import { ThemePicker, type ValidTheme } from '@/components/ThemePicker'
import { WelcomeHero } from '@/components/WelcomeHero'
import { StreakWidget } from '@/components/StreakWidget'
import { EntriesView } from '@/components/EntriesView'
import { AuthForm } from '@/components/AuthForm'
import { Toaster } from 'react-hot-toast'

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState<'home' | 'entries'>('home')
  const [selectedTheme, setSelectedTheme] = useState<ValidTheme | null>(null)

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { session, error } = await auth.getSession()
        
        if (error) {
          console.error('Auth error:', error)
          setUser(null)
        } else if (session?.user) {
          // Get full user profile with stats
          const { data: profile, error: profileError } = await userService.getProfile()
          if (profileError) {
            console.error('Profile error:', profileError)
            setUser(null)
          } else if (profile) {
            setUser(profile)
          }
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()

    // Listen for auth state changes
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Get full user profile with stats
        const { data: profile, error: profileError } = await userService.getProfile()
        if (profileError) {
          console.error('Profile error:', profileError)
          setUser(null)
        } else if (profile) {
          setUser(profile)
        }
        setLoading(false)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setSelectedTheme(null)
        setActiveView('home')
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleThemeSelect = (theme: ValidTheme) => {
    if (!theme) return
    setSelectedTheme(theme)
  }

  const handleViewChange = (view: 'home' | 'entries') => {
    setActiveView(view)
    // Reset theme selection when switching views
    if (view === 'entries') {
      setSelectedTheme(null)
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
        <HeaderSimple user={null} />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
          </div>
        </div>
      </div>
    )
  }

  // Show auth form if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
        <Toaster />
        <HeaderSimple user={null} />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <AuthForm />
          </div>
        </div>
      </div>
    )
  }

  // Main authenticated user interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <Toaster />
      <HeaderSimple 
        user={user} 
        activeView={activeView}
        onViewChange={handleViewChange}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content Area */}
            <div className="lg:col-span-3 space-y-8">
              {activeView === 'home' ? (
                <>
                  {/* Welcome Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <WelcomeHero user={user} />
                  </motion.div>
                  
                  {/* Theme Selection */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <ThemePicker
                      onThemeSelect={handleThemeSelect}
                      selectedTheme={selectedTheme}
                    />
                  </motion.div>
                </>
              ) : (
                /* Entries View */
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <EntriesView />
                </motion.div>
              )}
            </div>

            {/* Sidebar - Always visible */}
            <div className="lg:col-span-1 space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <StreakWidget />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

