'use client'

import { motion } from 'framer-motion'
import { Users, Heart, Target, MessageCircle, Award, TrendingUp } from 'lucide-react'
import { JournalEditor } from '../JournalEditor'
import type { ValidTheme } from '../ThemePicker'

interface TeamThemeLayoutProps {
  theme: ValidTheme
  generatedPrompt: string
  onBackToThemes: () => void
}

export function TeamThemeLayout({ theme, generatedPrompt, onBackToThemes }: TeamThemeLayoutProps) {
  return (
    <div className="space-y-8">
      {/* Team-themed Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 rounded-3xl p-8 text-white"
      >
        {/* Team Pattern Background */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 200 200" fill="none">
            <defs>
              <pattern id="team-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="3" fill="currentColor" opacity="0.3" />
                <circle cx="8" cy="8" r="2" fill="currentColor" opacity="0.2" />
                <circle cx="32" cy="8" r="2" fill="currentColor" opacity="0.2" />
                <circle cx="8" cy="32" r="2" fill="currentColor" opacity="0.2" />
                <circle cx="32" cy="32" r="2" fill="currentColor" opacity="0.2" />
                <path d="M20 17 L8 5 M20 17 L32 5 M20 17 L8 29 M20 17 L32 29" stroke="currentColor" strokeWidth="0.5" opacity="0.1" />
              </pattern>
            </defs>
            <rect width="200" height="200" fill="url(#team-pattern)" />
          </svg>
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Team Impact</h1>
                <p className="text-purple-100">Leadership & Team Dynamics</p>
              </div>
            </div>
            
            <p className="text-lg text-purple-50 leading-relaxed">
              Explore your leadership style, team relationships, and the impact you have on individual growth and collective success.
            </p>

            <div className="flex flex-wrap gap-3">
              {[
                { icon: Heart, label: 'Empathy' },
                { icon: MessageCircle, label: 'Communication' },
                { icon: Target, label: 'Goal Alignment' },
                { icon: TrendingUp, label: 'Growth' }
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2"
                >
                  <item.icon className="w-4 h-4 text-pink-200" />
                  <span className="text-sm font-medium text-white">{item.label}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="w-48 h-48 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 flex items-center justify-center">
                <div className="relative w-32 h-32">
                  {/* Central leader circle */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-pink-300/40 rounded-full border-2 border-pink-200/60 flex items-center justify-center"
                  >
                    <Users className="w-6 h-6 text-pink-100" />
                  </motion.div>
                  
                  {/* Team member circles */}
                  {Array.from({ length: 6 }).map((_, i) => {
                    const angle = (i * 60) * (Math.PI / 180)
                    const radius = 45
                    const x = Math.cos(angle) * radius
                    const y = Math.sin(angle) * radius
                    
                    return (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ 
                          delay: 0.7 + i * 0.1, 
                          duration: 0.3,
                        }}
                        className="absolute w-8 h-8 bg-purple-300/30 rounded-full border border-purple-200/50 flex items-center justify-center"
                        style={{
                          left: `calc(50% + ${x}px - 16px)`,
                          top: `calc(50% + ${y}px - 16px)`,
                        }}
                      >
                        <motion.div
                          animate={{ 
                            scale: [1, 1.2, 1],
                          }}
                          transition={{ 
                            duration: 2, 
                            delay: i * 0.3,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className="w-2 h-2 bg-purple-200 rounded-full"
                        />
                      </motion.div>
                    )
                  })}
                  
                  {/* Connection lines */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 128 128">
                    {Array.from({ length: 6 }).map((_, i) => {
                      const angle = (i * 60) * (Math.PI / 180)
                      const radius = 45
                      const x = 64 + Math.cos(angle) * radius
                      const y = 64 + Math.sin(angle) * radius
                      
                      return (
                        <motion.line
                          key={i}
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: 1, opacity: 0.3 }}
                          transition={{ delay: 1 + i * 0.1, duration: 0.5 }}
                          x1="64" y1="64" x2={x} y2={y}
                          stroke="currentColor"
                          strokeWidth="1"
                          className="text-pink-200"
                        />
                      )
                    })}
                  </svg>
                </div>
              </div>
              
              {/* Floating icons */}
              <motion.div
                animate={{ 
                  y: [-8, 8, -8],
                  rotate: [0, 5, 0]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="absolute -top-4 -right-4 w-12 h-12 bg-pink-400/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-pink-300/30"
              >
                <Heart className="w-6 h-6 text-pink-200" />
              </motion.div>
              
              <motion.div
                animate={{ 
                  y: [8, -8, 8],
                  rotate: [0, -5, 0]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 1.5
                }}
                className="absolute -bottom-4 -left-4 w-10 h-10 bg-purple-400/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-purple-300/30"
              >
                <Award className="w-5 h-5 text-purple-200" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Key Focus Areas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {[
          {
            title: 'Leadership Style',
            description: 'Adaptability, communication, and decision-making approach',
            color: 'from-purple-500 to-pink-500',
            icon: Users
          },
          {
            title: 'Team Dynamics',
            description: 'Collaboration, conflict resolution, and team health',
            color: 'from-pink-500 to-rose-500',
            icon: Heart
          },
          {
            title: 'Individual Growth',
            description: 'Mentoring, feedback, and career development support',
            color: 'from-rose-500 to-purple-500',
            icon: TrendingUp
          }
        ].map((area, index) => (
          <motion.div
            key={area.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="bg-white rounded-2xl p-6 border border-purple-100 hover:border-purple-200 transition-all hover:shadow-lg group"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className={`w-10 h-10 bg-gradient-to-br ${area.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <area.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900">{area.title}</h3>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">{area.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Journal Editor */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <JournalEditor 
          selectedTheme={theme}
          generatedPrompt={generatedPrompt}
        />
      </motion.div>
    </div>
  )
} 