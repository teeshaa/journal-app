'use client'

import { motion } from 'framer-motion'
import { Truck, CheckCircle, Clock, Target, Zap, BarChart3 } from 'lucide-react'
import { JournalEditor } from '../JournalEditor'
import type { ValidTheme } from '../ThemePicker'

interface DeliveryThemeLayoutProps {
  theme: ValidTheme
  generatedPrompt: string
  onBackToThemes: () => void
}

export function DeliveryThemeLayout({ theme, generatedPrompt, onBackToThemes }: DeliveryThemeLayoutProps) {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-green-600 rounded-3xl p-8 text-white"
      >
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
            <pattern id="delivery-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              <circle cx="10" cy="10" r="1" fill="currentColor" opacity="0.3" />
            </pattern>
            <rect width="100" height="100" fill="url(#delivery-grid)" />
          </svg>
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Delivery Impact</h1>
                <p className="text-emerald-100">Quality & Process Excellence</p>
              </div>
            </div>
            
            <p className="text-lg text-emerald-50 leading-relaxed">
              Focus on delivery quality, process improvements, and building reliable systems that consistently deliver value.
            </p>

            <div className="flex flex-wrap gap-3">
              {[
                { icon: CheckCircle, label: 'Quality' },
                { icon: Clock, label: 'Timeline' },
                { icon: Target, label: 'Goals' },
                { icon: Zap, label: 'Efficiency' }
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2"
                >
                  <item.icon className="w-4 h-4 text-teal-200" />
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
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-32 h-32 relative"
              >
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="absolute w-8 h-8 bg-emerald-300/30 rounded border border-emerald-200/50 flex items-center justify-center"
                    style={{
                      left: `calc(50% + ${Math.cos(i * 45 * Math.PI / 180) * 40}px - 16px)`,
                      top: `calc(50% + ${Math.sin(i * 45 * Math.PI / 180) * 40}px - 16px)`,
                    }}
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-200" />
                  </motion.div>
                ))}
              </motion.div>
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
            title: 'Process Excellence',
            description: 'Continuous improvement and workflow optimization',
            color: 'from-emerald-500 to-teal-500',
            icon: BarChart3
          },
          {
            title: 'Quality Assurance',
            description: 'Testing, validation, and error prevention',
            color: 'from-teal-500 to-green-500',
            icon: CheckCircle
          },
          {
            title: 'Timeline Management',
            description: 'Planning, estimation, and delivery predictability',
            color: 'from-green-500 to-emerald-500',
            icon: Clock
          }
        ].map((area, index) => (
          <motion.div
            key={area.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="bg-white rounded-2xl p-6 border border-emerald-100 hover:border-emerald-200 transition-all hover:shadow-lg group"
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