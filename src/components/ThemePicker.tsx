'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Code2, 
  Truck, 
  Building2, 
  Users, 
  Globe, 
  CheckCircle2,
  ArrowRight
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export const VALID_THEMES = [
  'technology_impact',
  'delivery_impact', 
  'business_impact',
  'team_impact',
  'org_impact'
] as const

export type ValidTheme = typeof VALID_THEMES[number]

interface ThemeConfig {
  id: ValidTheme
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  gradient: string
  color: string
}

const THEMES: ThemeConfig[] = [
  {
    id: 'technology_impact',
    title: 'Technology Impact',
    description: 'Reflect on technical decisions, architecture choices, and engineering excellence that shape your products',
    icon: Code2,
    gradient: 'from-blue-500 to-cyan-500',
    color: 'border-blue-200 hover:border-blue-300'
  },
  {
    id: 'delivery_impact',
    title: 'Delivery Impact',
    description: 'Explore project delivery strategies, process improvements, and execution that drives results',
    icon: Truck,
    gradient: 'from-emerald-500 to-teal-500',
    color: 'border-emerald-200 hover:border-emerald-300'
  },
  {
    id: 'business_impact',
    title: 'Business Impact',
    description: 'Examine strategic thinking, business value creation, and decisions that move the needle',
    icon: Building2,
    gradient: 'from-orange-500 to-red-500',
    color: 'border-orange-200 hover:border-orange-300'
  },
  {
    id: 'team_impact',
    title: 'Team Impact',
    description: 'Dive into leadership moments, team dynamics, and how you influence and inspire others',
    icon: Users,
    gradient: 'from-purple-500 to-pink-500',
    color: 'border-purple-200 hover:border-purple-300'
  },
  {
    id: 'org_impact',
    title: 'Organizational Impact',
    description: 'Consider your broader influence on culture, processes, and organizational transformation',
    icon: Globe,
    gradient: 'from-teal-500 to-blue-500',
    color: 'border-teal-200 hover:border-teal-300'
  }
]

interface ThemePickerProps {
  onThemeSelect: (theme: ValidTheme) => void
  onPromptGenerated?: (prompt: string) => void
  selectedTheme: ValidTheme | null
}

export function ThemePicker({ onThemeSelect, selectedTheme }: ThemePickerProps) {
  const router = useRouter()

  const handleThemeSelect = (theme: ValidTheme): void => {
    onThemeSelect(theme)
    // Immediately redirect to the write page for this theme
    router.push(`/write/${theme}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-3">
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-slate-900"
        >
          Choose your reflection focus
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-slate-600 max-w-lg mx-auto"
        >
          Select a leadership dimension to explore. Each theme offers unique prompts designed to unlock deeper insights about your growth journey.
        </motion.p>
      </div>

      {/* Theme Grid - 2 columns for cleaner layout */}
      <div className="grid grid-cols-2 gap-4" data-testid="theme-grid">
        {THEMES.map((theme, index) => {
          const isSelected = selectedTheme === theme.id
          const IconComponent = theme.icon

          return (
            <motion.button
              key={theme.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleThemeSelect(theme.id)}
              className={`
                group relative p-6 rounded-2xl border-2 text-left transition-all duration-300
                ${isSelected 
                  ? 'border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg' 
                  : `${theme.color} bg-white hover:shadow-lg`
                }
                cursor-pointer
              `}
            >
              {/* Selected indicator */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Icon with gradient background */}
              <div className="flex items-start space-x-4">
                <div className="relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} rounded-xl blur-lg opacity-70`}></div>
                  <div className={`relative w-12 h-12 bg-gradient-to-br ${theme.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-slate-900 group-hover:text-slate-800 transition-colors">
                    {theme.title}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    {theme.description}
                  </p>
                  
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center space-x-2 mt-3 text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span className="text-sm font-medium">Start reflection</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Selection confirmation */}
      <AnimatePresence>
        {selectedTheme && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="text-emerald-800 font-medium">
              Theme selected! Redirecting to writing interface...
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
} 