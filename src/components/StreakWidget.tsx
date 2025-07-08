'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Calendar, TrendingUp, Award, Target } from 'lucide-react'
import { auth, journalService } from '@/lib/supabase'
import { 
  format, 
  differenceInDays, 
  startOfDay, 
  eachDayOfInterval, 
  subDays, 
  startOfWeek,
  endOfWeek,
  isSameDay,
  subWeeks,
  startOfYear,
  getDay
} from 'date-fns'

interface DayData {
  date: Date
  count: number
  hasEntry: boolean
}

interface StreakData {
  currentStreak: number
  longestStreak: number
  totalEntries: number
  thisWeekEntries: number
  thisMonthEntries: number
  lastEntryDate: Date | null
}

interface ContributionLevel {
  min: number
  max: number
  color: string
  label: string
}

const CONTRIBUTION_LEVELS: ContributionLevel[] = [
  { min: 0, max: 0, color: 'bg-slate-100', label: 'No entries' },
  { min: 1, max: 1, color: 'bg-emerald-200', label: '1 entry' },
  { min: 2, max: 3, color: 'bg-emerald-400', label: '2-3 entries' },
  { min: 4, max: 6, color: 'bg-emerald-600', label: '4-6 entries' },
  { min: 7, max: Infinity, color: 'bg-emerald-800', label: '7+ entries' }
]

