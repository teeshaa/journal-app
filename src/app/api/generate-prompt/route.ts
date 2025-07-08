import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Validate environment variables
function validateGroqApiKey(): string {
  const apiKey = process.env.GROQ_API_KEY
  
  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable is required and must be set')
  }
  
  if (apiKey.length < 20) {
    throw new Error('GROQ_API_KEY appears to be invalid (too short)')
  }
  
  return apiKey
}

// Initialize Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase configuration missing')
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

const GROQ_API_KEY = validateGroqApiKey()
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

// Valid theme types - no defaults
const VALID_THEMES = [
  'technology_impact',
  'delivery_impact', 
  'business_impact',
  'team_impact',
  'org_impact'
] as const

type ValidTheme = typeof VALID_THEMES[number]

interface JournalEntry {
  id: string
  theme: string
  prompt: string
  content: string
  created_at: string
  word_count: number
  tags: string[]
}

interface UserContext {
  previousEntries: JournalEntry[]
  hasEntries: boolean
  recentThemes: string[]
  totalEntries: number
}

// Theme descriptions for better prompt generation
const THEME_DESCRIPTIONS: Record<ValidTheme, {
  title: string
  description: string
  examples: string[]
}> = {
  technology_impact: {
    title: 'Technology Impact',
    description: 'Reflection on technical decisions, architecture, and engineering excellence',
    examples: [
      'How do I balance short-term delivery pressures with long-term technical health?',
      'Are we investing enough in automated testing and continuous delivery?',
      'How am I helping engineers develop skills that will sustain technical excellence?'
    ]
  },
  delivery_impact: {
    title: 'Delivery Impact',
    description: 'Reflection on project delivery, quality, and process improvements',
    examples: [
      'What\'s one recent delivery mistake we made, and how can we ensure it doesn\'t happen again?',
      'When have I felt pressure to compromise on quality or take shortcuts? How did I respond?',
      'How can I foster predictability in delivery without adding stress?'
    ]
  },
  business_impact: {
    title: 'Business Impact',
    description: 'Reflection on strategic thinking and business value creation',
    examples: [
      'How do I ensure that stakeholders see engineering as a strategic partner rather than a service function?',
      'What\'s one business metric I should pay more attention to as a tech leader?',
      'Have I effectively explained the ROI of a technical initiative to a stakeholder?'
    ]
  },
  team_impact: {
    title: 'Team Impact',
    description: 'Reflection on leadership, team dynamics, and individual growth',
    examples: [
      'How well do I adjust my leadership style based on the situation and individual?',
      'Have I created a space where people feel safe to speak up and challenge ideas?',
      'What\'s one strength in a team member I should actively help them develop?'
    ]
  },
  org_impact: {
    title: 'Org Impact',
    description: 'Reflection on organizational influence and culture building',
    examples: [
      'How have I contributed beyond my immediate role in the organization?',
      'What\'s one improvement I could propose that would benefit multiple teams?',
      'Am I actively advocating for a strong engineering culture that attracts the right people?'
    ]
  }
}

interface RequestBody {
  theme: ValidTheme
  userId?: string
}

interface GroqResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

// Validate theme input
function validateTheme(theme: unknown): ValidTheme {
  if (typeof theme !== 'string') {
    throw new Error('Theme must be a string')
  }
  
  if (!theme.trim()) {
    throw new Error('Theme cannot be empty')
  }
  
  if (!VALID_THEMES.includes(theme as ValidTheme)) {
    throw new Error(`Invalid theme. Must be one of: ${VALID_THEMES.join(', ')}`)
  }
  
  return theme as ValidTheme
}

// Validate and parse request body
async function validateRequestBody(request: NextRequest): Promise<RequestBody> {
  let body: unknown
  
  try {
    body = await request.json()
  } catch {
    throw new Error('Invalid JSON in request body')
  }
  
  if (!body || typeof body !== 'object') {
    throw new Error('Request body must be a valid object')
  }
  
  const { theme, userId } = body as Record<string, unknown>
  
  return {
    theme: validateTheme(theme),
    userId: typeof userId === 'string' ? userId : undefined
  }
}

