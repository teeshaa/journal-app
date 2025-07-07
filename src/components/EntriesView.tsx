'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BookOpen, 
  Search, 
  Filter, 
  Calendar, 
  Tag, 
  Bookmark, 
  MoreVertical, 
  Eye,
  Archive,
  Heart,
  Clock
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { JournalEntry } from '@/lib/supabase'
import { format, formatDistanceToNow } from 'date-fns'
import ReactMarkdown from 'react-markdown'

const themeInfo = {
  technology_impact: { title: 'Technology Impact', color: 'bg-blue-100 text-blue-800', icon: '💻' },
  delivery_impact: { title: 'Delivery Impact', color: 'bg-green-100 text-green-800', icon: '🚀' },
  business_impact: { title: 'Business Impact', color: 'bg-purple-100 text-purple-800', icon: '📈' },
  team_impact: { title: 'Team Impact', color: 'bg-orange-100 text-orange-800', icon: '👥' },
  org_impact: { title: 'Org Impact', color: 'bg-teal-100 text-teal-800', icon: '🌍' },
}

export function EntriesView() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTheme, setFilterTheme] = useState<string>('all')
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    fetchEntries()
  }, [])

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setEntries(data || [])
    } catch (error) {
      console.error('Error fetching entries:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleBookmark = async (entryId: string, currentBookmarkStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('journal_entries')
        .update({ is_bookmarked: !currentBookmarkStatus })
        .eq('id', entryId)

      if (error) throw error
      
      setEntries(entries.map(entry => 
        entry.id === entryId 
          ? { ...entry, is_bookmarked: !currentBookmarkStatus }
          : entry
      ))
    } catch (error) {
      console.error('Error updating bookmark:', error)
    }
  }

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.prompt.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTheme = filterTheme === 'all' || entry.theme === filterTheme
    const matchesBookmark = !showBookmarkedOnly || entry.is_bookmarked
    
    return matchesSearch && matchesTheme && matchesBookmark
  })

  const getPreview = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength).trim() + '...'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="card-base p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded-lg w-1/3"></div>
            <div className="h-4 bg-muted rounded-lg w-2/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-48 bg-muted rounded-xl"></div>
              ))}
            </div>
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
      className="space-y-6"
    >
      {/* Header */}
      <div className="card-base p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl blur-lg opacity-70"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="heading-1 font-bold">Your Journal Entries</h1>
              <p className="text-muted-foreground">
                {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'} found
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search your reflections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-modern pl-10 w-full"
            />
          </div>

          <select
            value={filterTheme}
            onChange={(e) => setFilterTheme(e.target.value)}
            className="input-modern"
          >
            <option value="all">All Themes</option>
            <option value="technology_impact">Technology Impact</option>
            <option value="delivery_impact">Delivery Impact</option>
            <option value="business_impact">Business Impact</option>
            <option value="team_impact">Team Impact</option>
            <option value="org_impact">Org Impact</option>
          </select>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
              className={`btn ${showBookmarkedOnly ? 'btn-primary' : 'btn-ghost'} px-4 py-2`}
            >
              <Bookmark className="w-4 h-4 mr-2" />
              Bookmarked
            </button>
          </div>
        </div>
      </div>

      {/* Entries Grid */}
      <AnimatePresence>
        {filteredEntries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card-base p-12 text-center"
          >
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="heading-2 font-semibold mb-2">No entries found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {searchTerm || filterTheme !== 'all' || showBookmarkedOnly
                ? 'Try adjusting your search criteria or filters.'
                : 'Start your first journal entry to see it here.'}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEntries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="card-base card-hover p-6 cursor-pointer group"
                onClick={() => setSelectedEntry(entry)}
              >
                {/* Entry Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{themeInfo[entry.theme].icon}</span>
                    <span className={`badge badge-secondary text-xs px-2 py-1 ${themeInfo[entry.theme].color}`}>
                      {themeInfo[entry.theme].title}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {entry.is_bookmarked && (
                      <Bookmark className="w-4 h-4 text-yellow-500 fill-current" />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleBookmark(entry.id, entry.is_bookmarked)
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Entry Preview */}
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
                    {getPreview(entry.prompt)}
                  </p>
                  <div className="text-sm leading-relaxed">
                    {getPreview(entry.content)}
                  </div>
                </div>

                {/* Entry Footer */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDistanceToNow(new Date(entry.created_at))} ago</span>
                    </div>
                    <span>•</span>
                    <span>{entry.word_count} words</span>
                  </div>
                  {entry.tags.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <Tag className="w-3 h-3" />
                      <span>{entry.tags.length}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Entry Modal */}
      <AnimatePresence>
        {selectedEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedEntry(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="card-base max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8">
                {/* Modal Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{themeInfo[selectedEntry.theme].icon}</span>
                    <div>
                      <h2 className="heading-2 font-bold">{themeInfo[selectedEntry.theme].title}</h2>
                      <p className="text-muted-foreground">
                        {format(new Date(selectedEntry.created_at), 'MMMM d, yyyy • h:mm a')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedEntry(null)}
                    className="btn btn-ghost btn-icon"
                  >
                    ×
                  </button>
                </div>

                {/* Prompt */}
                <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-l-4 border-blue-500">
                  <h3 className="font-semibold text-blue-900 mb-2">Reflection Prompt</h3>
                  <p className="text-blue-800 leading-relaxed">{selectedEntry.prompt}</p>
                </div>

                {/* Content */}
                <div className="prose prose-neutral prose-lg max-w-none">
                  <ReactMarkdown>{selectedEntry.content}</ReactMarkdown>
                </div>

                {/* Tags */}
                {selectedEntry.tags.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-border">
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedEntry.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="badge badge-secondary px-3 py-1 text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="mt-6 pt-6 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-4">
                    <span>{selectedEntry.word_count} words</span>
                    <span>•</span>
                    <span>{selectedEntry.tags.length} tags</span>
                    {selectedEntry.is_bookmarked && (
                      <>
                        <span>•</span>
                        <div className="flex items-center space-x-1">
                          <Bookmark className="w-4 h-4 text-yellow-500 fill-current" />
                          <span>Bookmarked</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
} 