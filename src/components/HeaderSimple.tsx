'use client'

import { motion } from 'framer-motion'
import { BookOpen, LogOut, User as UserIcon, Home, FileText } from 'lucide-react'
import { auth } from '@/lib/supabase'

interface User {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
  }
}

interface HeaderSimpleProps {
  user?: User | null
  activeView?: 'home' | 'entries'
  onViewChange?: (view: 'home' | 'entries') => void
}

export function HeaderSimple({ user, activeView = 'home', onViewChange }: HeaderSimpleProps) {
  const handleSignOut = async () => {
    try {
      await auth.signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-amber-200/40 backdrop-blur-xl bg-gradient-to-r from-amber-50/90 to-orange-50/90 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl blur-lg opacity-70"></div>
              <div className="relative w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-700 bg-clip-text text-transparent">Next Iteration</h1>
              <p className="text-xs text-amber-700/80 -mt-1">Leadership Journal</p>
            </div>
          </motion.div>

          {/* Navigation - only show when user is authenticated and onViewChange is provided */}
          {user && onViewChange && (
            <nav className="hidden md:flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onViewChange('home')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all ${
                  activeView === 'home' 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg' 
                    : 'text-amber-700 hover:text-amber-900 hover:bg-amber-100/50'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onViewChange('entries')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all ${
                  activeView === 'entries' 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg' 
                    : 'text-amber-700 hover:text-amber-900 hover:bg-amber-100/50'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>History</span>
              </motion.button>
            </nav>
          )}

          {/* Right Actions */}
          {user && (
            <div className="flex items-center space-x-3">
              {/* Mobile Navigation */}
              {onViewChange && (
                <div className="md:hidden flex rounded-md bg-amber-100 p-0.5">
                  <button
                    onClick={() => onViewChange('home')}
                    className={`flex items-center space-x-1 px-3 py-1 text-xs font-medium rounded transition-all ${
                      activeView === 'home'
                        ? 'bg-white text-amber-900 shadow-sm'
                        : 'text-amber-700 hover:text-amber-900'
                    }`}
                  >
                    <Home className="w-3 h-3" />
                    <span>Home</span>
                  </button>
                  <button
                    onClick={() => onViewChange('entries')}
                    className={`flex items-center space-x-1 px-3 py-1 text-xs font-medium rounded transition-all ${
                      activeView === 'entries'
                        ? 'bg-white text-amber-900 shadow-sm'
                        : 'text-amber-700 hover:text-amber-900'
                    }`}
                  >
                    <FileText className="w-3 h-3" />
                    <span>History</span>
                  </button>
                </div>
              )}

              {/* User Info */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-amber-700">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium hidden sm:block">
                    {user.user_metadata?.full_name || user.email}
                  </span>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 px-3 py-2 text-amber-700 hover:text-amber-900 hover:bg-amber-100/50 rounded-lg transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm hidden sm:block">Sign out</span>
                </motion.button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
} 