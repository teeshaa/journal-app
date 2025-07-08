'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Home, Loader2 } from 'lucide-react'
import { auth, userService } from '@/lib/supabase'
import type { User } from '@/lib/supabase'
import { VALID_THEMES, type ValidTheme } from '@/components/ThemePicker'
import { HeaderSimple } from '@/components/HeaderSimple'
import { StreakWidget } from '@/components/StreakWidget'
import { JournalEditor } from '@/components/JournalEditor'
import toast, { Toaster } from 'react-hot-toast'

const THEME_INFO = {
  technology_impact: {
    title: 'Technology Impact',
    description: 'Reflection on technical decisions and engineering excellence',
    icon: '💻',
    gradient: 'from-blue-500 to-cyan-500'
  },
  delivery_impact: {
    title: 'Delivery Impact', 
    description: 'Reflection on project delivery and process improvements',
    icon: '🚀',
    gradient: 'from-emerald-500 to-teal-500'
  },
  business_impact: {
    title: 'Business Impact',
    description: 'Reflection on strategic thinking and business value',
    icon: '📈', 
    gradient: 'from-orange-500 to-red-500'
  },
  team_impact: {
    title: 'Team Impact',
    description: 'Reflection on leadership and team dynamics', 
    icon: '👥',
    gradient: 'from-purple-500 to-pink-500'
  },
  org_impact: {
    title: 'Org Impact',
    description: 'Reflection on organizational influence and culture',
    icon: '🌍',
    gradient: 'from-teal-500 to-blue-500'
  }
}

export default function WritePage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('')
  const [promptLoading, setPromptLoading] = useState(true)
  
  const theme = params.theme as string
  const validTheme = VALID_THEMES.includes(theme as ValidTheme) ? (theme as ValidTheme) : null

  // Check authentication and get user
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { session, error } = await auth.getSession()
        
        if (error || !session?.user) {
          router.push('/')
          return
        }
        
        // Get full user profile with stats
        const { data: profile, error: profileError } = await userService.getProfile()
        if (profileError) {
          console.error('Profile error:', profileError)
          router.push('/')
          return
        } else if (profile) {
          setUser(profile)
        }
      } catch (error) {
        console.error('Auth error:', error)
        router.push('/')
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()
  }, [router])

  // Validate theme
  useEffect(() => {
    if (!loading && !validTheme) {
      toast.error('Invalid theme selected', {
        position: 'top-right',
        style: {
          background: '#fee2e2',
          color: '#dc2626',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          fontWeight: '500',
        },
      })
      router.push('/')
    }
  }, [validTheme, loading, router])

  // Generate prompt when page loads
  useEffect(() => {
    if (validTheme && user && !generatedPrompt) {
      generatePromptForTheme()
    }
  }, [validTheme, user, generatedPrompt])

  const generatePromptForTheme = async () => {
    if (!validTheme) return

    try {
      setPromptLoading(true)
      const { session } = await auth.getSession()
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const response = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers,
        body: JSON.stringify({ theme: validTheme })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.details || 'Failed to generate prompt')
      }

      const data = await response.json()
      
      if (data.prompt) {
        setGeneratedPrompt(data.prompt)
        
        if (data.contextUsed && data.previousEntriesCount > 0) {
          toast.success(`✨ Personalized prompt generated using ${data.previousEntriesCount} previous entries!`, {
            position: 'top-right',
            style: {
              background: '#dcfce7',
              color: '#166534',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              fontWeight: '500',
            },
          })
        }
      }
      
    } catch (error) {
      console.error('Error generating prompt:', error)
      toast.error('Failed to generate reflection prompt', {
        position: 'top-right',
        style: {
          background: '#fee2e2',
          color: '#dc2626',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          fontWeight: '500',
        },
      })
    } finally {
      setPromptLoading(false)
    }
  }

  const handleBackToHome = () => {
    router.push('/')
  }

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

  if (!user || !validTheme) {
    return null
  }

  const themeInfo = THEME_INFO[validTheme]

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <Toaster />
      <HeaderSimple user={user} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-4 mb-8"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBackToHome}
              className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-all text-slate-700 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Back to Home</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/')}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all text-slate-700 hover:text-slate-900"
            >
              <Home className="w-4 h-4" />
              <span className="font-medium">Home</span>
            </motion.button>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content Area */}
            <div className="lg:col-span-3">
              {/* Theme Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-base p-8 mb-8"
              >
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className={`absolute inset-0 bg-gradient-to-br ${themeInfo.gradient} rounded-2xl blur-lg opacity-70`}></div>
                    <div className={`relative w-16 h-16 bg-gradient-to-br ${themeInfo.gradient} rounded-2xl flex items-center justify-center shadow-lg text-2xl`}>
                      {themeInfo.icon}
                    </div>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900">{themeInfo.title}</h1>
                    <p className="text-slate-600 mt-2">{themeInfo.description}</p>
                  </div>
                </div>
              </motion.div>

              {/* Journal Editor */}
              {promptLoading ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card-base p-12 text-center"
                >
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                      <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
                    </div>
                    <h3 className="text-2xl font-semibold text-slate-900">Creating your personalized prompt</h3>
                    <p className="text-slate-600 max-w-md mx-auto">
                      We're generating a thoughtful reflection question tailored to your journey...
                    </p>
                  </div>
                </motion.div>
              ) : generatedPrompt ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <JournalEditor 
                    selectedTheme={validTheme}
                    generatedPrompt={generatedPrompt}
                  />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card-base p-12 text-center"
                >
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-2xl">⚠️</span>
                    </div>
                    <h3 className="text-2xl font-semibold text-slate-900">Unable to generate prompt</h3>
                    <p className="text-slate-600 max-w-md mx-auto">
                      There was an issue creating your reflection prompt. Please try again.
                    </p>
                    <button
                      onClick={generatePromptForTheme}
                      className="btn btn-primary px-6 py-3"
                    >
                      Try Again
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <StreakWidget />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 