export function StreakWidget() {
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    totalEntries: 0,
    thisWeekEntries: 0,
    thisMonthEntries: 0,
    lastEntryDate: null
  })
  const [contributionData, setContributionData] = useState<DayData[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredDay, setHoveredDay] = useState<DayData | null>(null)
  const [viewMode, setViewMode] = useState<'3months' | '6months' | '1year'>('3months')

  useEffect(() => {
    fetchStreakData()
  }, [viewMode])

  const getDateRange = () => {
    const today = new Date()
    switch (viewMode) {
      case '3months':
        return { start: subWeeks(today, 12), end: today }
      case '6months':
        return { start: subWeeks(today, 26), end: today }
      case '1year':
        return { start: startOfYear(today), end: today }
      default:
        return { start: subWeeks(today, 12), end: today }
    }
  }

  const fetchStreakData = async () => {
    try {
      setLoading(true)
      const { user } = await auth.getUser()
      if (!user) return

      const { start, end } = getDateRange()

      // Fetch ALL journal entries for the user
      const { data: entries, error } = await journalService.getEntries({
        limit: 1000,
        offset: 0
      })

      if (error) {
        console.error('Error fetching entries:', error)
        throw error
      }

      console.log('📊 Raw entries from database:', entries?.length || 0)

      if (!entries || entries.length === 0) {
        initializeEmptyData()
        return
      }

      // Process entries and get unique dates (normalize to start of day)
      const entriesByDate = new Map<string, number>()
      const uniqueEntryDates: Date[] = []
      
      entries.forEach(entry => {
        const entryDate = startOfDay(new Date(entry.created_at))
        const dateKey = format(entryDate, 'yyyy-MM-dd')
        
        // Count entries per date
        entriesByDate.set(dateKey, (entriesByDate.get(dateKey) || 0) + 1)

        // Keep unique dates for streak calculation
        if (!uniqueEntryDates.some(date => isSameDay(date, entryDate))) {
          uniqueEntryDates.push(entryDate)
        }
      })

      // Sort dates chronologically (oldest first)
      uniqueEntryDates.sort((a, b) => a.getTime() - b.getTime())
      
      console.log('📊 Unique entry dates:', uniqueEntryDates.map(d => format(d, 'yyyy-MM-dd')))

      // Calculate current streak
      const currentStreak = calculateCurrentStreak(uniqueEntryDates)
      console.log('🔥 Current streak:', currentStreak)

      // Calculate longest streak
      const longestStreak = calculateLongestStreak(uniqueEntryDates)
      console.log('🏆 Longest streak:', longestStreak)

      // Generate contribution grid data for the selected date range
      const days = eachDayOfInterval({ start, end })
      const contributionGrid = days.map(date => {
        const dateKey = format(date, 'yyyy-MM-dd')
        const count = entriesByDate.get(dateKey) || 0
        return {
          date,
          count,
          hasEntry: count > 0
          }
      })

      // Calculate period stats
      const today = startOfDay(new Date())
      const thisWeekStart = startOfWeek(today, { weekStartsOn: 1 })
      const thisWeekEnd = endOfWeek(today, { weekStartsOn: 1 })
      
      const thisWeekEntries = uniqueEntryDates.filter(date => 
        date >= thisWeekStart && date <= thisWeekEnd
      ).length

      const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
      const thisMonthEntries = uniqueEntryDates.filter(date => 
        date >= thisMonthStart && date <= today
      ).length

      const finalStreakData = {
        currentStreak,
        longestStreak,
        totalEntries: uniqueEntryDates.length,
        thisWeekEntries,
        thisMonthEntries,
        lastEntryDate: uniqueEntryDates.length > 0 ? uniqueEntryDates[uniqueEntryDates.length - 1] : null
      }

      console.log('📊 Final streak data:', finalStreakData)

      setStreakData(finalStreakData)
      setContributionData(contributionGrid)
      
    } catch (error) {
      console.error('Error fetching streak data:', error)
      initializeEmptyData()
    } finally {
      setLoading(false)
    }
  }

  // Calculate current streak - count consecutive days ending today or yesterday
  const calculateCurrentStreak = (dates: Date[]): number => {
    if (dates.length === 0) return 0

    const today = startOfDay(new Date())
    const yesterday = subDays(today, 1)
    
    // Sort dates in descending order (newest first)
    const sortedDates = [...dates].sort((a, b) => b.getTime() - a.getTime())
    
    // Check if we have an entry today or yesterday to start the streak
    const latestEntry = sortedDates[0]
    const daysSinceLatest = differenceInDays(today, latestEntry)
    
    // If latest entry is more than 1 day ago, streak is broken
    if (daysSinceLatest > 1) {
      return 0
    }
    
    // Count consecutive days working backwards from latest entry
    let streak = 1
    let currentDate = latestEntry
    
    for (let i = 1; i < sortedDates.length; i++) {
      const expectedPreviousDate = subDays(currentDate, 1)
      const actualPreviousDate = sortedDates[i]
      
      if (isSameDay(expectedPreviousDate, actualPreviousDate)) {
        streak++
        currentDate = actualPreviousDate
      } else {
        break
      }
    }
    
    return streak
  }

  // Calculate longest streak - find longest sequence of consecutive dates
  const calculateLongestStreak = (dates: Date[]): number => {
    if (dates.length === 0) return 0
    if (dates.length === 1) return 1

    let longestStreak = 1
    let currentStreak = 1
    
    // Dates are already sorted chronologically (oldest first)
    for (let i = 1; i < dates.length; i++) {
      const previousDate = dates[i - 1]
      const currentDate = dates[i]
      const daysDiff = differenceInDays(currentDate, previousDate)
      
      if (daysDiff === 1) {
        // Consecutive day - extend current streak
        currentStreak++
      } else {
        // Gap in dates - update longest and reset current
        longestStreak = Math.max(longestStreak, currentStreak)
        currentStreak = 1
      }
    }
    
    // Don't forget to check the final streak
    longestStreak = Math.max(longestStreak, currentStreak)
    
    return longestStreak
  }

  const initializeEmptyData = () => {
    const { start, end } = getDateRange()
    const days = eachDayOfInterval({ start, end })
    const emptyGrid = days.map(date => ({
      date,
      count: 0,
      hasEntry: false
    }))
    
    setContributionData(emptyGrid)
    setStreakData({
      currentStreak: 0,
      longestStreak: 0,
      totalEntries: 0,
      thisWeekEntries: 0,
      thisMonthEntries: 0,
      lastEntryDate: null
    })
  }

  const getContributionLevel = (count: number): ContributionLevel => {
    return CONTRIBUTION_LEVELS.find(level => count >= level.min && count <= level.max) || CONTRIBUTION_LEVELS[0]
  }

  const getMotivationalMessage = () => {
    if (streakData.currentStreak === 0) {
      return "Start your reflection journey! ✨"
    } else if (streakData.currentStreak === 1) {
      return "Great start! One day at a time 💪"
    } else if (streakData.currentStreak < 7) {
      return `Building momentum: ${streakData.currentStreak} days! 🔥`
    } else if (streakData.currentStreak < 30) {
      return `Incredible consistency: ${streakData.currentStreak} days! 🎯`
    } else {
      return `Legendary streak: ${streakData.currentStreak} days! 🏆`
    }
  }

  const organizeDataByWeeks = () => {
    const weeks: DayData[][] = []
    let currentWeek: DayData[] = []
    
    contributionData.forEach((day, index) => {
      const dayOfWeek = getDay(day.date)
      
      if (index === 0) {
        // Fill empty days at the beginning of first week
        for (let i = 0; i < dayOfWeek; i++) {
          currentWeek.push({
            date: new Date(0),
            count: 0,
            hasEntry: false
          })
        }
      }
      
      currentWeek.push(day)
      
      if (currentWeek.length === 7) {
        weeks.push(currentWeek)
        currentWeek = []
      }
    })
    
    // Add remaining days to last week
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({
          date: new Date(0),
          count: 0,
          hasEntry: false
        })
      }
      weeks.push(currentWeek)
    }
    
    return weeks
  }

  if (loading) {
    return (
      <div className="card-base p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-slate-200 rounded w-1/3"></div>
          <div className="h-6 bg-slate-200 rounded w-1/2"></div>
          <div className="grid grid-cols-12 gap-1">
            {Array(48).fill(0).map((_, i) => (
              <div key={i} className="aspect-square bg-slate-200 rounded-sm"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const weeks = organizeDataByWeeks()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card-base p-4 space-y-4"
    >
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
            <Flame className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Reflection Streak</h3>
            <p className="text-slate-600 text-xs">{getMotivationalMessage()}</p>
          </div>
        </div>
        
        <div className="text-right">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent"
          >
            {streakData.currentStreak}
          </motion.div>
          <div className="text-xs text-slate-600">
            {streakData.currentStreak === 1 ? 'day' : 'days'}
          </div>
        </div>
      </div>

      {/* Compact View Mode Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <Calendar className="w-3 h-3 text-slate-600" />
          <span className="text-xs font-medium text-slate-900">Activity</span>
        </div>
        
        <div className="flex rounded-md bg-slate-100 p-0.5">
          {(['3months', '6months', '1year'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-2 py-1 text-xs font-medium rounded transition-all ${
                viewMode === mode
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {mode === '3months' ? '3M' : mode === '6months' ? '6M' : '1Y'}
            </button>
          ))}
        </div>
      </div>

      {/* Compact Contribution Graph */}
      <div className="space-y-2">
        <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${Math.min(weeks.length, 16)}, 1fr)` }}>
          {weeks.slice(0, 16).map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-rows-7 gap-0.5">
              {week.map((day, dayIndex) => {
                if (day.date.getTime() === 0) {
                  return <div key={dayIndex} className="aspect-square" />
                }
                
                const level = getContributionLevel(day.count)
                const isToday = isSameDay(day.date, new Date())
            
            return (
              <motion.div
                    key={dayIndex}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.1, delay: (weekIndex * 7 + dayIndex) * 0.005 }}
                className={`
                      aspect-square rounded-sm border cursor-pointer transition-all hover:ring-1 hover:ring-orange-400
                      ${level.color}
                      ${isToday ? 'ring-1 ring-orange-500' : 'border-slate-200'}
                    `}
                    onMouseEnter={() => setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                    title={`${format(day.date, 'MMM d, yyyy')}: ${day.count} ${day.count === 1 ? 'entry' : 'entries'}`}
                  />
                )
              })}
            </div>
          ))}
        </div>
        
        {/* Compact Legend */}
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>Less</span>
          <div className="flex space-x-0.5">
            {CONTRIBUTION_LEVELS.map((level, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-sm ${level.color} border border-slate-200`}
                title={level.label}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Compact Stats Grid */}
      <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-200">
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center">
            <Flame className="w-3 h-3 text-orange-500" />
          </div>
          <div className="text-lg font-bold text-slate-900">{streakData.currentStreak}</div>
          <div className="text-xs text-slate-600">Current</div>
        </div>
        
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center">
            <Award className="w-3 h-3 text-emerald-500" />
          </div>
          <div className="text-lg font-bold text-slate-900">{streakData.longestStreak}</div>
          <div className="text-xs text-slate-600">Longest</div>
        </div>
        
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center">
            <Target className="w-3 h-3 text-blue-500" />
          </div>
          <div className="text-lg font-bold text-slate-900">{streakData.thisWeekEntries}</div>
          <div className="text-xs text-slate-600">This Week</div>
        </div>
        
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center">
            <TrendingUp className="w-3 h-3 text-purple-500" />
          </div>
          <div className="text-lg font-bold text-slate-900">{streakData.totalEntries}</div>
          <div className="text-xs text-slate-600">Total</div>
        </div>
      </div>

      {/* Hover Tooltip */}
      <AnimatePresence>
        {hoveredDay && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bg-slate-900 text-white px-2 py-1 rounded text-xs font-medium z-10"
          >
            <div>{format(hoveredDay.date, 'MMM d, yyyy')}</div>
            <div className="text-slate-300">
              {hoveredDay.count} {hoveredDay.count === 1 ? 'entry' : 'entries'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
} 