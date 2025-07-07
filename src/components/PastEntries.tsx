'use client'

import { useState, useEffect } from 'react'
import { BookOpen, Calendar, Search, Filter, Bookmark, MoreHorizontal, Eye, Tag } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { JournalEntry } from '@/lib/supabase'
import { format, formatDistanceToNow } from 'date-fns'
import ReactMarkdown from 'react-markdown'

const themes = {
  technology_impact: { title: 'Technology Impact', color: 'bg-blue-100 text-blue-800' },
  delivery_impact: { title: 'Delivery Impact', color: 'bg-green-100 text-green-800' },
  business_impact: { title: 'Business Impact', color: 'bg-purple-100 text-purple-800' },
  team_impact: { title: 'Team Impact', color: 'bg-orange-100 text-orange-800' },
  org_impact: { title: 'Org Impact', color: 'bg-teal-100 text-teal-800' },
}

export function PastEntries() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTheme, setFilterTheme] = useState<string>('all')
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)

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
      
      // Update local state
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

  const EntryPreview = ({ entry }: { entry: JournalEntry }) => (
    <div className="bg-white rounded-lg border border-neutral-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className={`
            px-2 py-1 rounded-full text-xs font-medium
            ${themes[entry.theme]?.color || 'bg-neutral-100 text-neutral-800'}
          `}>
            {themes[entry.theme]?.title || entry.theme}
          </span>
          <span className="text-xs text-neutral-500">
            {format(new Date(entry.created_at), 'MMM d, yyyy')}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => toggleBookmark(entry.id, entry.is_bookmarked)}
            className={`p-1 rounded transition-colors ${
              entry.is_bookmarked 
                ? 'text-warm-600 hover:text-warm-700' 
                : 'text-neutral-400 hover:text-warm-600'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${entry.is_bookmarked ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={() => setSelectedEntry(entry)}
            className="p-1 text-neutral-400 hover:text-neutral-600 rounded transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mb-3">
        <p className="text-sm font-medium text-sage-700 mb-2 line-clamp-2">
          {entry.prompt}
        </p>
      </div>

      <div className="text-sm text-neutral-600 line-clamp-3 mb-3">
        {entry.content.substring(0, 150)}...
      </div>

      <div className="flex items-center justify-between text-xs text-neutral-500">
        <div className="flex items-center space-x-4">
          <span>{entry.word_count} words</span>
          <span>{formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}</span>
        </div>
        {entry.tags && entry.tags.length > 0 && (
          <div className="flex items-center space-x-1">
            <Tag className="w-3 h-3" />
            <span>{entry.tags.length} tags</span>
          </div>
        )}
      </div>
    </div>
  )

  const EntryModal = ({ entry, onClose }: { entry: JournalEntry, onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className={`
                px-3 py-1 rounded-full text-sm font-medium
                ${themes[entry.theme]?.color || 'bg-neutral-100 text-neutral-800'}
              `}>
                {themes[entry.theme]?.title || entry.theme}
              </span>
              <span className="text-sm text-neutral-500">
                {format(new Date(entry.created_at), 'MMMM d, yyyy')}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600 text-xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-neutral-700 mb-2">Reflection Prompt</h3>
            <p className="text-sage-700 font-medium bg-sage-50 p-4 rounded-lg">
              {entry.prompt}
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-neutral-700 mb-2">Your Reflection</h3>
            <div className="prose prose-neutral max-w-none">
              <ReactMarkdown>{entry.content}</ReactMarkdown>
            </div>
          </div>

          {entry.images && entry.images.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-neutral-700 mb-2">Images</h3>
              <div className="grid grid-cols-2 gap-2">
                {entry.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Entry image ${index + 1}`}
                    className="rounded-lg object-cover w-full h-32"
                  />
                ))}
              </div>
            </div>
          )}

          {entry.tags && entry.tags.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-neutral-700 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {entry.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-neutral-100 text-neutral-700 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="text-xs text-neutral-500 pt-4 border-t border-neutral-200">
            {entry.word_count} words • {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
          </div>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-neutral-200 rounded w-1/3"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 border border-neutral-200 rounded-lg">
              <div className="h-4 bg-neutral-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-warm-600" />
            <h3 className="text-lg font-semibold text-neutral-900">
              Past Reflections
            </h3>
            <span className="text-sm text-neutral-500">
              ({filteredEntries.length})
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search reflections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-warm-500 focus:border-warm-500"
            />
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={filterTheme}
              onChange={(e) => setFilterTheme(e.target.value)}
              className="px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-warm-500 focus:border-warm-500"
            >
              <option value="all">All Themes</option>
              {Object.entries(themes).map(([key, theme]) => (
                <option key={key} value={key}>{theme.title}</option>
              ))}
            </select>

            <button
              onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                showBookmarkedOnly 
                  ? 'bg-warm-100 text-warm-700' 
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${showBookmarkedOnly ? 'fill-current' : ''}`} />
              <span>Bookmarked</span>
            </button>
          </div>
        </div>

        {/* Entries List */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-500">
                {entries.length === 0 
                  ? "No reflections yet. Start your first entry above!"
                  : "No entries match your filters."
                }
              </p>
            </div>
          ) : (
            filteredEntries.map((entry) => (
              <EntryPreview key={entry.id} entry={entry} />
            ))
          )}
        </div>
      </div>

      {selectedEntry && (
        <EntryModal 
          entry={selectedEntry} 
          onClose={() => setSelectedEntry(null)} 
        />
      )}
    </>
  )
} 