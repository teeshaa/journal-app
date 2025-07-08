'use client'

import { motion } from 'framer-motion'
import { Building2, TrendingUp, DollarSign, Users, Lightbulb, BarChart } from 'lucide-react'
import { JournalEditor } from '../JournalEditor'
import type { ValidTheme } from '../ThemePicker'

interface BusinessThemeLayoutProps {
  theme: ValidTheme
  generatedPrompt: string
  onBackToThemes: () => void
}

export function BusinessThemeLayout({ theme, generatedPrompt, onBackToThemes }: BusinessThemeLayoutProps) {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-red-600 to-amber-600 rounded-3xl p-8 text-white"
      >
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
            <pattern id="business-pattern" width="25" height="25" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="2" height="25" fill="currentColor" opacity="0.2" />
              <rect x="5" y="5" width="2" height="20" fill="currentColor" opacity="0.3" />
              <rect x="10" y="10" width="2" height="15" fill="currentColor" opacity="0.4" />
              <rect x="15" y="3" width="2" height="22" fill="currentColor" opacity="0.2" />
              <rect x="20" y="7" width="2" height="18" fill="currentColor" opacity="0.3" />
            </pattern>
            <rect width="100" height="100" fill="url(#business-pattern)" />
          </svg>
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Business Impact</h1>
                <p className="text-orange-100">Strategy & Value Creation</p>
              </div>
            </div>
            
            <p className="text-lg text-orange-50 leading-relaxed">
              Reflect on strategic thinking, business value creation, and how technology drives organizational success and growth.
            </p>

            <div className="flex flex-wrap gap-3">
              {[
                { icon: TrendingUp, label: 'Growth' },
                { icon: DollarSign, label: 'ROI' },
                { icon: Lightbulb, label: 'Innovation' },
                { icon: BarChart, label: 'Metrics' }
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2"
                >
                  <item.icon className="w-4 h-4 text-amber-200" />
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
              <div className="relative w-32 h-32">
                {/* Business chart visualization */}
                <svg className="w-full h-full" viewBox="0 0 128 128">
                  {/* Chart bars */}
                  {[
                    { x: 20, height: 60, delay: 0.5 },
                    { x: 35, height: 80, delay: 0.6 },
                    { x: 50, height: 45, delay: 0.7 },
                    { x: 65, height: 90, delay: 0.8 },
                    { x: 80, height: 70, delay: 0.9 },
                    { x: 95, height: 100, delay: 1.0 }
                  ].map((bar, i) => (
                    <motion.rect
                      key={i}
                      initial={{ height: 0, y: 108 }}
                      animate={{ height: bar.height, y: 108 - bar.height }}
                      transition={{ delay: bar.delay, duration: 0.5 }}
                      x={bar.x}
                      width="8"
                      fill="currentColor"
                      className="text-amber-300/40"
                      rx="2"
                    />
                  ))}
                  
                  {/* Trend line */}
                  <motion.path
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.6 }}
                    transition={{ delay: 1.2, duration: 1 }}
                    d="M20 80 Q35 60 50 85 T80 50 Q90 45 103 30"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    className="text-orange-300"
                  />
                </svg>
                
                {/* Floating metrics */}
                <motion.div
                  animate={{ y: [-5, 5, -5] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-4 -right-4 w-12 h-12 bg-orange-400/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-orange-300/30"
                >
                  <TrendingUp className="w-6 h-6 text-orange-200" />
                </motion.div>
                
                <motion.div
                  animate={{ y: [5, -5, 5] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                  className="absolute -bottom-4 -left-4 w-10 h-10 bg-red-400/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-red-300/30"
                >
                  <DollarSign className="w-5 h-5 text-red-200" />
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
            title: 'Strategic Thinking',
            description: 'Long-term vision, market understanding, and decision-making',
            color: 'from-orange-500 to-red-500',
            icon: Lightbulb
          },
          {
            title: 'Value Creation',
            description: 'ROI measurement, business metrics, and impact assessment',
            color: 'from-red-500 to-amber-500',
            icon: DollarSign
          },
          {
            title: 'Stakeholder Relations',
            description: 'Communication, alignment, and partnership building',
            color: 'from-amber-500 to-orange-500',
            icon: Users
          }
        ].map((area, index) => (
          <motion.div
            key={area.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="bg-white rounded-2xl p-6 border border-orange-100 hover:border-orange-200 transition-all hover:shadow-lg group"
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