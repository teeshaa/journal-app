'use client'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import type { User } from '@/lib/supabase'

interface WelcomeHeroProps {
  user: User
}

export function WelcomeHero({ user }: WelcomeHeroProps) {
  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening'
  
  const firstName = user.full_name?.split(' ')[0] || user.email.split('@')[0]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-100/30 via-transparent to-orange-100/20 rounded-3xl" />
      
      <div className="relative z-10 text-center py-12 px-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-flex items-center space-x-2 bg-amber-500/10 text-amber-700 px-4 py-2 rounded-full mb-6 border border-amber-200"
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">Welcome back, {firstName}</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="display-2 font-bold mb-4"
        >
          <span className="bg-gradient-to-r from-amber-600 to-orange-700 bg-clip-text text-transparent">{greeting},</span>
          <br />
          <span className="text-slate-900">ready for your next iteration?</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-xl text-slate-700 max-w-2xl mx-auto leading-relaxed"
        >
          Every great leader evolves through reflection. Capture your insights, challenges, and breakthroughs as you grow into the leader you're becoming.
        </motion.p>

        {/* User Stats */}
        {(user.total_entries > 0 || user.current_streak > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex items-center justify-center space-x-8 mt-8 text-sm"
          >
            {user.total_entries > 0 && (
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">{user.total_entries}</div>
                <div className="text-slate-600">{user.total_entries === 1 ? 'Entry' : 'Entries'}</div>
              </div>
            )}
            
            {user.current_streak > 0 && (
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{user.current_streak}</div>
                <div className="text-slate-600">Day Streak</div>
              </div>
            )}
            
            {user.total_words > 0 && (
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-700">{user.total_words.toLocaleString()}</div>
                <div className="text-slate-600">Words</div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
} 