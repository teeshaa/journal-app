'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, userService } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { Loader2, Sparkles } from 'lucide-react'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          router.push('/?error=auth_error')
          return
        }

        if (data.session) {
          // Update last sign in time
          await userService.updateLastSignIn()
          
          // Redirect to main app
          router.push('/')
        } else {
          // No session found, redirect back
          router.push('/')
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error)
        router.push('/?error=unexpected_error')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/30 to-yellow-50/40 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-orange-200/50 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <Sparkles className="w-8 h-8 text-white" />
        </motion.div>
        
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Signing you in...</h2>
        <p className="text-slate-600 mb-6">
          Please wait while we complete your authentication
        </p>
        
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
          <span className="text-sm text-slate-500">This should only take a moment</span>
        </div>
      </motion.div>
    </div>
  )
} 