'use client'

import { useState } from 'react'
import { Lightbulb, PenTool, Image, Save, Loader2, Bookmark, BookmarkCheck, AlertCircle, CheckCircle, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { supabase } from '@/lib/supabase'
import type { CreateJournalEntry } from '@/lib/supabase'
import type { ValidTheme } from './ThemePicker'

interface JournalInterfaceProps {
  selectedTheme: ValidTheme | null
}

interface ErrorState {
  message: string
  type: 'error' | 'warning' | 'info'
}

interface SuccessState {
  message: string
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
  
  // Remove duplicates and ensure max 10 tags
  return [...new Set(foundTags)].slice(0, 10)
}

export function JournalInterface({ selectedTheme }: JournalInterfaceProps) {
  const [currentPrompt, setCurrentPrompt] = useState<string>('')
  const [currentTheme, setCurrentTheme] = useState<ValidTheme | null>(null)
  const [journalContent, setJournalContent] = useState<string>('')
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false)
  const [showPreview, setShowPreview] = useState<boolean>(false)
  const [images, setImages] = useState<string[]>([])
  const [error, setError] = useState<ErrorState | null>(null)
  const [success, setSuccess] = useState<SuccessState | null>(null)

  // Clear notifications
  const clearNotifications = (): void => {
    setError(null)
    setSuccess(null)
  }

  // Show error notification
  const showError = (message: string, type: ErrorState['type'] = 'error'): void => {
    setError({ message, type })
    setSuccess(null)
  }

  // Show success notification
  const showSuccess = (message: string): void => {
    setSuccess({ message })
    setError(null)
  }

  const generatePrompt = async (theme: ValidTheme): Promise<void> => {
    clearNotifications()
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
      showSuccess('New reflection prompt generated successfully!')
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('Error generating prompt:', error)
      showError(`Failed to generate prompt: ${errorMessage}`)
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
      showError('Please upload a valid image file (JPEG, PNG, WebP, or GIF)')
      return
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      showError('Image file must be smaller than 10MB')
      return
    }

    // Check if we already have too many images
    if (images.length >= 5) {
      showError('Maximum 5 images allowed per entry')
      return
    }

    try {
      const imageUrl = URL.createObjectURL(file)
      setImages(prevImages => [...prevImages, imageUrl])
      clearNotifications()
    } catch (error) {
      showError('Failed to process image file')
    }
  }

  const removeImage = (index: number): void => {
    setImages(prevImages => {
      const newImages = [...prevImages]
      // Revoke the URL to free memory
      URL.revokeObjectURL(newImages[index])
      newImages.splice(index, 1)
      return newImages
    })
  }

  const saveEntry = async (): Promise<void> => {
    clearNotifications()
    
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
      
      showSuccess(`Entry saved successfully! ${wordCount} words, ${tags.length} tags`)
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('Error saving entry:', error)
      showError(`Failed to save entry: ${errorMessage}`)
    } finally {
      setIsSaving(false)
    }
  }

  const wordCount = calculateWordCount(journalContent)
  const canSave = currentPrompt.trim() && journalContent.trim() && !isSaving
  const canGeneratePrompt = selectedTheme && !isGeneratingPrompt

  return (
    <div className="glass-morphism rounded-2xl shadow-xl p-8 space-y-8 card-hover">
      {/* Notifications */}
      {error && (
        <div className="notification-error rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <p className="text-red-800 font-medium">{error.message}</p>
          </div>
          <button
            onClick={clearNotifications}
            className="text-red-600 hover:text-red-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {success && (
        <div className="notification-success rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
            <p className="text-green-800 font-medium">{success.message}</p>
          </div>
          <button
            onClick={clearNotifications}
            className="text-green-600 hover:text-green-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Prompt Generation */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-warm-500 to-warm-600 rounded-xl flex items-center justify-center shadow-lg">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900">
              Your Reflection Prompt
            </h3>
          </div>
          <button
            onClick={() => selectedTheme && generatePrompt(selectedTheme)}
            disabled={!canGeneratePrompt}
            className="btn-warm px-6 py-3 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-semibold shadow-lg"
          >
            {isGeneratingPrompt ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Lightbulb className="w-5 h-5" />
            )}
            <span>Generate Prompt</span>
          </button>
        </div>

        {currentPrompt && (
          <div className="p-6 bg-gradient-to-br from-sage-50 to-sage-100 rounded-xl border-l-4 border-sage-500 shadow-md">
            <p className="text-sage-800 font-medium text-lg leading-relaxed">
              {currentPrompt}
            </p>
          </div>
        )}
      </div>

      {/* Journal Entry */}
      {currentPrompt && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-sage-500 to-sage-600 rounded-xl flex items-center justify-center shadow-lg">
                <PenTool className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900">
                Your Reflection
              </h3>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="px-4 py-2 text-neutral-600 hover:text-neutral-900 rounded-lg border-2 border-neutral-300 hover:border-neutral-400 transition-all font-medium"
              >
                {showPreview ? 'Edit' : 'Preview'}
              </button>
              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`p-3 rounded-xl transition-all shadow-md ${
                  isBookmarked 
                    ? 'text-warm-600 bg-warm-100 border-2 border-warm-300' 
                    : 'text-neutral-400 hover:text-warm-600 hover:bg-warm-50 border-2 border-neutral-200 hover:border-warm-300'
                }`}
                title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
              >
                {isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {showPreview ? (
            <div className="p-6 glass-morphism rounded-xl min-h-[300px] shadow-md">
              <ReactMarkdown className="prose prose-neutral prose-lg max-w-none">
                {journalContent || '*Start writing your reflection...*'}
              </ReactMarkdown>
            </div>
          ) : (
            <textarea
              value={journalContent}
              onChange={(e) => setJournalContent(e.target.value)}
              placeholder="Start writing your reflection... 

You can use Markdown formatting:
- **bold text**
- *italic text*
- # Headlines
- [links](https://example.com)
- > quotes

Take your time to reflect deeply on the prompt above."
              className="input-warm w-full h-80 p-6 rounded-xl resize-y text-lg leading-relaxed shadow-md"
              maxLength={50000}
            />
          )}

          {/* Image Upload & Stats */}
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-3 px-6 py-3 glass-morphism text-neutral-700 rounded-xl hover:bg-white/95 cursor-pointer transition-all shadow-md font-medium">
              <Image className="w-5 h-5" />
              <span>Add Image ({images.length}/5)</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={images.length >= 5}
              />
            </label>
            <div className="text-muted space-x-6 text-lg">
              <span className="font-semibold">{wordCount} words</span>
              {journalContent.trim() && (
                <span className="text-sm">Auto-calculated</span>
              )}
            </div>
          </div>

          {/* Image Preview */}
          {images.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-neutral-700 flex items-center">
                <Image className="w-5 h-5 mr-2 icon-warm" />
                Attached Images:
              </h4>
              <div className="flex space-x-4 flex-wrap">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Upload ${index + 1}`}
                      className="w-24 h-24 object-cover rounded-xl shadow-lg transition-transform group-hover:scale-105"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg hover:bg-red-600"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={saveEntry}
            disabled={!canSave}
            className="btn-warm w-full py-4 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 text-lg font-semibold shadow-xl"
          >
            {isSaving ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Save className="w-6 h-6" />
            )}
            <span>
              {isSaving ? 'Saving...' : canSave ? 'Save Entry' : 'Complete your reflection to save'}
            </span>
          </button>
        </div>
      )}
    </div>
  )
} 