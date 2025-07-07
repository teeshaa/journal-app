'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Flame, Calendar, TrendingUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { format, differenceInDays, startOfDay, eachDayOfInterval, subDays } from 'date-fns'

interface StreakData {
  currentStreak: number
  longestStreak: number
  totalEntries: number
  thisWeekEntries: number
  lastEntryDate: Date | null
}

export function StreakWidget() {
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    totalEntries: 0,
    thisWeekEntries: 0,
    lastEntryDate: null
  })
  const [loading, setLoading] = useState(true)
  const [weeklyProgress, setWeeklyProgress] = useState<boolean[]>([])

  useEffect(() => {
    fetchStreakData()
  }, [])

  const fetchStreakData = async () => {
    try {
      const { data: entries, error } = await supabase
        .from('journal_entries')
        .select('created_at')
        .order('created_at', { ascending: false })

      if (error) throw error

      if (!entries || entries.length === 0) {
        setLoading(false)
        return
      }

      // Convert dates and calculate streaks
      const entryDates = entries.map(entry => startOfDay(new Date(entry.created_at)))
      const uniqueDates = [...new Set(entryDates.map(date => date.getTime()))].map(time => new Date(time))
      uniqueDates.sort((a, b) => b.getTime() - a.getTime())

      // Calculate current streak
      let currentStreak = 0
      const today = startOfDay(new Date())
      
      if (uniqueDates.length > 0) {
        const lastEntryDate = uniqueDates[0]
        const daysSinceLastEntry = differenceInDays(today, lastEntryDate)
        
        if (daysSinceLastEntry <= 1) {
          for (let i = 0; i < uniqueDates.length; i++) {
            const currentDate = uniqueDates[i]
            const expectedDate = subDays(today, i + (daysSinceLastEntry))
            
            if (currentDate.getTime() === expectedDate.getTime()) {
              currentStreak++
            } else {
              break
            }
          }
        }
      }

      // Calculate longest streak
      let longestStreak = 0
      let tempStreak = 0
      
      for (let i = 0; i < uniqueDates.length; i++) {
        if (i === 0) {
          tempStreak = 1
        } else {
          const daysDiff = differenceInDays(uniqueDates[i - 1], uniqueDates[i])
          if (daysDiff === 1) {
            tempStreak++
          } else {
            longestStreak = Math.max(longestStreak, tempStreak)
            tempStreak = 1
          }
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak)

      // Calculate this week's entries
      const weekStart = subDays(today, 6)
      const thisWeekEntries = uniqueDates.filter(date => 
        date >= weekStart && date <= today
      ).length

      // Generate weekly progress (last 7 days)
      const last7Days = eachDayOfInterval({ start: weekStart, end: today })
      const weeklyProgress = last7Days.map(day => 
        uniqueDates.some(entryDate => entryDate.getTime() === day.getTime())
      )

      setStreakData({
        currentStreak,
        longestStreak,
        totalEntries: uniqueDates.length,
        thisWeekEntries,
        lastEntryDate: uniqueDates[0] || null
      })
      setWeeklyProgress(weeklyProgress)
      
    } catch (error) {
      console.error('Error fetching streak data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMotivationalMessage = () => {
    if (streakData.currentStreak === 0) {
      return "Start your journey today! 🌟"
    } else if (streakData.currentStreak === 1) {
      return "Great start! Keep it going! 💪"
    } else if (streakData.currentStreak < 7) {
      return `${streakData.currentStreak} days strong! 🔥`
    } else if (streakData.currentStreak < 30) {
      return `Amazing ${streakData.currentStreak}-day streak! 🎯`
    } else {
      return `Incredible ${streakData.currentStreak}-day streak! 🏆`
    }
  }

  if (loading) {
    return (
      <div className="card-base p-6 col-span-2">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded-lg w-1/3"></div>
          <div className="h-8 bg-muted rounded-lg w-1/2"></div>
          <div className="flex space-x-2">
            {Array(7).fill(0).map((_, i) => (
              <div key={i} className="flex-1 h-8 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card-base card-hover p-6 col-span-2"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl blur-lg opacity-70"></div>
            <div className="relative w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <Flame className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <h3 className="heading-2 font-bold">Your Streak</h3>
            <p className="text-muted-foreground text-sm">{getMotivationalMessage()}</p>
          </div>
        </div>
        
        <div className="text-right">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl font-bold gradient-text"
          >
            {streakData.currentStreak}
          </motion.div>
          <div className="text-sm text-muted-foreground">
            {streakData.currentStreak === 1 ? 'day' : 'days'}
          </div>
        </div>
      </div>

      {/* Weekly Progress */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">This Week</span>
        </div>
        
        <div className="flex space-x-2">
          {weeklyProgress.map((hasEntry, index) => {
            const date = subDays(new Date(), 6 - index)
            const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
            
            return (
              <motion.div
                key={index}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`
                  flex-1 h-10 rounded-xl flex items-center justify-center text-xs font-semibold transition-all
                  ${hasEntry 
                    ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg' 
                    : isToday 
                      ? 'bg-primary/20 text-primary border-2 border-primary/40' 
                      : 'bg-muted text-muted-foreground'
                  }
                `}
                title={format(date, 'MMM d')}
              >
                {format(date, 'd')}
              </motion.div>
            )
          })}
        </div>
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>6 days ago</span>
          <span className="font-medium">Today</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">{streakData.longestStreak}</div>
          <div className="text-xs text-muted-foreground">Longest Streak</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">{streakData.totalEntries}</div>
          <div className="text-xs text-muted-foreground">Total Entries</div>
        </div>
      </div>
    </motion.div>
  )
} 