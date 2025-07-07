import { NextRequest, NextResponse } from 'next/server'

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
  
  const { theme } = body as Record<string, unknown>
  
  return {
    theme: validateTheme(theme)
  }
}

// Generate system prompt
function generateSystemPrompt(themeInfo: typeof THEME_DESCRIPTIONS[ValidTheme]): string {
  return `You are a thoughtful mentor for tech leaders who helps them reflect on their leadership journey. 

Your task is to generate a single, powerful reflection question for the theme: "${themeInfo.title}".

Theme Context: ${themeInfo.description}

Example questions for this theme:
${themeInfo.examples.map(example => `- ${example}`).join('\n')}

Guidelines:
1. Generate ONE unique, thought-provoking question
2. Make it personally relevant to tech leaders
3. Encourage deep self-reflection
4. Keep it concise but impactful
5. Focus on growth and learning
6. Don't repeat the examples provided

Generate a fresh, unique question that will help a tech leader reflect deeply on their ${themeInfo.title.toLowerCase()}.`
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Validate request body
    const { theme } = await validateRequestBody(request)
    
    const themeInfo = THEME_DESCRIPTIONS[theme]
    const systemPrompt = generateSystemPrompt(themeInfo)

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Generate a reflection question for ${themeInfo.title}`
          }
        ],
        temperature: 0.8,
        max_tokens: 150
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Groq API error:', errorText)
      throw new Error(`Groq API request failed with status ${response.status}: ${errorText}`)
    }

    const data: GroqResponse = await response.json()
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No choices returned from Groq API')
    }
    
    const generatedPrompt = data.choices[0]?.message?.content?.trim()

    if (!generatedPrompt) {
      throw new Error('Empty or invalid prompt generated by Groq API')
    }

    if (generatedPrompt.length < 10) {
      throw new Error('Generated prompt is too short')
    }

    return NextResponse.json({ 
      prompt: generatedPrompt,
      theme: theme,
      themeTitle: themeInfo.title
    }, { status: 200 })

  } catch (error) {
    console.error('Error in generate-prompt API:', error)
    
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