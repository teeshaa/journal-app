'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Home, Code2, Cpu, Database, GitBranch, Zap, Terminal } from 'lucide-react'
import { auth, userService } from '@/lib/supabase'
import type { User } from '@/lib/supabase'
import { HeaderSimple } from '@/components/HeaderSimple'
import { StreakWidget } from '@/components/StreakWidget'
import { JournalEditor } from '@/components/JournalEditor'
import toast, { Toaster } from 'react-hot-toast'

function TechnologyImpactContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  const generatedPrompt = searchParams.get('prompt') || ''

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

  const handleBackToHome = () => {
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        <HeaderSimple user={null} />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
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
              className="flex items-center space-x-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-all text-slate-300 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Back to Home</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition-all text-white"
            >
              <Home className="w-4 h-4" />
              <span className="font-medium">Home</span>
            </motion.button>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content Area */}
            <div className="lg:col-span-3">
              {/* Technology Theme Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-3xl p-8 mb-8 bg-gradient-to-br from-slate-800/90 to-blue-900/90 backdrop-blur-xl border border-slate-700/50"
              >
                {/* Tech Pattern Background */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-4 left-4">
                    <Code2 className="w-8 h-8 text-blue-400" />
                  </div>
                  <div className="absolute top-4 right-4">
                    <Cpu className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div className="absolute bottom-4 left-12">
                    <Database className="w-6 h-6 text-blue-300" />
                  </div>
                  <div className="absolute bottom-4 right-12">
                    <GitBranch className="w-6 h-6 text-cyan-300" />
                  </div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <Terminal className="w-16 h-16 text-slate-600" />
                  </div>
                </div>

                <div className="relative z-10 flex items-center space-x-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl blur-lg opacity-70"></div>
                    <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg text-2xl">
                      💻
                    </div>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Technology Impact</h1>
                    <p className="text-blue-200 text-lg leading-relaxed">
                      Reflect on technical decisions, architecture choices, and engineering excellence that shape your products
                    </p>
                    <div className="flex items-center space-x-4 mt-4">
                      <div className="flex items-center space-x-2 text-cyan-400">
                        <Zap className="w-4 h-4" />
                        <span className="text-sm font-medium">System Design</span>
                      </div>
                      <div className="flex items-center space-x-2 text-blue-400">
                        <Code2 className="w-4 h-4" />
                        <span className="text-sm font-medium">Code Quality</span>
                      </div>
                      <div className="flex items-center space-x-2 text-purple-400">
                        <GitBranch className="w-4 h-4" />
                        <span className="text-sm font-medium">Tech Decisions</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Journal Editor with Tech Theme */}
              {generatedPrompt ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="relative"
                >
                  {/* Tech-themed wrapper */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-800/30 to-blue-900/30 rounded-2xl"></div>
                  <div className="relative">
                    <JournalEditor 
                      selectedTheme="technology_impact"
                      generatedPrompt={generatedPrompt}
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-12 text-center"
                >
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-red-900/50 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-2xl">⚠️</span>
                    </div>
                    <h3 className="text-2xl font-semibold text-white">Missing Reflection Prompt</h3>
                    <p className="text-slate-300 max-w-md mx-auto">
                      Please select this theme from the home page to generate your personalized prompt.
                    </p>
                    <button
                      onClick={handleBackToHome}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      Back to Home
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-1">
                <StreakWidget />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TechnologyImpactPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
          </div>
        </div>
      </div>
    }>
      <TechnologyImpactContent />
    </Suspense>
  )
} 