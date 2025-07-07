'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Lightbulb, 
  PenTool, 
  Image, 
  Save, 
  Loader2, 
  Bookmark, 
  BookmarkCheck, 
  Eye, 
  EyeOff,
  Wand2,
  Clock,
  AlignLeft
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { supabase } from '@/lib/supabase'
import type { CreateJournalEntry } from '@/lib/supabase'
import type { ValidTheme } from './ThemePicker'
import toast from 'react-hot-toast'

interface JournalEditorProps {
  selectedTheme: ValidTheme | null
}

// Validate content input
function validateJournalContent(content: string): string {
  if (!content || !content.trim()) {
    throw new Error('Journal content cannot be empty')
  }
  
  const trimmedContent = content.trim()
  
  if (trimmedContent.length < 10) {
    throw new Error('Journal content must be at least 10 characters long')
  }
  
  if (trimmedContent.length > 50000) {
    throw new Error('Journal content cannot exceed 50,000 characters')
  }
  
  return trimmedContent
}

// Validate prompt
function validatePrompt(prompt: string): string {
  if (!prompt || !prompt.trim()) {
    throw new Error('Prompt cannot be empty')
  }
  
  const trimmedPrompt = prompt.trim()
  
  if (trimmedPrompt.length < 5) {
    throw new Error('Prompt is too short')
  }
  
  return trimmedPrompt
}

// Calculate word count properly
function calculateWordCount(content: string): number {
  if (!content.trim()) return 0
  
  return content
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0)
    .length
}

