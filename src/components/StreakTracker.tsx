'use client'

import { useState, useEffect } from 'react'
import { Flame, Calendar, Trophy, Target } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { format, differenceInDays, startOfDay, eachDayOfInterval, subDays } from 'date-fns'

interface StreakData {
  currentStreak: number
  longestStreak: number
  totalEntries: number
  thisWeekEntries: number
  lastEntryDate: Date | null
}

export function StreakTracker() {
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
      // Get all entries ordered by date
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
          // Start counting from the most recent entry
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
      <div className="glass-morphism rounded-2xl shadow-xl p-8">
        <div className="pulse-warm">
          <div className="h-8 bg-neutral-200 rounded-lg w-1/3 mb-6"></div>
          <div className="h-6 bg-neutral-200 rounded-lg w-2/3 mb-4"></div>
          <div className="h-6 bg-neutral-200 rounded-lg w-1/2"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-morphism rounded-2xl shadow-xl p-8 card-hover">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-warm-500 to-warm-600 rounded-2xl shadow-lg">
            <Flame className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-neutral-900">
              Your Streak
            </h3>
            <p className="text-muted text-lg">
              {getMotivationalMessage()}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="streak-counter text-4xl font-bold">
            {streakData.currentStreak}
          </div>
          <div className="text-lg text-muted mt-1">
            {streakData.currentStreak === 1 ? 'day' : 'days'}
          </div>
        </div>
      </div>

      {/* Weekly Progress */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-neutral-700 mb-4 flex items-center">
          <Calendar className="w-5 h-5 icon-warm mr-2" />
          This Week's Progress
        </h4>
        <div className="flex space-x-2">
          {weeklyProgress.map((hasEntry, index) => {
            const date = subDays(new Date(), 6 - index)
            const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
            
            return (
              <div
                key={index}
                className={`
                  flex-1 h-12 rounded-xl flex items-center justify-center text-sm font-semibold transition-all duration-200
                  ${hasEntry 
                    ? 'bg-gradient-to-br from-warm-500 to-warm-600 text-white shadow-lg transform scale-105' 
                    : isToday 
                      ? 'bg-warm-100 text-warm-600 border-2 border-warm-300 shadow-md' 
                      : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200'
                  }
                `}
                title={format(date, 'MMM d')}
              >
                {format(date, 'd')}
              </div>
            )
          })}
        </div>
        <div className="flex justify-between text-sm text-muted mt-3">
          <span>6 days ago</span>
          <span className="font-medium">Today</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-6">
        <div className="text-center p-6 glass-morphism rounded-xl card-hover">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-sage-500 to-sage-600 rounded-xl mx-auto mb-4 shadow-lg">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-sage-700 mb-1">
            {streakData.longestStreak}
          </div>
          <div className="text-sm text-sage-600 font-medium">
            Longest
          </div>
        </div>
        
        <div className="text-center p-6 glass-morphism rounded-xl card-hover">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mx-auto mb-4 shadow-lg">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-blue-700 mb-1">
            {streakData.totalEntries}
          </div>
          <div className="text-sm text-blue-600 font-medium">
            Total
          </div>
        </div>
        
        <div className="text-center p-6 glass-morphism rounded-xl card-hover">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mx-auto mb-4 shadow-lg">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-purple-700 mb-1">
            {streakData.thisWeekEntries}
          </div>
          <div className="text-sm text-purple-600 font-medium">
            This Week
          </div>
        </div>
      </div>

      {/* Last Entry Info */}
      {streakData.lastEntryDate && (
        <div className="mt-8 pt-6 border-t border-neutral-200">
          <p className="text-muted text-center">
            Last reflection: <span className="font-semibold text-neutral-700">{format(streakData.lastEntryDate, 'MMM d, yyyy')}</span>
          </p>
        </div>
      )}
    </div>
  )
} 