'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Home, Globe, Network, Layers, Compass, Star, Zap } from 'lucide-react'
import { auth, userService } from '@/lib/supabase'
import type { User } from '@/lib/supabase'
import { HeaderSimple } from '@/components/HeaderSimple'
import { StreakWidget } from '@/components/StreakWidget'
import { JournalEditor } from '@/components/JournalEditor'
import toast, { Toaster } from 'react-hot-toast'

function OrganizationalImpactContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  const generatedPrompt = searchParams.get('prompt') || ''

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { session, error } = await auth.getSession()
        if (error || !session?.user) {
          router.push('/')
          return
        }
        const { data: profile, error: profileError } = await userService.getProfile()
        if (profileError) {
          router.push('/')
          return
        } else if (profile) {
          setUser(profile)
        }
      } catch (error) {
        router.push('/')
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
        <HeaderSimple user={null} />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
      <Toaster />
      <HeaderSimple user={user} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Navigation */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center space-x-4 mb-8">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => router.push('/')}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-teal-200 rounded-lg hover:bg-teal-50 transition-all text-teal-700 hover:text-teal-900">
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Back to Home</span>
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => router.push('/')}
              className="flex items-center space-x-2 px-4 py-2 bg-teal-600 rounded-lg hover:bg-teal-500 transition-all text-white">
              <Home className="w-4 h-4" />
              <span className="font-medium">Home</span>
            </motion.button>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              {/* Organizational Theme Header */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-3xl p-8 mb-8 bg-gradient-to-br from-white/80 to-teal-50/80 backdrop-blur-xl border border-teal-200/50 shadow-xl">
                
                {/* Organizational network pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute top-4 left-4"><Network className="w-8 h-8 text-teal-500" /></div>
                  <div className="absolute top-4 right-4"><Layers className="w-6 h-6 text-cyan-500" /></div>
                  <div className="absolute bottom-4 left-12"><Compass className="w-6 h-6 text-teal-400" /></div>
                  <div className="absolute bottom-4 right-12"><Star className="w-6 h-6 text-cyan-400" /></div>
                  {/* Organizational hierarchy visualization */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="w-4 h-4 rounded-full bg-teal-300"></div>
                      <div className="flex items-center space-x-6">
                        <div className="w-3 h-3 rounded-full bg-cyan-300"></div>
                        <div className="w-3 h-3 rounded-full bg-blue-300"></div>
                        <div className="w-3 h-3 rounded-full bg-cyan-300"></div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-2 h-2 rounded-full bg-teal-200"></div>
                        <div className="w-2 h-2 rounded-full bg-cyan-200"></div>
                        <div className="w-2 h-2 rounded-full bg-blue-200"></div>
                        <div className="w-2 h-2 rounded-full bg-cyan-200"></div>
                        <div className="w-2 h-2 rounded-full bg-teal-200"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 flex items-center space-x-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-blue-500 rounded-2xl blur-lg opacity-70"></div>
                    <div className="relative w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg text-2xl">🌍</div>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Organizational Impact</h1>
                    <p className="text-teal-700 text-lg leading-relaxed">
                      Consider your broader influence on culture, processes, and organizational transformation
                    </p>
                    <div className="flex items-center space-x-4 mt-4">
                      <div className="flex items-center space-x-2 text-teal-600">
                        <Network className="w-4 h-4" />
                        <span className="text-sm font-medium">System Change</span>
                      </div>
                      <div className="flex items-center space-x-2 text-cyan-600">
                        <Layers className="w-4 h-4" />
                        <span className="text-sm font-medium">Culture Shift</span>
                      </div>
                      <div className="flex items-center space-x-2 text-blue-600">
                        <Compass className="w-4 h-4" />
                        <span className="text-sm font-medium">Vision Setting</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Journal Editor */}
              {generatedPrompt ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 to-cyan-50/50 rounded-2xl"></div>
                  <div className="relative">
                    <JournalEditor selectedTheme="org_impact" generatedPrompt={generatedPrompt} />
                  </div>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-white/80 backdrop-blur-xl border border-teal-200/50 rounded-2xl p-12 text-center shadow-xl">
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-2xl">⚠️</span>
                    </div>
                    <h3 className="text-2xl font-semibold text-slate-900">Missing Reflection Prompt</h3>
                    <p className="text-slate-600 max-w-md mx-auto">Please select this theme from the home page to generate your personalized prompt.</p>
                    <button onClick={() => router.push('/')} className="bg-teal-600 hover:bg-teal-500 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                      Back to Home
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white/80 backdrop-blur-xl border border-teal-200/50 rounded-2xl p-1 shadow-lg">
                <StreakWidget />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OrganizationalImpactPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
          </div>
        </div>
      </div>
    }>
      <OrganizationalImpactContent />
    </Suspense>
  )
} 