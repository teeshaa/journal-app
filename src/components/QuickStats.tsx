'use client'

import { motion } from 'framer-motion'
import { BarChart3, Target, TrendingUp } from 'lucide-react'

export function QuickStats() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="card-base card-hover p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Quick Insights</h3>
        <BarChart3 className="w-5 h-5 text-muted-foreground" />
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-muted-foreground">Words this week</span>
          </div>
          <span className="text-sm font-semibold">2,347</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-muted-foreground">Avg. session</span>
          </div>
          <span className="text-sm font-semibold">12 min</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-sm text-muted-foreground">Growth trend</span>
          </div>
          <div className="flex items-center space-x-1">
            <TrendingUp className="w-3 h-3 text-green-500" />
            <span className="text-sm font-semibold text-green-500">+15%</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
} 