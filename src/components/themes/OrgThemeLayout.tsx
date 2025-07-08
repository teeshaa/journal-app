'use client'

import { motion } from 'framer-motion'
import { Globe, Network, Layers, Compass, Star, Zap } from 'lucide-react'
import { JournalEditor } from '../JournalEditor'
import type { ValidTheme } from '../ThemePicker'

interface OrgThemeLayoutProps {
  theme: ValidTheme
  generatedPrompt: string
  onBackToThemes: () => void
}

export function OrgThemeLayout({ theme, generatedPrompt, onBackToThemes }: OrgThemeLayoutProps) {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-blue-600 to-indigo-600 rounded-3xl p-8 text-white"
      >
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 120 120" fill="none">
            <pattern id="org-network" width="30" height="30" patternUnits="userSpaceOnUse">
              <circle cx="15" cy="15" r="3" fill="currentColor" opacity="0.3" />
              <circle cx="5" cy="5" r="1.5" fill="currentColor" opacity="0.2" />
              <circle cx="25" cy="5" r="1.5" fill="currentColor" opacity="0.2" />
              <circle cx="5" cy="25" r="1.5" fill="currentColor" opacity="0.2" />
              <circle cx="25" cy="25" r="1.5" fill="currentColor" opacity="0.2" />
              <path d="M15 12 L5 2 M15 12 L25 2 M15 12 L5 22 M15 12 L25 22 M15 18 L15 12" stroke="currentColor" strokeWidth="0.5" opacity="0.1" />
            </pattern>
            <rect width="120" height="120" fill="url(#org-network)" />
          </svg>
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Organizational Impact</h1>
                <p className="text-teal-100">Culture & Strategic Influence</p>
              </div>
            </div>
            
            <p className="text-lg text-teal-50 leading-relaxed">
              Explore your broader organizational influence, culture building efforts, and cross-functional leadership impact.
            </p>

            <div className="flex flex-wrap gap-3">
              {[
                { icon: Network, label: 'Networks' },
                { icon: Layers, label: 'Structure' },
                { icon: Compass, label: 'Vision' },
                { icon: Star, label: 'Culture' }
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2"
                >
                  <item.icon className="w-4 h-4 text-blue-200" />
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
              className="relative w-48 h-48 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 flex items-center justify-center"
            >
              <div className="relative w-40 h-40">
                {/* Organizational network visualization */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-blue-300/40 rounded-full border-2 border-blue-200/60 flex items-center justify-center"
                >
                  <Globe className="w-8 h-8 text-blue-100" />
                </motion.div>
                
                {/* Orbital departments */}
                {Array.from({ length: 5 }).map((_, i) => {
                  const angle = (i * 72) * (Math.PI / 180)
                  const radius = 60
                  const x = Math.cos(angle) * radius
                  const y = Math.sin(angle) * radius
                  
                  return (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.8 + i * 0.15, duration: 0.4 }}
                      className="absolute w-12 h-12 bg-teal-300/30 rounded-full border border-teal-200/50 flex items-center justify-center"
                      style={{
                        left: `calc(50% + ${x}px - 24px)`,
                        top: `calc(50% + ${y}px - 24px)`,
                      }}
                    >
                      <motion.div
                        animate={{ 
                          rotate: [0, 360],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ 
                          duration: 8, 
                          delay: i * 1,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="w-6 h-6 bg-teal-200/60 rounded-full flex items-center justify-center"
                      >
                        <Network className="w-3 h-3 text-teal-100" />
                      </motion.div>
                    </motion.div>
                  )
                })}
                
                {/* Connecting lines */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 160 160">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const angle = (i * 72) * (Math.PI / 180)
                    const radius = 60
                    const x = 80 + Math.cos(angle) * radius
                    const y = 80 + Math.sin(angle) * radius
                    
                    return (
                      <motion.line
                        key={i}
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 0.3 }}
                        transition={{ delay: 1.2 + i * 0.1, duration: 0.6 }}
                        x1="80" y1="80" x2={x} y2={y}
                        stroke="currentColor"
                        strokeWidth="1"
                        className="text-blue-200"
                        strokeDasharray="2,2"
                      />
                    )
                  })}
                </svg>
                
                {/* Floating influence indicators */}
                <motion.div
                  animate={{ 
                    y: [-6, 6, -6],
                    rotate: [0, 10, 0]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="absolute -top-4 -right-4 w-12 h-12 bg-blue-400/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-blue-300/30"
                >
                  <Star className="w-6 h-6 text-blue-200" />
                </motion.div>
                
                <motion.div
                  animate={{ 
                    y: [6, -6, 6],
                    rotate: [0, -10, 0]
                  }}
                  transition={{ 
                    duration: 5, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: 2
                  }}
                  className="absolute -bottom-4 -left-4 w-10 h-10 bg-teal-400/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-teal-300/30"
                >
                  <Zap className="w-5 h-5 text-teal-200" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {[
          {
            title: 'Cultural Leadership',
            description: 'Values, behaviors, and organizational transformation',
            color: 'from-teal-500 to-blue-500',
            icon: Star
          },
          {
            title: 'Cross-functional Impact',
            description: 'Collaboration, influence, and system-wide improvements',
            color: 'from-blue-500 to-indigo-500',
            icon: Network
          },
          {
            title: 'Strategic Vision',
            description: 'Long-term thinking, innovation, and organizational direction',
            color: 'from-indigo-500 to-teal-500',
            icon: Compass
          }
        ].map((area, index) => (
          <motion.div
            key={area.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="bg-white rounded-2xl p-6 border border-teal-100 hover:border-teal-200 transition-all hover:shadow-lg group"
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