// Get user's previous entries for context
async function getUserContext(request: NextRequest): Promise<UserContext> {
  try {
    const supabase = getSupabaseClient()
    
    // Get user from auth header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      console.log('📝 No auth header found, proceeding without user context')
      return { previousEntries: [], hasEntries: false, recentThemes: [], totalEntries: 0 }
    }

    // Extract JWT token from Bearer header
    const token = authHeader.replace('Bearer ', '')
    
    // Get user from token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      console.log('📝 User not authenticated, proceeding without context')
      return { previousEntries: [], hasEntries: false, recentThemes: [], totalEntries: 0 }
    }

    // Fetch previous 3 entries
    const { data: entries, error } = await supabase
      .from('journal_entries')
      .select('id, theme, prompt, content, created_at, word_count, tags')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3)

    if (error) {
      console.error('❌ Error fetching user entries:', error)
      return { previousEntries: [], hasEntries: false, recentThemes: [], totalEntries: 0 }
    }

    const previousEntries = entries || []
    const recentThemes = [...new Set(previousEntries.map(e => e.theme))]
    
    console.log('📚 Retrieved user context:', {
      entriesCount: previousEntries.length,
      recentThemes,
      mostRecentEntry: previousEntries[0]?.created_at
    })

    return {
      previousEntries,
      hasEntries: previousEntries.length > 0,
      recentThemes,
      totalEntries: previousEntries.length
    }
    
  } catch (error) {
    console.error('❌ Error getting user context:', error)
    return { previousEntries: [], hasEntries: false, recentThemes: [], totalEntries: 0 }
  }
}