// Extract tags with validation
function extractTags(content: string): string[] {
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

export function JournalEditor({ selectedTheme }: JournalEditorProps) {
  const [currentPrompt, setCurrentPrompt] = useState<string>('')
  const [currentTheme, setCurrentTheme] = useState<ValidTheme | null>(null)
  const [journalContent, setJournalContent] = useState<string>('')
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false)
  const [showPreview, setShowPreview] = useState<boolean>(false)
  const [images, setImages] = useState<string[]>([])
  const [sessionStartTime] = useState<Date>(new Date())

  const generatePrompt = async (theme: ValidTheme): Promise<void> => {
    setIsGeneratingPrompt(true)
    
    try {
      const response = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ theme }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || errorData.error || `Request failed with status ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.prompt) {
        throw new Error('No prompt received from server')
      }

      const validatedPrompt = validatePrompt(data.prompt)
      setCurrentPrompt(validatedPrompt)
      setCurrentTheme(theme)
      toast.success('New reflection prompt generated!')
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('Error generating prompt:', error)
      toast.error(`Failed to generate prompt: ${errorMessage}`)
    } finally {
      setIsGeneratingPrompt(false)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, WebP, or GIF)')
      return
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('Image file must be smaller than 10MB')
      return
    }

    // Check if we already have too many images
    if (images.length >= 5) {
      toast.error('Maximum 5 images allowed per entry')
      return
    }

    try {
      const imageUrl = URL.createObjectURL(file)
      setImages(prevImages => [...prevImages, imageUrl])
    } catch (error) {
      toast.error('Failed to process image file')
    }
  }

  const removeImage = (index: number): void => {
    setImages(prevImages => {
      const newImages = [...prevImages]
      URL.revokeObjectURL(newImages[index])
      newImages.splice(index, 1)
      return newImages
    })
  }

  const saveEntry = async (): Promise<void> => {
    try {
      const validatedPrompt = validatePrompt(currentPrompt)
      const validatedContent = validateJournalContent(journalContent)
      
      if (!currentTheme) {
        throw new Error('No theme selected')
      }

      setIsSaving(true)

      const wordCount = calculateWordCount(validatedContent)
      const tags = extractTags(validatedContent)

      const entry: CreateJournalEntry = {
        theme: currentTheme,
        prompt: validatedPrompt,
        content: validatedContent,
        images: images,
        is_bookmarked: isBookmarked,
        word_count: wordCount,
        tags: tags,
      }

      const { error: supabaseError } = await supabase
        .from('journal_entries')
        .insert([entry])

      if (supabaseError) {
        throw new Error(`Database error: ${supabaseError.message}`)
      }

      // Reset form only after successful save
      setCurrentPrompt('')
      setCurrentTheme(null)
      setJournalContent('')
      setImages([])
      setIsBookmarked(false)
      setShowPreview(false)
      
      toast.success(`Entry saved! ${wordCount} words, ${tags.length} tags`)
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('Error saving entry:', error)
      toast.error(`Failed to save entry: ${errorMessage}`)
    } finally {
      setIsSaving(false)
    }
  }

  const wordCount = calculateWordCount(journalContent)
  const canSave = currentPrompt.trim() && journalContent.trim() && !isSaving
  const canGeneratePrompt = selectedTheme && !isGeneratingPrompt
  const sessionDuration = Math.floor((new Date().getTime() - sessionStartTime.getTime()) / 1000 / 60)

  if (!selectedTheme) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-base p-12 text-center"
      >
        <div className="space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <AlignLeft className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="heading-2 font-semibold">Ready to Write</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Select a reflection theme from the sidebar to get started with your journal entry.
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
    >
      {/* Prompt Generation Section */}
      <div className="card-base p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl blur-lg opacity-70"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h2 className="heading-2 font-bold">Your Reflection Prompt</h2>
              <p className="text-muted-foreground text-sm">AI-generated question to guide your thoughts</p>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => selectedTheme && generatePrompt(selectedTheme)}
            disabled={!canGeneratePrompt}
            className="btn btn-primary px-6 py-3 glow-on-hover"
          >
            {isGeneratingPrompt ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <Wand2 className="w-5 h-5 mr-2" />
            )}
            <span>{isGeneratingPrompt ? 'Generating...' : 'Generate Prompt'}</span>
          </motion.button>
        </div>

        <AnimatePresence>
          {currentPrompt && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-l-4 border-blue-500"
            >
              <p className="text-lg font-medium text-blue-900 leading-relaxed">
                {currentPrompt}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Writing Section */}
      <AnimatePresence>
        {currentPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-base p-6 space-y-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl blur-lg opacity-70"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <PenTool className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="heading-2 font-bold">Your Reflection</h2>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{sessionDuration} min</span>
                    </div>
                    <span>•</span>
                    <span>{wordCount} words</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="btn btn-ghost px-4 py-2"
                >
                  {showPreview ? (
                    <>
                      <EyeOff className="w-4 h-4 mr-2" />
                      Edit
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </>
                  )}
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className={`btn btn-icon ${
                    isBookmarked 
                      ? 'bg-yellow-500/20 text-yellow-600 hover:bg-yellow-500/30' 
                      : 'btn-ghost'
                  }`}
                  title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                >
                  {isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                </motion.button>
              </div>
            </div>

            {/* Editor/Preview */}
            <div className="relative">
              <AnimatePresence mode="wait">
                {showPreview ? (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="min-h-[400px] p-6 bg-background rounded-xl border"
                  >
                    <ReactMarkdown className="prose prose-neutral prose-lg max-w-none">
                      {journalContent || '*Start writing your reflection...*'}
                    </ReactMarkdown>
                  </motion.div>
                ) : (
                  <motion.textarea
                    key="editor"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    value={journalContent}
                    onChange={(e) => setJournalContent(e.target.value)}
                    placeholder="Start writing your reflection...

You can use Markdown formatting:
• **bold text** and *italic text*
• # Headlines and ## Subheadings  
• [links](https://example.com)
• > quotes and insights

Take your time to reflect deeply on the prompt above. Let your thoughts flow naturally."
                    className="textarea-modern min-h-[400px] w-full transition-all focus:ring-primary/50"
                    maxLength={50000}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Image Upload & Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center space-x-4">
                <label className="btn btn-ghost px-4 py-2 cursor-pointer">
                  <Image className="w-4 h-4 mr-2" />
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
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
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
                  {isSaving ? 'Saving...' : canSave ? 'Save Entry' : 'Complete your reflection'}
                </span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
} 