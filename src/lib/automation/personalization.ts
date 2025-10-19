import type { PersonalizationVariable } from "@/lib/types/automation"

/**
 * Standard personalization variables available in automation emails
 */
export const PERSONALIZATION_VARIABLES: readonly PersonalizationVariable[] = [
  {
    key: "{{subscriber.name}}",
    label: "Subscriber Name",
    description: "Full name of the subscriber",
    example: "John Doe"
  },
  {
    key: "{{subscriber.email}}",
    label: "Subscriber Email",
    description: "Email address of the subscriber",
    example: "john@example.com"
  },
  {
    key: "{{subscriber.firstName}}",
    label: "First Name",
    description: "First name only",
    example: "John"
  },
  {
    key: "{{subscriber.lastName}}",
    label: "Last Name",
    description: "Last name only",
    example: "Doe"
  },
  {
    key: "{{publication.name}}",
    label: "Publication Name",
    description: "Name of the publication",
    example: "My Newsletter"
  },
  {
    key: "{{publication.url}}",
    label: "Publication URL",
    description: "URL of the publication",
    example: "https://mynewsletter.com"
  },
  {
    key: "{{post.title}}",
    label: "Post Title",
    description: "Title of the latest post (context-dependent)",
    example: "How to Build Better Habits"
  },
  {
    key: "{{post.url}}",
    label: "Post URL",
    description: "URL of the latest post (context-dependent)",
    example: "https://mynewsletter.com/posts/how-to-build-better-habits"
  },
  {
    key: "{{course.title}}",
    label: "Course Title",
    description: "Title of the course (context-dependent)",
    example: "Complete Web Development Course"
  },
  {
    key: "{{tier.name}}",
    label: "Subscription Tier",
    description: "Name of the subscription tier",
    example: "Premium"
  },
  {
    key: "{{date.today}}",
    label: "Today's Date",
    description: "Current date",
    example: "January 15, 2025"
  },
  {
    key: "{{date.year}}",
    label: "Current Year",
    description: "Current year",
    example: "2025"
  }
] as const

/**
 * Sample data for previewing emails
 */
export const SAMPLE_PERSONALIZATION_DATA = {
  "{{subscriber.name}}": "John Doe",
  "{{subscriber.email}}": "john@example.com",
  "{{subscriber.firstName}}": "John",
  "{{subscriber.lastName}}": "Doe",
  "{{publication.name}}": "My Newsletter",
  "{{publication.url}}": "https://mynewsletter.com",
  "{{post.title}}": "How to Build Better Habits",
  "{{post.url}}": "https://mynewsletter.com/posts/how-to-build-better-habits",
  "{{course.title}}": "Complete Web Development Course",
  "{{tier.name}}": "Premium",
  "{{date.today}}": new Date().toLocaleDateString(),
  "{{date.year}}": new Date().getFullYear().toString()
} as const

/**
 * Get all available personalization variables
 */
export function getAvailableVariables(): readonly PersonalizationVariable[] {
  return PERSONALIZATION_VARIABLES
}

/**
 * Insert a personalization variable into content
 */
export function insertVariable(
  content: string,
  variable: string,
  cursorPosition?: number
): { content: string; newCursorPosition: number } {
  // Handle null/undefined content
  if (!content || typeof content !== 'string') {
    return {
      content: variable,
      newCursorPosition: variable.length
    }
  }

  const beforeCursor = cursorPosition ? content.substring(0, cursorPosition) : content
  const afterCursor = cursorPosition ? content.substring(cursorPosition) : ""
  
  const newContent = beforeCursor + variable + afterCursor
  const newCursorPosition = (cursorPosition || content.length) + variable.length
  
  return {
    content: newContent,
    newCursorPosition
  }
}

/**
 * Render content with personalization variables replaced
 */
export function renderPreview(
  content: string,
  sampleData: Record<string, string> = SAMPLE_PERSONALIZATION_DATA
): string {
  // Handle null/undefined content
  if (!content || typeof content !== 'string') {
    return ''
  }

  let rendered = content
  
  // Replace all personalization variables with sample data
  Object.entries(sampleData).forEach(([variable, value]) => {
    const regex = new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g')
    rendered = rendered.replace(regex, value)
  })
  
  return rendered
}

/**
 * Validate personalization variables in content
 */
export function validateVariables(content: string): {
  isValid: boolean
  invalidVariables: string[]
  missingVariables: string[]
} {
  // Handle null/undefined content
  if (!content || typeof content !== 'string') {
    return {
      isValid: true,
      invalidVariables: [],
      missingVariables: []
    }
  }

  const validVariableKeys = PERSONALIZATION_VARIABLES.map(v => v.key)
  const foundVariables = content.match(/\{\{[^}]+\}\}/g) || []
  const uniqueVariables = [...new Set(foundVariables)]
  
  const invalidVariables = uniqueVariables.filter(
    variable => !validVariableKeys.includes(variable)
  )
  
  const missingVariables = validVariableKeys.filter(
    variable => content.includes(variable) && !SAMPLE_PERSONALIZATION_DATA[variable as keyof typeof SAMPLE_PERSONALIZATION_DATA]
  )
  
  return {
    isValid: invalidVariables.length === 0,
    invalidVariables,
    missingVariables
  }
}

/**
 * Extract all personalization variables from content
 */
export function extractVariables(content: string): string[] {
  const matches = content.match(/\{\{[^}]+\}\}/g) || []
  return [...new Set(matches)]
}

/**
 * Get personalization variable by key
 */
export function getVariableByKey(key: string): PersonalizationVariable | undefined {
  return PERSONALIZATION_VARIABLES.find(variable => variable.key === key)
}

/**
 * Format personalization variable for display
 */
export function formatVariableForDisplay(variable: string): string {
  return variable.replace(/[{}]/g, '')
}