// Generate enhanced system prompt with user context
function generateSystemPrompt(
  themeInfo: typeof THEME_DESCRIPTIONS[ValidTheme], 
  userContext: UserContext
): string {
  let systemPrompt = `You are an expert tech leadership coach who creates powerful, concise reflection questions.

Generate ONE focused reflection question for: "${themeInfo.title}"

Theme Context: ${themeInfo.description}

High-impact question examples:
${themeInfo.examples.map(example => `- ${example}`).join('\n')}`

  // Add targeted user context if available
  if (userContext.hasEntries && userContext.previousEntries.length > 0) {
    const recentEntry = userContext.previousEntries[0]
    systemPrompt += `\n\nUser's Recent Focus: They recently reflected on "${recentEntry.theme}" with the question: "${recentEntry.prompt}"`
    
    if (userContext.recentThemes.length > 1) {
      systemPrompt += `\nOther recent themes: ${userContext.recentThemes.slice(1).join(', ')}`
    }
    
    systemPrompt += `\n\nBuild on their journey by creating a question that:`
    systemPrompt += `\n- Connects to their recent reflections without repeating them`
    systemPrompt += `\n- Pushes their thinking forward`
    systemPrompt += `\n- Is actionable and specific`
  } else {
    systemPrompt += `\n\nThis is their first reflection. Create a foundational question.`
  }

  systemPrompt += `\n\nRules:
1. Generate ONE linear, focused question (not multiple questions)
2. Keep it under 25 words when possible
3. Make it personally relevant and specific
4. Avoid vague or philosophical language
5. Focus on actionable insights
6. Don't use question marks at the end unless necessary

Example of good format: "What's one technical decision you made this week that you'd handle differently today and why"

Generate a sharp, memorable question for ${themeInfo.title.toLowerCase()}.`

  return systemPrompt
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestTimestamp = new Date().toISOString()
  
  try {
    // Validate request body
    const { theme } = await validateRequestBody(request)
    
    // Get user context from previous entries
    const userContext = await getUserContext(request)
    
    const themeInfo = THEME_DESCRIPTIONS[theme]
    const systemPrompt = generateSystemPrompt(themeInfo, userContext)

    // Build the messages array for the LLM call
    const messages = [
      {
        role: 'system' as const,
        content: systemPrompt
      },
      {
        role: 'user' as const,
        content: `Generate a personalized reflection question for ${themeInfo.title}${userContext.hasEntries ? ' that builds on my previous reflections' : ''}`
      }
    ]

    // Build the complete request payload
    const requestPayload = {
      model: 'llama-3.3-70b-versatile',
      messages: messages,
      temperature: 0.8,
      max_tokens: 200
    }

    // 🔥 COMPREHENSIVE LLM CALL LOGGING
    console.log('🚀 ===== ENHANCED LLM API CALL START =====')
    console.log('📅 Timestamp:', requestTimestamp)
    console.log('🎯 Theme Selected:', theme)
    console.log('📋 Theme Info:', themeInfo)
    console.log('👤 User Context:', {
      hasEntries: userContext.hasEntries,
      totalEntries: userContext.totalEntries,
      recentThemes: userContext.recentThemes,
      entriesCount: userContext.previousEntries.length
    })
    console.log('🔧 Model:', requestPayload.model)
    console.log('🌡️ Temperature:', requestPayload.temperature)
    console.log('📏 Max Tokens:', requestPayload.max_tokens)
    console.log('💬 COMPLETE MESSAGES ARRAY:')
    console.log(JSON.stringify(messages, null, 2))
    console.log('📦 FULL REQUEST PAYLOAD:')
    console.log(JSON.stringify(requestPayload, null, 2))
    console.log('🌐 API Endpoint:', GROQ_API_URL)
    console.log('================================')

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload)
    })

    const responseTimestamp = new Date().toISOString()

    console.log('📨 ===== LLM API RESPONSE =====')
    console.log('📅 Response Timestamp:', responseTimestamp)
    console.log('✅ Response Status:', response.status)
    console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ GROQ API ERROR RESPONSE:')
      console.error('Status:', response.status)
      console.error('Error Text:', errorText)
      console.log('🚨 ===== LLM API CALL FAILED =====')
      throw new Error(`Groq API request failed with status ${response.status}: ${errorText}`)
    }

    const data: GroqResponse = await response.json()
    
    console.log('✨ COMPLETE LLM RESPONSE DATA:')
    console.log(JSON.stringify(data, null, 2))
    
    if (!data.choices || data.choices.length === 0) {
      console.error('❌ No choices returned from Groq API')
      console.log('🚨 ===== LLM API CALL FAILED =====')
      throw new Error('No choices returned from Groq API')
    }
    
    const generatedPrompt = data.choices[0]?.message?.content?.trim()

    console.log('🎉 GENERATED PERSONALIZED PROMPT:')
    console.log('"' + generatedPrompt + '"')
    console.log('📊 Prompt Length:', generatedPrompt?.length || 0, 'characters')
    console.log('🧠 Context Used:', userContext.hasEntries ? 'WITH previous entries' : 'WITHOUT previous entries')

    if (!generatedPrompt) {
      console.error('❌ Empty or invalid prompt generated')
      console.log('🚨 ===== LLM API CALL FAILED =====')
      throw new Error('Empty or invalid prompt generated by Groq API')
    }

    if (generatedPrompt.length < 10) {
      console.error('❌ Generated prompt too short:', generatedPrompt.length, 'characters')
      console.log('🚨 ===== LLM API CALL FAILED =====')
      throw new Error('Generated prompt is too short')
    }

    const finalResponse = { 
      prompt: generatedPrompt,
      theme: theme,
      themeTitle: themeInfo.title,
      contextUsed: userContext.hasEntries,
      previousEntriesCount: userContext.totalEntries
    }

    console.log('🎯 FINAL API RESPONSE:')
    console.log(JSON.stringify(finalResponse, null, 2))
    console.log('⏱️ Total Processing Time:', (new Date().getTime() - new Date(requestTimestamp).getTime()), 'ms')
    console.log('✅ ===== ENHANCED LLM API CALL SUCCESS =====')

    return NextResponse.json(finalResponse, { status: 200 })

  } catch (error) {
    const errorTimestamp = new Date().toISOString()
    console.error('🚨 ===== LLM API CALL ERROR =====')
    console.error('📅 Error Timestamp:', errorTimestamp)
    console.error('❌ Error Details:', error)
    console.error('📝 Error Message:', error instanceof Error ? error.message : 'Unknown error')
    console.error('📚 Error Stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.log('💥 ===== LLM API CALL FAILED =====')
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    // Return specific error codes based on error type
    if (errorMessage.includes('Invalid theme') || errorMessage.includes('Theme must be') || errorMessage.includes('Theme cannot be')) {
      return NextResponse.json({ 
        error: 'Invalid theme provided',
        details: errorMessage 
      }, { status: 400 })
    }
    
    if (errorMessage.includes('Invalid JSON') || errorMessage.includes('Request body must be')) {
      return NextResponse.json({ 
        error: 'Invalid request format',
        details: errorMessage 
      }, { status: 400 })
    }
    
    if (errorMessage.includes('GROQ_API_KEY')) {
      return NextResponse.json({ 
        error: 'Server configuration error',
        details: 'API service is not properly configured' 
      }, { status: 500 })
    }
    
    if (errorMessage.includes('Groq API')) {
      return NextResponse.json({ 
        error: 'External service error',
        details: 'Unable to generate prompt at this time' 
      }, { status: 503 })
    }
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: 'An unexpected error occurred' 
    }, { status: 500 })
  }
} 