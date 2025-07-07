'use client'

import { motion } from 'framer-motion'
import { BookOpen, PenTool, LayoutGrid, Moon, Sun, Menu } from 'lucide-react'
import { useState } from 'react'

interface HeaderProps {
  activeView: 'write' | 'entries'
  onViewChange: (view: 'write' | 'entries') => void
}

export function Header({ activeView, onViewChange }: HeaderProps) {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 backdrop-blur-xl bg-background/80">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl blur-lg opacity-70"></div>
              <div className="relative w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">Lumina</h1>
              <p className="text-xs text-muted-foreground -mt-1">Journal</p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => onViewChange('write')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeView === 'write' 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <PenTool className="w-4 h-4" />
              <span>Write</span>
            </button>
            <button
              onClick={() => onViewChange('entries')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeView === 'entries' 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Entries</span>
            </button>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="hidden md:flex w-10 h-10 items-center justify-center rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg bg-secondary"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden py-4 border-t border-border/40"
          >
            <button
              onClick={() => {
                onViewChange('write')
                setIsMobileMenuOpen(false)
              }}
              className={`flex items-center space-x-2 w-full px-4 py-2 rounded-lg font-medium ${
                activeView === 'write' 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground'
              }`}
            >
              <PenTool className="w-4 h-4" />
              <span>Write</span>
            </button>
            <button
              onClick={() => {
                onViewChange('entries')
                setIsMobileMenuOpen(false)
              }}
              className={`flex items-center space-x-2 w-full px-4 py-2 rounded-lg font-medium ${
                activeView === 'entries' 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Entries</span>
            </button>
          </motion.div>
        )}
      </div>
    </header>
  )
} 