'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Home } from 'lucide-react'
import { auth, userService } from '@/lib/supabase'
import type { User } from '@/lib/supabase'
import { VALID_THEMES, type ValidTheme } from '@/components/ThemePicker'
import { HeaderSimple } from '@/components/HeaderSimple'
import { StreakWidget } from '@/components/StreakWidget'
import { TechnologyThemeLayout } from '@/components/themes/TechnologyThemeLayout'
import { DeliveryThemeLayout } from '@/components/themes/DeliveryThemeLayout'
import { BusinessThemeLayout } from '@/components/themes/BusinessThemeLayout'
import { TeamThemeLayout } from '@/components/themes/TeamThemeLayout'
import { OrgThemeLayout } from '@/components/themes/OrgThemeLayout'
import toast, { Toaster } from 'react-hot-toast'

export default function ThemePage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('')
  
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

  // Auto-generate prompt when theme page loads
  useEffect(() => {
    if (validTheme && user && !generatedPrompt) {
      generatePromptForTheme()
    }
  }, [validTheme, user, generatedPrompt])

  const generatePromptForTheme = async () => {
    if (!validTheme) return

    try {
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
    }
  }

  const handleBackToThemes = () => {
    router.push('/')
  }

  const renderThemeLayout = () => {
    if (!validTheme) return null

    const commonProps = {
      theme: validTheme,
      generatedPrompt,
      onBackToThemes: handleBackToThemes
    }

    switch (validTheme) {
      case 'technology_impact':
        return <TechnologyThemeLayout {...commonProps} />
      case 'delivery_impact':
        return <DeliveryThemeLayout {...commonProps} />
      case 'business_impact':
        return <BusinessThemeLayout {...commonProps} />
      case 'team_impact':
        return <TeamThemeLayout {...commonProps} />
      case 'org_impact':
        return <OrgThemeLayout {...commonProps} />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
        <HeaderSimple />
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
              onClick={handleBackToThemes}
              className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-all text-slate-700 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Back to Themes</span>
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
              {renderThemeLayout()}
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