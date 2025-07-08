'use client'

import { motion } from 'framer-motion'
import { Code2, Cpu, Database, GitBranch, Zap, ArrowLeft } from 'lucide-react'
import { JournalEditor } from '../JournalEditor'
import type { ValidTheme } from '../ThemePicker'

interface TechnologyThemeLayoutProps {
  theme: ValidTheme
  generatedPrompt: string
  onBackToThemes: () => void
}

export function TechnologyThemeLayout({ theme, generatedPrompt, onBackToThemes }: TechnologyThemeLayoutProps) {
  return (
    <div className="space-y-8">
      {/* Tech-themed Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 rounded-3xl p-8 text-white"
      >
        {/* Tech Pattern Background */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
            <pattern id="tech-grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
            <rect width="100" height="100" fill="url(#tech-grid)" />
            <circle cx="20" cy="20" r="2" fill="currentColor" opacity="0.3" />
            <circle cx="80" cy="30" r="1.5" fill="currentColor" opacity="0.4" />
            <circle cx="60" cy="70" r="1" fill="currentColor" opacity="0.5" />
            <circle cx="30" cy="80" r="2.5" fill="currentColor" opacity="0.2" />
          </svg>
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Technology Impact</h1>
                <p className="text-blue-100">Engineering Excellence & Innovation</p>
              </div>
            </div>
            
            <p className="text-lg text-blue-50 leading-relaxed">
              Reflect on technical decisions, architectural choices, and engineering practices that drive innovation and sustainable growth.
            </p>

            <div className="flex flex-wrap gap-3">
              {[
                { icon: Cpu, label: 'Architecture' },
                { icon: Database, label: 'Data Strategy' },
                { icon: GitBranch, label: 'DevOps' },
                { icon: Zap, label: 'Performance' }
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2"
                >
                  <item.icon className="w-4 h-4 text-cyan-200" />
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
                <div className="grid grid-cols-3 gap-2 p-4">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 1, 0.3] }}
                      transition={{ 
                        duration: 2, 
                        delay: i * 0.1, 
                        repeat: Infinity, 
                        repeatType: 'reverse' 
                      }}
                      className="w-8 h-8 bg-cyan-300/30 rounded border border-cyan-200/50"
                    />
                  ))}
                </div>
              </div>
              
              {/* Floating tech icons */}
              <motion.div
                animate={{ 
                  y: [-10, 10, -10],
                  rotate: [0, 5, 0]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="absolute -top-4 -right-4 w-12 h-12 bg-cyan-400/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-cyan-300/30"
              >
                <Cpu className="w-6 h-6 text-cyan-200" />
              </motion.div>
              
              <motion.div
                animate={{ 
                  y: [10, -10, 10],
                  rotate: [0, -5, 0]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 1
                }}
                className="absolute -bottom-4 -left-4 w-10 h-10 bg-blue-400/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-blue-300/30"
              >
                <Database className="w-5 h-5 text-blue-200" />
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
            title: 'Technical Excellence',
            description: 'Code quality, testing, and maintainable architecture',
            color: 'from-blue-500 to-cyan-500',
            icon: Code2
          },
          {
            title: 'Innovation Strategy',
            description: 'Emerging technologies and strategic tech decisions',
            color: 'from-cyan-500 to-teal-500',
            icon: Zap
          },
          {
            title: 'Engineering Culture',
            description: 'Team practices, knowledge sharing, and growth',
            color: 'from-teal-500 to-blue-500',
            icon: GitBranch
          }
        ].map((area, index) => (
          <motion.div
            key={area.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="bg-white rounded-2xl p-6 border border-blue-100 hover:border-blue-200 transition-all hover:shadow-lg group"
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