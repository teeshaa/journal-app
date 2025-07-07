'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/Header'
import { ThemePicker } from '@/components/ThemePicker'
import { JournalEditor } from '@/components/JournalEditor'
import { EntriesView } from '@/components/EntriesView'
import { StreakWidget } from '@/components/StreakWidget'
import { QuickStats } from '@/components/QuickStats'
import { WelcomeHero } from '@/components/WelcomeHero'
import type { ValidTheme } from '@/components/ThemePicker'

export default function Home() {
  const [selectedTheme, setSelectedTheme] = useState<ValidTheme | null>(null)
  const [activeView, setActiveView] = useState<'write' | 'entries'>('write')

  const handleThemeSelect = (theme: ValidTheme): void => {
    setSelectedTheme(theme)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-pink-50/20">
      <Header activeView={activeView} onViewChange={setActiveView} />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Hero Section */}
          <WelcomeHero />

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StreakWidget />
            <QuickStats />
          </div>

          <AnimatePresence mode="wait">
            {activeView === 'write' ? (
              <motion.div
                key="write"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="grid lg:grid-cols-3 gap-8"
              >
                {/* Left Sidebar - Theme Selection */}
                <div className="lg:col-span-1 space-y-6">
                  <ThemePicker 
                    onThemeSelect={handleThemeSelect}
                    selectedTheme={selectedTheme}
                  />
                </div>

                {/* Main Content - Journal Editor */}
                <div className="lg:col-span-2">
                  <JournalEditor selectedTheme={selectedTheme} />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="entries"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <EntriesView />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  )
}
