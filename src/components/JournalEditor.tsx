'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Lightbulb, 
  PenTool, 
  Image, 
  Save, 
  Loader2, 
  Bookmark, 
  BookmarkCheck, 
  Clock,
  Type,
  Plus
} from 'lucide-react'
import { journalService, imageService, auth } from '@/lib/supabase'
import type { CreateJournalEntry } from '@/lib/supabase'
import type { ValidTheme } from './ThemePicker'
import toast from 'react-hot-toast'

interface JournalEditorProps {
  selectedTheme: ValidTheme | null
  generatedPrompt?: string
}

interface Block {
  id: string
  type: 'paragraph' | 'heading1' | 'heading2' | 'bullet-list' | 'todo' | 'quote'
  content: string
  completed?: boolean
}

// Simplified block types - only the most useful ones
const BLOCK_TYPES = {
  paragraph: { label: 'Text', placeholder: 'Type something...' },
  heading1: { label: 'Heading', placeholder: 'Heading' },
  heading2: { label: 'Subheading', placeholder: 'Subheading' },
  'bullet-list': { label: 'Bullet List', placeholder: '• List item' },
  todo: { label: 'To-do', placeholder: '☐ To-do item' },
  quote: { label: 'Quote', placeholder: 'Quote or insight...' }
}

// Validate content input
function validateJournalContent(blocks: Block[]): string {
  const content = blocks.map(block => block.content).join('\n').trim()
  
  if (!content) {
    throw new Error('Journal content cannot be empty')
  }
  
  if (content.length < 10) {
    throw new Error('Journal content must be at least 10 characters long')
  }
  
  if (content.length > 50000) {
    throw new Error('Journal content cannot exceed 50,000 characters')
  }
  
  return content
}

// Calculate word count properly
function calculateWordCount(blocks: Block[]): number {
  const content = blocks.map(block => block.content).join(' ').trim()
  if (!content) return 0
  
  return content
    .split(/\s+/)
    .filter(word => word.length > 0)
    .length
}

// Extract tags with validation
function extractTags(blocks: Block[]): string[] {
  const content = blocks.map(block => block.content).join(' ')
  if (!content.trim()) return []
  
  const commonTags = [
    'leadership', 'team', 'strategy', 'technical', 'delivery', 
    'growth', 'challenge', 'learning', 'innovation', 'communication',
    'decision', 'mentoring', 'culture', 'process', 'collaboration'
  ]
  
  const contentLower = content.toLowerCase()
  const foundTags = commonTags.filter(tag => 
    contentLower.includes(tag.toLowerCase())
  )
  
  return [...new Set(foundTags)].slice(0, 10)
}

// Convert blocks to markdown
function blocksToMarkdown(blocks: Block[]): string {
  return blocks.map(block => {
    switch (block.type) {
      case 'heading1':
        return `# ${block.content}`
      case 'heading2':
        return `## ${block.content}`
      case 'bullet-list':
        return `• ${block.content}`
      case 'todo':
        return `${block.completed ? '☑' : '☐'} ${block.content}`
      case 'quote':
        return `> ${block.content}`
      default:
        return block.content
    }
  }).join('\n\n')
}

