'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Home, Users, Heart, Target, MessageCircle, Award, TrendingUp } from 'lucide-react'
import { auth, userService } from '@/lib/supabase'
import type { User } from '@/lib/supabase'
import { HeaderSimple } from '@/components/HeaderSimple'
import { StreakWidget } from '@/components/StreakWidget'
import { JournalEditor } from '@/components/JournalEditor'
import toast, { Toaster } from 'react-hot-toast'

function TeamImpactContent() {
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
        <HeaderSimple user={null} />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      <Toaster />
      <HeaderSimple user={user} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Navigation */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center space-x-4 mb-8">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => router.push('/')}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-purple-200 rounded-lg hover:bg-purple-50 transition-all text-purple-700 hover:text-purple-900">
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Back to Home</span>
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => router.push('/')}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-500 transition-all text-white">
              <Home className="w-4 h-4" />
              <span className="font-medium">Home</span>
            </motion.button>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              {/* Team Theme Header */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-3xl p-8 mb-8 bg-gradient-to-br from-white/80 to-purple-50/80 backdrop-blur-xl border border-purple-200/50 shadow-xl">
                
                {/* Team collaboration pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute top-4 left-4"><Heart className="w-8 h-8 text-purple-500" /></div>
                  <div className="absolute top-4 right-4"><MessageCircle className="w-6 h-6 text-pink-500" /></div>
                  <div className="absolute bottom-4 left-12"><Award className="w-6 h-6 text-purple-400" /></div>
                  <div className="absolute bottom-4 right-12"><Target className="w-6 h-6 text-pink-400" /></div>
                  {/* Team connection visualization */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="flex items-center space-x-4">
                      <div className="w-4 h-4 rounded-full bg-purple-300"></div>
                      <div className="flex flex-col space-y-2">
                        <div className="w-3 h-3 rounded-full bg-pink-300"></div>
                        <div className="w-3 h-3 rounded-full bg-rose-300"></div>
                      </div>
                      <div className="w-4 h-4 rounded-full bg-purple-300"></div>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 flex items-center space-x-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl blur-lg opacity-70"></div>
                    <div className="relative w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg text-2xl">👥</div>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Team Impact</h1>
                    <p className="text-purple-700 text-lg leading-relaxed">
                      Dive into leadership moments, team dynamics, and how you influence and inspire others
                    </p>
                    <div className="flex items-center space-x-4 mt-4">
                      <div className="flex items-center space-x-2 text-purple-600">
                        <Heart className="w-4 h-4" />
                        <span className="text-sm font-medium">Team Culture</span>
                      </div>
                      <div className="flex items-center space-x-2 text-pink-600">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Communication</span>
                      </div>
                      <div className="flex items-center space-x-2 text-rose-600">
                        <Award className="w-4 h-4" />
                        <span className="text-sm font-medium">Recognition</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Journal Editor */}
              {generatedPrompt ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-pink-50/50 rounded-2xl"></div>
                  <div className="relative">
                    <JournalEditor selectedTheme="team_impact" generatedPrompt={generatedPrompt} />
                  </div>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-white/80 backdrop-blur-xl border border-purple-200/50 rounded-2xl p-12 text-center shadow-xl">
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-2xl">⚠️</span>
                    </div>
                    <h3 className="text-2xl font-semibold text-slate-900">Missing Reflection Prompt</h3>
                    <p className="text-slate-600 max-w-md mx-auto">Please select this theme from the home page to generate your personalized prompt.</p>
                    <button onClick={() => router.push('/')} className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                      Back to Home
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white/80 backdrop-blur-xl border border-purple-200/50 rounded-2xl p-1 shadow-lg">
                <StreakWidget />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TeamImpactPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        </div>
      </div>
    }>
      <TeamImpactContent />
    </Suspense>
  )
} 