'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Loader2, ArrowRight, Sparkles } from 'lucide-react'
import { auth } from '@/lib/supabase'
import toast from 'react-hot-toast'

export function AuthForm() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      toast.error('Please enter your email address')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsLoading(true)

    try {
      const { error } = await auth.signInWithMagicLink(email)
      
      if (error) {
        throw error
      }

      setIsEmailSent(true)
      toast.success('🎉 Magic link sent! Check your email', {
        style: {
          background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
          color: '#166534',
          fontWeight: '600',
        },
      })
    } catch (error) {
      console.error('Auth error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to send magic link')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setIsEmailSent(false)
    setEmail('')
  }

  if (isEmailSent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-auto"
      >
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-orange-200/50">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Mail className="w-8 h-8 text-white" />
            </motion.div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Check your email!</h2>
            <p className="text-slate-600 mb-6 leading-relaxed">
              We&apos;ve sent a magic link to <br />
              <span className="font-semibold text-orange-600">{email}</span>
            </p>
            
            <p className="text-sm text-slate-500 mb-8">
              Click the link in your email to sign in. The link will expire in 1 hour.
            </p>
            
            <button
              onClick={resetForm}
              className="w-full btn btn-ghost text-slate-600 hover:bg-slate-100 py-3 rounded-xl font-medium"
            >
              Use a different email
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-orange-200/50">
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          
          <h1 className="text-3xl font-bold text-slate-900 mb-3">Welcome to Next Iteration</h1>
          <p className="text-slate-600 leading-relaxed">
            Sign in with your email to begin your leadership growth journey
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full pl-12 pr-4 py-4 bg-white/80 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                disabled={isLoading}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading || !email.trim()}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Sending magic link...</span>
              </>
            ) : (
              <>
                <span>Send magic link</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200 text-center">
          <p className="text-sm text-slate-500">
            No password required. We&apos;ll send you a secure link to sign in.
          </p>
        </div>
      </div>
    </motion.div>
  )
} 