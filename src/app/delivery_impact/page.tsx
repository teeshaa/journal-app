'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Home, Truck, CheckCircle2, Target, Clock, Zap, TrendingUp } from 'lucide-react'
import { auth, userService } from '@/lib/supabase'
import type { User } from '@/lib/supabase'
import { HeaderSimple } from '@/components/HeaderSimple'
import { StreakWidget } from '@/components/StreakWidget'
import { JournalEditor } from '@/components/JournalEditor'
import toast, { Toaster } from 'react-hot-toast'

function DeliveryImpactContent() {
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
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <HeaderSimple user={null} />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
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
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-all text-emerald-700 hover:text-emerald-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Back to Home</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/')}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 rounded-lg hover:bg-emerald-500 transition-all text-white"
            >
              <Home className="w-4 h-4" />
              <span className="font-medium">Home</span>
            </motion.button>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content Area */}
            <div className="lg:col-span-3">
              {/* Delivery Theme Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-3xl p-8 mb-8 bg-gradient-to-br from-white/80 to-emerald-50/80 backdrop-blur-xl border border-emerald-200/50 shadow-xl"
              >
                {/* Delivery Pattern Background */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute top-4 left-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <div className="absolute top-4 right-4">
                    <Target className="w-6 h-6 text-teal-500" />
                  </div>
                  <div className="absolute bottom-4 left-12">
                    <Clock className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="absolute bottom-4 right-12">
                    <TrendingUp className="w-6 h-6 text-teal-400" />
                  </div>
                  {/* Process flow visualization */}
                  <div className="absolute top-1/2 left-1/4 transform -translate-y-1/2">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-300"></div>
                      <div className="w-8 h-0.5 bg-emerald-300"></div>
                      <div className="w-3 h-3 rounded-full bg-teal-300"></div>
                      <div className="w-8 h-0.5 bg-teal-300"></div>
                      <div className="w-3 h-3 rounded-full bg-cyan-300"></div>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 flex items-center space-x-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl blur-lg opacity-70"></div>
                    <div className="relative w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg text-2xl">
                      🚀
                    </div>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Delivery Impact</h1>
                    <p className="text-emerald-700 text-lg leading-relaxed">
                      Explore project delivery strategies, process improvements, and execution that drives results
                    </p>
                    <div className="flex items-center space-x-4 mt-4">
                      <div className="flex items-center space-x-2 text-emerald-600">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-sm font-medium">Process Excellence</span>
                      </div>
                      <div className="flex items-center space-x-2 text-teal-600">
                        <Target className="w-4 h-4" />
                        <span className="text-sm font-medium">Goal Achievement</span>
                      </div>
                      <div className="flex items-center space-x-2 text-cyan-600">
                        <Zap className="w-4 h-4" />
                        <span className="text-sm font-medium">Efficiency</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Journal Editor with Delivery Theme */}
              {generatedPrompt ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="relative"
                >
                  {/* Delivery-themed wrapper */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 rounded-2xl"></div>
                  <div className="relative">
                    <JournalEditor 
                      selectedTheme="delivery_impact"
                      generatedPrompt={generatedPrompt}
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/80 backdrop-blur-xl border border-emerald-200/50 rounded-2xl p-12 text-center shadow-xl"
                >
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-2xl">⚠️</span>
                    </div>
                    <h3 className="text-2xl font-semibold text-slate-900">Missing Reflection Prompt</h3>
                    <p className="text-slate-600 max-w-md mx-auto">
                      Please select this theme from the home page to generate your personalized prompt.
                    </p>
                    <button
                      onClick={handleBackToHome}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      Back to Home
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white/80 backdrop-blur-xl border border-emerald-200/50 rounded-2xl p-1 shadow-lg">
                <StreakWidget />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DeliveryImpactPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        </div>
      </div>
    }>
      <DeliveryImpactContent />
    </Suspense>
  )
} 