export function JournalEditor({ selectedTheme, generatedPrompt }: JournalEditorProps) {
  const [currentPrompt, setCurrentPrompt] = useState<string>('')
  const [currentTheme, setCurrentTheme] = useState<ValidTheme | null>(null)
  const [blocks, setBlocks] = useState<Block[]>([
    { id: '1', type: 'paragraph', content: '' }
  ])
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false)
  const [images, setImages] = useState<string[]>([])
  const [sessionStartTime] = useState<Date>(new Date())
  const [activeBlockId, setActiveBlockId] = useState<string>('1')
  const editorRef = useRef<HTMLDivElement>(null)

  // Update current theme and reset form when selectedTheme changes
  useEffect(() => {
    if (selectedTheme !== currentTheme) {
      setCurrentTheme(selectedTheme)
      setCurrentPrompt('')
      setBlocks([{ id: '1', type: 'paragraph', content: '' }])
      setImages([])
      setIsBookmarked(false)
    }
  }, [selectedTheme, currentTheme])

  // Update current prompt when generatedPrompt changes
  useEffect(() => {
    if (generatedPrompt && generatedPrompt !== currentPrompt) {
      setCurrentPrompt(generatedPrompt)
      if (selectedTheme) {
        setCurrentTheme(selectedTheme)
      }
    }
  }, [generatedPrompt, currentPrompt, selectedTheme])

  const generateId = () => Math.random().toString(36).substr(2, 9)

  const updateBlock = useCallback((id: string, updates: Partial<Block>) => {
    setBlocks(prev => prev.map(block => 
      block.id === id ? { ...block, ...updates } : block
    ))
  }, [])

  const addBlock = useCallback((afterId: string, type: Block['type'] = 'paragraph') => {
    const newBlock: Block = {
      id: generateId(),
      type,
      content: ''
    }
    
    setBlocks(prev => {
      const index = prev.findIndex(block => block.id === afterId)
      const newBlocks = [...prev]
      newBlocks.splice(index + 1, 0, newBlock)
      return newBlocks
    })
    
    setActiveBlockId(newBlock.id)
    setTimeout(() => {
      const element = document.getElementById(`block-${newBlock.id}`)
      element?.focus()
    }, 10)
  }, [])

  const deleteBlock = useCallback((id: string) => {
    if (blocks.length <= 1) return
    
    setBlocks(prev => {
      const index = prev.findIndex(block => block.id === id)
      const newBlocks = prev.filter(block => block.id !== id)
      
      // Focus on previous block
      if (index > 0) {
        setActiveBlockId(newBlocks[index - 1].id)
        setTimeout(() => {
          const element = document.getElementById(`block-${newBlocks[index - 1].id}`)
          element?.focus()
        }, 10)
      }
      
      return newBlocks
    })
  }, [blocks.length])

  const handleBlockKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, blockId: string) => {
    const block = blocks.find(b => b.id === blockId)
    if (!block) return

    const textarea = e.target as HTMLTextAreaElement
    const cursorPosition = textarea.selectionStart

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      addBlock(blockId)
    } else if (e.key === 'Backspace' && block.content === '' && cursorPosition === 0) {
      e.preventDefault()
      deleteBlock(blockId)
    }
  }

  const handleBlockInput = (e: React.FormEvent<HTMLTextAreaElement>, blockId: string) => {
    const textarea = e.target as HTMLTextAreaElement
    const value = textarea.value
    
    // Update block content
    updateBlock(blockId, { content: value })
  }

  const validateAndSave = () => {
    try {
      // Validate content length
      const totalContent = blocks.map(block => block.content).join(' ').trim()
      
      if (!totalContent) {
        toast.error('Please write something before saving!', {
          position: 'top-right',
          style: {
            background: '#fee2e2',
            color: '#dc2626',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            fontWeight: '500',
          },
        })
        return false
      }

      if (totalContent.length < 10) {
        toast.error('Your reflection must be at least 10 characters long', {
          position: 'top-right',
          style: {
            background: '#fee2e2',
            color: '#dc2626',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            fontWeight: '500',
          },
        })
        return false
      }

      if (!currentPrompt.trim()) {
        toast.error('Please select a theme to get a reflection prompt first', {
          position: 'top-right',
          style: {
            background: '#fef3c7',
            color: '#d97706',
            border: '1px solid #fed7aa',
            borderRadius: '8px',
            fontWeight: '500',
          },
        })
        return false
      }

      return true
    } catch {
      toast.error('Please check your content and try again', {
        position: 'top-right',
        style: {
          background: '#fee2e2',
          color: '#dc2626',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          fontWeight: '500',
        },
      })
      return false
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file using imageService
    const validation = imageService.validateImageFile(file)
    if (!validation.isValid) {
      toast.error(validation.error || 'Invalid image file', {
        position: 'top-right',
        style: {
          background: '#fee2e2',
          color: '#dc2626',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          fontWeight: '500',
        },
      })
      return
    }

    if (images.length >= 5) {
      toast.error('Maximum 5 images allowed per entry', {
        position: 'top-right',
        style: {
          background: '#fee2e2',
          color: '#dc2626',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          fontWeight: '500',
        },
      })
      return
    }

    try {
      // Get current user
      const { user } = await auth.getUser()
      if (!user) {
        toast.error('Please sign in to upload images', {
          position: 'top-right',
          style: {
            background: '#fee2e2',
            color: '#dc2626',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            fontWeight: '500',
          },
        })
        return
      }

      // Show loading toast
      const loadingToast = toast.loading('📷 Uploading image...', {
        position: 'top-right',
        style: {
          background: '#fef3c7',
          color: '#d97706',
          border: '1px solid #fed7aa',
          borderRadius: '8px',
          fontWeight: '500',
        },
      })

      // Upload to Supabase storage
      const { data: imageUrl, error } = await imageService.uploadImage(file, user.id)
      
      // Dismiss loading toast
      toast.dismiss(loadingToast)

      if (error) {
        throw new Error(error.message || 'Failed to upload image')
      }

      if (!imageUrl) {
        throw new Error('No image URL returned from upload')
      }

      // Add image URL to state
      setImages(prevImages => [...prevImages, imageUrl])
      
      toast.success('📷 Image uploaded successfully!', {
        position: 'top-right',
        style: {
          background: '#dcfce7',
          color: '#166534',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          fontWeight: '500',
        },
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image'
      toast.error(`Upload failed: ${errorMessage}`, {
        position: 'top-right',
        style: {
          background: '#fee2e2',
          color: '#dc2626',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          fontWeight: '500',
        },
      })
    }
  }

  const removeImage = async (index: number): Promise<void> => {
    try {
      const imageUrl = images[index]
      
      // Get current user
      const { user } = await auth.getUser()
      if (!user) {
        toast.error('Please sign in to remove images', {
          position: 'top-right',
          style: {
            background: '#fee2e2',
            color: '#dc2626',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            fontWeight: '500',
          },
        })
        return
      }

      // Remove from state first for immediate UI feedback
    setImages(prevImages => {
      const newImages = [...prevImages]
      newImages.splice(index, 1)
      return newImages
    })

      // Delete from Supabase storage if it's a Supabase URL
      if (imageUrl.includes('supabase')) {
        const { error } = await imageService.deleteImage(imageUrl, user.id)
        if (error) {
          console.error('Error deleting image from storage:', error)
          // Don't show error to user as image is already removed from UI
        }
      }

      toast.success('🗑️ Image removed', {
        position: 'top-right',
        style: {
          background: '#dcfce7',
          color: '#166534',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          fontWeight: '500',
        },
      })
    } catch (error) {
      console.error('Error removing image:', error)
      toast.error('Failed to remove image', {
        position: 'top-right',
        style: {
          background: '#fee2e2',
          color: '#dc2626',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          fontWeight: '500',
        },
      })
    }
  }

  const saveEntry = async (): Promise<void> => {
    if (!validateAndSave()) return

    try {
      validateJournalContent(blocks)
      
      if (!currentTheme) {
        toast.error('No theme selected', {
          position: 'top-right',
          style: {
            background: '#fee2e2',
            color: '#dc2626',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            fontWeight: '500',
          },
        })
        return
      }

      setIsSaving(true)

      const wordCount = calculateWordCount(blocks)
      const tags = extractTags(blocks)
      const markdownContent = blocksToMarkdown(blocks)

      const entry: CreateJournalEntry = {
        theme: currentTheme,
        prompt: currentPrompt,
        content: markdownContent,
        images: images,
        is_bookmarked: isBookmarked,
        word_count: wordCount,
        tags: tags,
      }

      const { error } = await journalService.createEntry(entry)

      if (error) {
        throw new Error(`Database error: ${error.message}`)
      }

      // Reset form only after successful save
      setCurrentPrompt('')
      setCurrentTheme(null)
      setBlocks([{ id: generateId(), type: 'paragraph', content: '' }])
      setImages([])
      setIsBookmarked(false)
      
      toast.success(`🎉 Reflection saved! ${wordCount} words, ${tags.length} insights`, {
        position: 'top-right',
        style: {
          background: '#dcfce7',
          color: '#166534',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          fontWeight: '600',
        },
      })
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('Error saving entry:', error)
      toast.error(`Failed to save entry: ${errorMessage}`, {
        position: 'top-right',
        style: {
          background: '#fee2e2',
          color: '#dc2626',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          fontWeight: '500',
        },
      })
    } finally {
      setIsSaving(false)
    }
  }

  const wordCount = calculateWordCount(blocks)
  const hasContent = blocks.some(block => block.content.trim())
  const canSave = currentPrompt.trim() && hasContent && !isSaving
  const sessionDuration = Math.floor((new Date().getTime() - sessionStartTime.getTime()) / 1000 / 60)

  if (!selectedTheme) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-base p-12 text-center"
      >
        <div className="space-y-4">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
            <Type className="w-8 h-8 text-amber-600" />
          </div>
          <h3 className="text-2xl font-semibold text-slate-900">Ready for Your Next Iteration</h3>
          <p className="text-slate-600 max-w-md mx-auto">
            Choose a reflection theme to unlock personalized prompts designed to accelerate your leadership growth.
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
      ref={editorRef}
    >
      {/* Prompt Display Section */}
        <AnimatePresence>
          {currentPrompt && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            className="card-base p-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl blur-lg opacity-70"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Your Growth Catalyst</h2>
                <p className="text-slate-600 text-sm">Thoughtfully crafted to unlock deeper insights</p>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-l-4 border-amber-500 shadow-sm">
              <p className="text-lg font-medium text-slate-800 leading-relaxed">
                {currentPrompt}
              </p>
            </div>
            </motion.div>
          )}
        </AnimatePresence>

      {/* Writing Section */}
      <AnimatePresence>
        {currentPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-base overflow-hidden relative"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl blur-lg opacity-70"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                    <PenTool className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Capture Your Insights</h2>
                  <div className="flex items-center space-x-4 text-sm text-slate-600">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{sessionDuration} min</span>
                    </div>
                    <span>•</span>
                    <span>{wordCount} words</span>
                    <span>•</span>
                    <span>{blocks.length} thoughts</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                    isBookmarked 
                      ? 'bg-amber-500 text-white hover:bg-amber-600' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                >
                  {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                  <span className="text-sm font-medium">{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
                </motion.button>
              </div>
            </div>

            {/* Editor Area */}
            <div className="p-6 space-y-1 min-h-[400px] relative">
              {blocks.map((block, index) => (
                <div key={block.id} className="group relative">
                  <div className="flex items-start space-x-2">
                    {/* Block Handle */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-slate-600 mt-2 shrink-0"
                      onClick={() => addBlock(block.id)}
                    >
                      <Plus className="w-4 h-4" />
                    </motion.button>

                    {/* Block Content */}
                    <div className="flex-1">
                      {block.type === 'todo' ? (
                        <div className="flex items-start space-x-2">
                          <input
                            type="checkbox"
                            checked={block.completed || false}
                            onChange={(e) => updateBlock(block.id, { completed: e.target.checked })}
                            className="mt-2 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 shrink-0"
                          />
                          <textarea
                            id={`block-${block.id}`}
                            value={block.content}
                            onInput={(e) => handleBlockInput(e, block.id)}
                            onKeyDown={(e) => handleBlockKeyDown(e, block.id)}
                            onFocus={() => setActiveBlockId(block.id)}
                            placeholder={
                              index === 0 && !block.content 
                                ? "Share your thoughts, insights, and leadership moments..."
                                : BLOCK_TYPES[block.type].placeholder
                            }
                            className={`w-full bg-transparent border-none outline-none resize-none text-lg leading-relaxed ${
                              block.completed ? 'line-through text-slate-500' : 'text-slate-900'
                            }`}
                            rows={Math.max(1, Math.ceil(block.content.length / 50))}
                          />
                        </div>
                      ) : block.type === 'bullet-list' ? (
                        <div className="flex items-start space-x-2">
                          <span className="text-amber-500 font-bold text-lg mt-1 select-none">•</span>
                          <textarea
                            id={`block-${block.id}`}
                            value={block.content}
                            onInput={(e) => handleBlockInput(e, block.id)}
                            onKeyDown={(e) => handleBlockKeyDown(e, block.id)}
                            onFocus={() => setActiveBlockId(block.id)}
                            placeholder={
                              index === 0 && !block.content 
                                ? "Share your thoughts, insights, and leadership moments..."
                                : BLOCK_TYPES[block.type].placeholder
                            }
                            className="w-full bg-transparent border-none outline-none resize-none text-lg leading-relaxed text-slate-900"
                            rows={Math.max(1, Math.ceil(block.content.length / 50))}
                          />
                        </div>
                      ) : (
                        <textarea
                          id={`block-${block.id}`}
                          value={block.content}
                          onInput={(e) => handleBlockInput(e, block.id)}
                          onKeyDown={(e) => handleBlockKeyDown(e, block.id)}
                          onFocus={() => setActiveBlockId(block.id)}
                          placeholder={
                            index === 0 && !block.content 
                              ? "Share your thoughts, insights, and leadership moments..."
                              : BLOCK_TYPES[block.type].placeholder
                          }
                          className={`w-full bg-transparent border-none outline-none resize-none leading-relaxed ${
                            block.type === 'heading1' ? 'text-3xl font-bold text-slate-900' :
                            block.type === 'heading2' ? 'text-2xl font-semibold text-slate-900' :
                            block.type === 'quote' ? 'text-lg italic text-slate-700 border-l-4 border-amber-500 pl-4 bg-amber-50 rounded-r-lg' :
                            'text-lg text-slate-900'
                          }`}
                          rows={Math.max(1, Math.ceil(block.content.length / 50))}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Empty state hint */}
              {blocks.length === 1 && !blocks[0].content && (
                <div className="text-slate-400 text-lg mt-8 ml-8">
                  <p>✨ Begin your leadership reflection</p>
                  <p className="text-sm mt-2">
                    Press <kbd className="px-2 py-1 bg-slate-200 rounded text-xs font-mono">Enter</kbd> for new line,
                    click <kbd className="px-2 py-1 bg-slate-200 rounded text-xs font-mono ml-1">+</kbd> to add new thought
                  </p>
                </div>
              )}
            </div>

            {/* Image Upload & Actions */}
            <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50">
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg cursor-pointer hover:bg-orange-600 transition-all font-medium">
                  <Image className="w-4 h-4" />
                  <span>Add Image ({images.length}/5)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={images.length >= 5}
                  />
                </label>
                
                {images.length > 0 && (
                  <div className="flex space-x-2">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Upload ${index + 1}`}
                          className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={saveEntry}
                disabled={!canSave}
                className="btn btn-primary px-8 py-3 font-semibold glow-on-hover"
              >
                {isSaving ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <Save className="w-5 h-5 mr-2" />
                )}
                <span>
                  {isSaving ? 'Saving...' : canSave ? 'Save Reflection' : 'Complete your reflection'}
                </span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
} 