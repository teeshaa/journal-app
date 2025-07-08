'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Calendar, TrendingUp, Award, Target } from 'lucide-react'
import { auth, journalService, StreakData } from '@/lib/supabase'
import { 
  format, 
  isSameDay, 
  subWeeks, 
  startOfYear,
  getDay
} from 'date-fns'
import { getMotivationalMessage } from '@/lib/utils'

interface DayData {
  date: Date
  count: number
  hasEntry: boolean
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

const useStreakData = () => {
    const [streakData, setStreakData] = useState<StreakData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
  
    useEffect(() => {
      const fetchStreakData = async () => {
        try {
          const { user } = await auth.getUser();
          if (!user) {
            setIsLoading(false);
            return;
          }
  
          const data = await journalService.getStreakData();
          setStreakData(data);
        } catch (err) {
          setError('Could not load streak data.');
          console.error('Failed to fetch streak data:', err);
        } finally {
          setIsLoading(false);
        }
      };
  
      fetchStreakData();
    }, []);
  
    return { streakData, isLoading, error };
};

export function StreakWidget() {
    const { streakData, isLoading, error } = useStreakData();
    const [timeRange, setTimeRange] = useState<'3M' | '6M' | '1Y'>('3M');
    const [hoveredDay, setHoveredDay] = useState<DayData | null>(null);
  
    if (isLoading) {
      return (
        <div className="card-base p-4">
          <div className="text-slate-600">Loading stats...</div>
        </div>
      );
    }
  
    if (error) {
      return (
        <div className="card-base p-4">
          <div className="text-red-500">{error}</div>
        </div>
      );
    }
  
    if (!streakData) {
      return (
        <div className="card-base p-4">
          <div className="text-slate-600">Sign in to track your streak.</div>
        </div>
      );
    }
  
    const { currentStreak, longestStreak, totalEntries, entriesThisWeek, activity } = streakData;
    const motivationalMessage = getMotivationalMessage(currentStreak);
  
    const organizeDataByWeeks = () => {
      const weeks: DayData[][] = [];
      let currentWeek: DayData[] = [];
      
      const activityData = (activity && Object.keys(activity).length > 0) 
        ? Object.entries(activity).map(([date, count]) => ({ date: new Date(date), count: Number(count), hasEntry: Number(count) > 0 }))
        : [];
  
      activityData.forEach((day, index) => {
        const dayOfWeek = getDay(day.date);
        
        if (dayOfWeek === 1 && currentWeek.length > 0) {
          weeks.push(currentWeek);
          currentWeek = [];
        }
        currentWeek.push(day);
        if (index === activityData.length - 1) {
          weeks.push(currentWeek);
        }
      });
      return weeks;
    };
  
    const weeks = organizeDataByWeeks();
  
    return (
      <motion.div 
        className="card-base p-4 space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <Flame className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Reflection Streak</h3>
              <p className="text-slate-600 text-xs">{motivationalMessage}</p>
            </div>
          </div>
          
          <div className="text-right">
            <motion.div 
              className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              key={currentStreak}
            >
              {currentStreak}
            </motion.div>
            <div className="text-xs text-slate-600">{currentStreak === 1 ? 'day' : 'days'}</div>
          </div>
        </div>
  
        {/* Activity Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3 text-slate-600" />
            <span className="text-xs font-medium text-slate-900">Activity</span>
          </div>
          <div className="flex rounded-md bg-slate-100 p-0.5">
            {(['3M', '6M', '1Y'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setTimeRange(mode)}
                className={`px-2 py-1 text-xs font-medium rounded transition-all ${
                  timeRange === mode
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {mode}
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
                  if (!day.date || day.date.getTime() === 0) {
                    return <div key={dayIndex} className="aspect-square" />
                  }
                  
                  const level = CONTRIBUTION_LEVELS.find(level => day.count >= level.min && day.count <= level.max) || CONTRIBUTION_LEVELS[0]
                  const isToday = isSameDay(day.date, new Date())
              
                  return (
                    <div
                      key={dayIndex}
                      className={`
                        aspect-square rounded-sm border cursor-pointer transition-all hover:ring-1 hover:ring-orange-400
                        ${level.color}
                        ${isToday ? 'ring-1 ring-orange-500' : 'border-transparent'}
                      `}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      style={{ opacity: 1, transform: 'none' }}
                      title={`${format(day.date, 'MMM d, yyyy')}: ${day.count} entries`}
                    />
                  )
                })}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>Less</span>
            <div className="flex space-x-0.5">
              {CONTRIBUTION_LEVELS.map(level => (
                <div key={level.label} className={`w-2 h-2 rounded-sm ${level.color} border border-slate-200`} title={level.label} />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>
        
        {/* Stats Summary */}
        <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-200">
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center">
              <Flame className="w-3 h-3 text-orange-500" />
            </div>
            <div className="text-lg font-bold text-slate-900">{currentStreak}</div>
            <div className="text-xs text-slate-600">Current</div>
          </div>
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center">
              <Award className="w-3 h-3 text-emerald-500" />
            </div>
            <div className="text-lg font-bold text-slate-900">{longestStreak}</div>
            <div className="text-xs text-slate-600">Longest</div>
          </div>
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center">
              <Target className="w-3 h-3 text-blue-500" />
            </div>
            <div className="text-lg font-bold text-slate-900">{entriesThisWeek}</div>
            <div className="text-xs text-slate-600">This Week</div>
          </div>
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center">
              <TrendingUp className="w-3 h-3 text-purple-500" />
            </div>
            <div className="text-lg font-bold text-slate-900">{totalEntries}</div>
            <div className="text-xs text-slate-600">Total</div>
          </div>
        </div>
  
        <AnimatePresence>
          {hoveredDay && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="text-center text-sm text-slate-600"
            >
              <strong>{hoveredDay.count} entries</strong> on {format(hoveredDay.date, 'MMMM d, yyyy')}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
} 