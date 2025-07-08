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
  Clock,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
  Maximize2,
  Image as ImageIcon
} from 'lucide-react'
import { journalService } from '@/lib/supabase'
import type { JournalEntry } from '@/lib/supabase'
import { format, formatDistanceToNow } from 'date-fns'
import ReactMarkdown from 'react-markdown'

const themeInfo = {
  technology_impact: { title: 'Technology Impact', color: 'bg-blue-100 text-blue-800', icon: '💻' },
  delivery_impact: { title: 'Delivery Impact', color: 'bg-emerald-100 text-emerald-800', icon: '🚀' },
  business_impact: { title: 'Business Impact', color: 'bg-amber-100 text-amber-800', icon: '📈' },
  team_impact: { title: 'Team Impact', color: 'bg-orange-100 text-orange-800', icon: '👥' },
  org_impact: { title: 'Organizational Impact', color: 'bg-teal-100 text-teal-800', icon: '🌍' },
}

interface ImageLightboxProps {
  images: string[]
  currentIndex: number
  onClose: () => void
  onIndexChange: (index: number) => void
}

function ImageLightbox({ images, currentIndex, onClose, onIndexChange }: ImageLightboxProps) {
  const [zoom, setZoom] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [loading, setLoading] = useState(true)

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1)
      resetImageState()
    }
  }

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      onIndexChange(currentIndex + 1)
      resetImageState()
    }
  }

  const resetImageState = () => {
    setZoom(1)
    setPosition({ x: 0, y: 0 })
    setLoading(true)
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.5, 4))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.5, 0.5))
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        onClose()
        break
      case 'ArrowLeft':
        handlePrevious()
        break
      case 'ArrowRight':
        handleNext()
        break
      case '+':
      case '=':
        handleZoomIn()
        break
      case '-':
        handleZoomOut()
        break
    }
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(images[currentIndex])
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `journal-image-${currentIndex + 1}.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading image:', error)
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex])

  useEffect(() => {
    resetImageState()
  }, [currentIndex])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center"
      onClick={onClose}
    >
      {/* Toolbar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-black/70 rounded-lg px-4 py-2 flex items-center space-x-3">
        <span className="text-white text-sm font-medium">
          {currentIndex + 1} of {images.length}
        </span>
        <div className="w-px h-4 bg-white/30" />
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleZoomOut()
          }}
          className="text-white hover:text-gray-300 transition-colors p-1"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-white text-xs">{Math.round(zoom * 100)}%</span>
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleZoomIn()
          }}
          className="text-white hover:text-gray-300 transition-colors p-1"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-white/30" />
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleDownload()
          }}
          className="text-white hover:text-gray-300 transition-colors p-1"
          title="Download"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors p-2 bg-black/50 rounded-lg"
        title="Close (ESC)"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handlePrevious()
            }}
            disabled={currentIndex === 0}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors p-3 bg-black/50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
            title="Previous (←)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleNext()
            }}
            disabled={currentIndex === images.length - 1}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors p-3 bg-black/50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
            title="Next (→)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Image Container */}
      <div
        className="relative max-w-[90vw] max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain cursor-grab active:cursor-grabbing"
            style={{
              transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)`,
              transformOrigin: 'center center'
            }}
            onLoad={() => setLoading(false)}
            onError={() => setLoading(false)}
            draggable={false}
          />
        </AnimatePresence>

        {/* Loading State */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-black/70 rounded-lg p-3 max-w-[90vw] overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation()
                onIndexChange(index)
              }}
              className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex 
                  ? 'border-white' 
                  : 'border-transparent hover:border-white/50'
              }`}
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  )
}

export function EntriesView() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTheme, setFilterTheme] = useState<string>('all')
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [lightboxImages, setLightboxImages] = useState<string[]>([])
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [showLightbox, setShowLightbox] = useState(false)

  useEffect(() => {
    fetchEntries()
  }, [])

  const fetchEntries = async () => {
    try {
      const { data, error } = await journalService.getEntries({
        limit: 100,
        offset: 0
      })

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
      const { error } = await journalService.updateEntry(entryId, { 
        is_bookmarked: !currentBookmarkStatus 
      })

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

  const openLightbox = (images: string[], startIndex: number = 0) => {
    setLightboxImages(images)
    setLightboxIndex(startIndex)
    setShowLightbox(true)
  }

  const closeLightbox = () => {
    setShowLightbox(false)
    setLightboxImages([])
    setLightboxIndex(0)
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
            <div className="h-8 bg-slate-200 rounded-lg w-1/3"></div>
            <div className="h-4 bg-slate-200 rounded-lg w-2/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-48 bg-slate-200 rounded-xl"></div>
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
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl blur-lg opacity-70"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Your Reflection History</h1>
              <p className="text-slate-600">
                {filteredEntries.length} {filteredEntries.length === 1 ? 'reflection' : 'reflections'} in your growth journey
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search your reflections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterTheme}
            onChange={(e) => setFilterTheme(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-slate-900"
            style={{
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
              backgroundPosition: 'right 8px center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '16px',
              paddingRight: '40px'
            }}
          >
            <option value="all" className="bg-white text-slate-900 py-2">All Themes</option>
            <option value="technology_impact" className="bg-blue-50 text-blue-900 py-2">Technology Impact</option>
            <option value="delivery_impact" className="bg-emerald-50 text-emerald-900 py-2">Delivery Impact</option>
            <option value="business_impact" className="bg-amber-50 text-amber-900 py-2">Business Impact</option>
            <option value="team_impact" className="bg-orange-50 text-orange-900 py-2">Team Impact</option>
            <option value="org_impact" className="bg-teal-50 text-teal-900 py-2">Organizational Impact</option>
          </select>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
              className={`btn px-4 py-2 rounded-lg transition-all ${
                showBookmarkedOnly 
                  ? 'bg-orange-500 text-white hover:bg-orange-600' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
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
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-slate-900">No reflections found</h3>
            <p className="text-slate-600 max-w-md mx-auto">
              {searchTerm || filterTheme !== 'all' || showBookmarkedOnly
                ? 'Try adjusting your search criteria or filters.'
                : 'Begin your leadership growth journey by creating your first reflection.'}
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
                className="card-base p-6 cursor-pointer group hover:shadow-lg transition-all"
                onClick={() => setSelectedEntry(entry)}
              >
                {/* Entry Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{themeInfo[entry.theme].icon}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${themeInfo[entry.theme].color}`}>
                      {themeInfo[entry.theme].title}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {entry.is_bookmarked && (
                      <Bookmark className="w-4 h-4 text-orange-500 fill-current" />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleBookmark(entry.id, entry.is_bookmarked)
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-100 rounded"
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Entry Preview */}
                <div className="mb-4">
                  <p className="text-slate-600 text-sm mb-2 leading-relaxed">
                    {getPreview(entry.prompt)}
                  </p>
                  <div className="text-sm leading-relaxed text-slate-900">
                    {getPreview(entry.content)}
                  </div>
                  
                  {/* Enhanced Image Preview */}
                  {entry.images && entry.images.length > 0 && (
                    <div className="mt-3">
                      {entry.images.length === 1 ? (
                        <div
                          className="relative group cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation()
                            openLightbox(entry.images, 0)
                          }}
                        >
                          <img
                            src={entry.images[0]}
                            alt="Entry image"
                            className="w-full h-32 object-cover rounded-lg border border-slate-200 group-hover:shadow-md transition-all"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <Maximize2 className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          {entry.images.slice(0, 2).map((image, idx) => (
                            <div
                              key={idx}
                              className="relative group cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation()
                                openLightbox(entry.images, idx)
                              }}
                            >
                              <img
                                src={image}
                                alt={`Preview ${idx + 1}`}
                                className="w-full h-20 object-cover rounded-lg border border-slate-200 group-hover:shadow-md transition-all"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <Maximize2 className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          ))}
                          {entry.images.length > 2 && (
                            <div
                              className="w-full h-20 bg-slate-100 rounded-lg border border-slate-200 flex flex-col items-center justify-center text-slate-700 cursor-pointer hover:bg-slate-200 transition-all"
                              onClick={(e) => {
                                e.stopPropagation()
                                openLightbox(entry.images, 2)
                              }}
                            >
                              <ImageIcon className="w-4 h-4 mb-1" />
                              <span className="text-xs font-medium">+{entry.images.length - 2}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Entry Footer */}
                <div className="flex items-center justify-between text-xs text-slate-500">
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
                      <h2 className="text-2xl font-bold text-slate-900">{themeInfo[selectedEntry.theme].title}</h2>
                      <p className="text-slate-600">
                        {format(new Date(selectedEntry.created_at), 'MMMM d, yyyy • h:mm a')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedEntry(null)}
                    className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-lg"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Prompt */}
                <div className="mb-8 p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-l-4 border-amber-500 shadow-sm">
                  <h3 className="font-semibold text-slate-900 mb-2">Reflection Prompt</h3>
                  <p className="text-slate-800 leading-relaxed">{selectedEntry.prompt}</p>
                </div>

                {/* Content */}
                <div className="prose prose-slate prose-lg max-w-none mb-8">
                  <ReactMarkdown>{selectedEntry.content}</ReactMarkdown>
                </div>

                {/* Enhanced Images Section */}
                {selectedEntry.images && selectedEntry.images.length > 0 && (
                  <div className="mb-8">
                    <h4 className="text-sm font-medium text-slate-700 mb-4 flex items-center">
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Images ({selectedEntry.images.length})
                    </h4>
                    <div className={`grid gap-4 ${
                      selectedEntry.images.length === 1 ? 'grid-cols-1' :
                      selectedEntry.images.length === 2 ? 'grid-cols-2' :
                      'grid-cols-2 md:grid-cols-3'
                    }`}>
                      {selectedEntry.images.map((image, index) => (
                        <div
                          key={index}
                          className="group cursor-pointer relative overflow-hidden rounded-xl border border-slate-200"
                          onClick={() => openLightbox(selectedEntry.images, index)}
                        >
                          <img
                            src={image}
                            alt={`Journal image ${index + 1}`}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                              <Maximize2 className="w-6 h-6 text-white" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {selectedEntry.tags.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-slate-200">
                    <h4 className="text-sm font-medium text-slate-700 mb-3">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedEntry.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="mt-6 pt-6 border-t border-slate-200 flex items-center justify-between text-sm text-slate-600">
                  <div className="flex items-center space-x-4">
                    <span>{selectedEntry.word_count} words</span>
                    <span>•</span>
                    <span>{selectedEntry.tags.length} tags</span>
                    {selectedEntry.images && selectedEntry.images.length > 0 && (
                      <>
                        <span>•</span>
                        <span>{selectedEntry.images.length} images</span>
                      </>
                    )}
                    {selectedEntry.is_bookmarked && (
                      <>
                        <span>•</span>
                        <div className="flex items-center space-x-1">
                          <Bookmark className="w-4 h-4 text-orange-500 fill-current" />
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

      {/* Image Lightbox */}
      <AnimatePresence>
        {showLightbox && (
          <ImageLightbox
            images={lightboxImages}
            currentIndex={lightboxIndex}
            onClose={closeLightbox}
            onIndexChange={setLightboxIndex}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
} 