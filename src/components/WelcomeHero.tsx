'use client'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

export function WelcomeHero() {
  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-100/20 via-transparent to-pink-100/20 rounded-3xl" />
      
      <div className="relative z-10 text-center py-12 px-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6"
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">Welcome back</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="display-2 font-bold mb-4"
        >
          <span className="gradient-text">{greeting},</span>
          <br />
          <span className="text-foreground">ready to reflect?</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-xl text-muted-foreground max-w-2xl mx-auto"
        >
          Take a moment to pause, think deeply, and capture your leadership insights.
        </motion.p>
      </div>
    </motion.div>
  )
} 