'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Code, Truck, Building, Users, Globe, Sparkles, Check } from 'lucide-react'

// Valid themes - no defaults
const VALID_THEMES = [
  'technology_impact',
  'delivery_impact',
  'business_impact', 
  'team_impact',
  'org_impact'
] as const

type ValidTheme = typeof VALID_THEMES[number]

interface ThemeConfig {
  id: ValidTheme
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  gradient: string
  color: string
  lightColor: string
}

const themes: ReadonlyArray<ThemeConfig> = [
  {
    id: 'technology_impact',
    title: 'Technology Impact',
    description: 'Reflect on technical decisions and engineering excellence',
    icon: Code,
    gradient: 'from-blue-500 to-blue-600',
    color: 'rgb(59, 130, 246)',
    lightColor: 'rgb(219, 234, 254)',
  },
  {
    id: 'delivery_impact',
    title: 'Delivery Impact',
    description: 'Consider project delivery and process improvements',
    icon: Truck,
    gradient: 'from-green-500 to-green-600',
    color: 'rgb(34, 197, 94)',
    lightColor: 'rgb(220, 252, 231)',
  },
  {
    id: 'business_impact',
    title: 'Business Impact',
    description: 'Explore strategic thinking and business value',
    icon: Building,
    gradient: 'from-purple-500 to-purple-600',
    color: 'rgb(168, 85, 247)',
    lightColor: 'rgb(243, 232, 255)',
  },
  {
    id: 'team_impact',
    title: 'Team Impact',
    description: 'Focus on leadership and team dynamics',
    icon: Users,
    gradient: 'from-orange-500 to-orange-600',
    color: 'rgb(249, 115, 22)',
    lightColor: 'rgb(255, 237, 213)',
  },
  {
    id: 'org_impact',
    title: 'Org Impact',
    description: 'Think about organizational influence and culture',
    icon: Globe,
    gradient: 'from-teal-500 to-teal-600',
    color: 'rgb(20, 184, 166)',
    lightColor: 'rgb(204, 251, 241)',
  },
] as const

// Strict interface - no optional props with defaults
interface ThemePickerProps {
  onThemeSelect: (theme: ValidTheme) => void
  selectedTheme: ValidTheme | null
}

// Validate theme selection
function validateTheme(theme: string): ValidTheme {
  if (!VALID_THEMES.includes(theme as ValidTheme)) {
    throw new Error(`Invalid theme selection: ${theme}`)
  }
  return theme as ValidTheme
}

// Find theme configuration
function findThemeConfig(themeId: ValidTheme): ThemeConfig {
  const theme = themes.find(t => t.id === themeId)
  if (!theme) {
    throw new Error(`Theme configuration not found for: ${themeId}`)
  }
  return theme
}

export function ThemePicker({ onThemeSelect, selectedTheme }: ThemePickerProps) {
  const [hoveredTheme, setHoveredTheme] = useState<ValidTheme | null>(null)

  const handleThemeSelect = (themeId: ValidTheme): void => {
    onThemeSelect(themeId)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="heading-2 font-bold mb-2">Choose Your Focus</h2>
        <p className="text-muted-foreground">Select a reflection theme to guide your thoughts</p>
      </div>
      
      <div className="grid gap-3">
        <AnimatePresence>
          {themes.map((theme, index) => {
            const Icon = theme.icon
            const isSelected = selectedTheme === theme.id
            const isHovered = hoveredTheme === theme.id
            
            return (
              <motion.button
                key={theme.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => handleThemeSelect(theme.id)}
                onMouseEnter={() => setHoveredTheme(theme.id)}
                onMouseLeave={() => setHoveredTheme(null)}
                className={`
                  relative group w-full text-left p-5 rounded-2xl transition-all duration-300
                  ${isSelected 
                    ? 'bg-card shadow-lg ring-2 ring-primary ring-offset-2 ring-offset-background' 
                    : 'bg-card hover:shadow-md'
                  }
                `}
                type="button"
                aria-pressed={isSelected}
                aria-describedby={`theme-${theme.id}-description`}
              >
                <div className="flex items-start space-x-4">
                  <motion.div
                    animate={{
                      scale: isSelected ? 1.1 : isHovered ? 1.05 : 1,
                      rotate: isSelected ? 360 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                    className={`
                      relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${theme.gradient}
                      ${isSelected || isHovered ? 'shadow-lg' : 'shadow'}
                    `}
                    style={{
                      boxShadow: isSelected || isHovered 
                        ? `0 10px 30px -10px ${theme.color}` 
                        : undefined
                    }}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </motion.div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1 text-foreground">
                      {theme.title}
                    </h3>
                    <p 
                      id={`theme-${theme.id}-description`}
                      className="text-sm text-muted-foreground leading-relaxed"
                    >
                      {theme.description}
                    </p>
                  </div>
                  
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center justify-center w-8 h-8 bg-primary rounded-full"
                      >
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Hover effect gradient */}
                <motion.div
                  className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(600px circle at ${isHovered ? '50%' : '0%'} 50%, ${theme.lightColor}40 0%, transparent 50%)`,
                    opacity: isHovered ? 0.5 : 0,
                  }}
                />
              </motion.button>
            )
          })}
        </AnimatePresence>
      </div>
      
      <AnimatePresence>
        {selectedTheme && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-primary/10 rounded-xl border border-primary/20"
          >
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <p className="text-sm font-medium text-primary">
                Great choice! Your reflection theme is set.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Export types for use in other components
export type { ValidTheme, ThemeConfig } 