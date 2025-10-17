import { GoogleGenAI } from "@google/genai"

if (!process.env.GOOGLE_GENERATIVE_AI_KEY) {
  throw new Error("GOOGLE_GENERATIVE_AI_KEY environment variable is required")
}

const genAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_KEY,
})

export interface AIGenerateContentRequest {
  prompt: string
  context?: string
  tone?: "professional" | "casual" | "friendly" | "authoritative"
  length?: "short" | "medium" | "long"
}

export interface AIImproveContentRequest {
  content: string
  improvementType: "grammar" | "clarity" | "engagement" | "seo" | "tone"
  targetAudience?: string
}

export interface AISuggestTitlesRequest {
  content: string
  count?: number
  style?: "clickbait" | "professional" | "creative"
}

export interface AIUsageTracking {
  feature: string
  tokensUsed: number
  cost: number
}

/**
 * Generate content based on a prompt using Google Gemini
 */
export async function generateContent(request: AIGenerateContentRequest): Promise<{
  content: string
  usage: AIUsageTracking
}> {
  const systemPrompt = `You are a professional content writer helping creators build engaging content. 
Generate high-quality content based on the user's prompt. Consider the tone and length preferences.

Context: ${request.context || "General content creation"}

Tone: ${request.tone || "professional"}
Length: ${request.length || "medium"}

Guidelines:
- Write in a clear, engaging style
- Use proper formatting with headings and paragraphs
- Include relevant examples when appropriate
- Maintain consistency with the requested tone
- Respect the length preference (short: 1-2 paragraphs, medium: 3-5 paragraphs, long: 6+ paragraphs)

Prompt: ${request.prompt}`

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: systemPrompt,
            },
          ],
        },
      ],
    })

    const content = response.text || ""

    // Estimate token usage (rough approximation: 1 token ≈ 4 characters)
    const tokensUsed = Math.ceil(content.length / 4)
    const cost = (tokensUsed / 1000) * 0.001 // Approximate cost per 1K tokens

    return {
      content,
      usage: {
        feature: "content_generation",
        tokensUsed,
        cost,
      },
    }
  } catch (error) {
    console.error("Error generating content:", error)
    throw new Error("Failed to generate content")
  }
}

/**
 * Improve existing content using AI
 */
export async function improveContent(request: AIImproveContentRequest): Promise<{
  improvedContent: string
  suggestions: string[]
  usage: AIUsageTracking
}> {
  const systemPrompt = `You are a professional editor helping improve content. 
Analyze the provided content and suggest improvements based on the improvement type.

Improvement Type: ${request.improvementType}
Target Audience: ${request.targetAudience || "General audience"}

Content to improve:
${request.content}

Please:
1. Provide the improved version of the content
2. List specific suggestions for improvement
3. Maintain the original intent and message
4. Focus on the requested improvement type

Return your response in this format:
IMPROVED_CONTENT: [improved content here]
SUGGESTIONS:
- [suggestion 1]
- [suggestion 2]
- [suggestion 3]`

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: systemPrompt,
            },
          ],
        },
      ],
    })

    const text = response.text || ""

    // Parse the response
    const improvedContentMatch = text.match(/IMPROVED_CONTENT:\s*(.+?)(?=SUGGESTIONS:|$)/s)
    const suggestionsMatch = text.match(/SUGGESTIONS:\s*([\s\S]+)/)

    const improvedContent = improvedContentMatch?.[1]?.trim() || request.content
    const suggestions = suggestionsMatch?.[1]
      ?.split('\n')
      .map(s => s.replace(/^-\s*/, '').trim())
      .filter(s => s.length > 0) || []

    // Estimate token usage
    const tokensUsed = Math.ceil(text.length / 4)
    const cost = (tokensUsed / 1000) * 0.001

    return {
      improvedContent,
      suggestions,
      usage: {
        feature: "content_improvement",
        tokensUsed,
        cost,
      },
    }
  } catch (error) {
    console.error("Error improving content:", error)
    throw new Error("Failed to improve content")
  }
}

/**
 * Generate title suggestions for content
 */
export async function suggestTitles(request: AISuggestTitlesRequest): Promise<{
  titles: string[]
  usage: AIUsageTracking
}> {
  const systemPrompt = `You are a professional content strategist creating compelling titles.
Generate ${request.count || 5} title suggestions for the provided content.

Content:
${request.content}

Style: ${request.style || "professional"}

Guidelines:
- Make titles engaging and click-worthy
- Keep them under 60 characters when possible
- Match the content's tone and subject matter
- Consider SEO best practices
- Ensure titles accurately represent the content

Return only the titles, one per line, numbered.`

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: systemPrompt,
            },
          ],
        },
      ],
    })

    const text = response.text || ""

    const titles = text
      .split('\n')
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(title => title.length > 0)
      .slice(0, request.count || 5)

    // Estimate token usage
    const tokensUsed = Math.ceil(text.length / 4)
    const cost = (tokensUsed / 1000) * 0.001

    return {
      titles,
      usage: {
        feature: "title_suggestions",
        tokensUsed,
        cost,
      },
    }
  } catch (error) {
    console.error("Error generating titles:", error)
    throw new Error("Failed to generate title suggestions")
  }
}

/**
 * Generate content outline based on a topic
 */
export async function generateOutline(topic: string, sections?: number): Promise<{
  outline: string
  usage: AIUsageTracking
}> {
  const systemPrompt = `You are a content strategist creating detailed outlines.
Generate a comprehensive outline for content about: ${topic}

Number of sections: ${sections || "Let the topic determine"}

Include:
- Main headings
- Sub-headings
- Key points to cover in each section
- Suggested word count for each section

Return a well-structured outline with clear hierarchy.`

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: systemPrompt,
            },
          ],
        },
      ],
    })

    const outline = response.text || ""

    // Estimate token usage
    const tokensUsed = Math.ceil(outline.length / 4)
    const cost = (tokensUsed / 1000) * 0.001

    return {
      outline,
      usage: {
        feature: "outline_generation",
        tokensUsed,
        cost,
      },
    }
  } catch (error) {
    console.error("Error generating outline:", error)
    throw new Error("Failed to generate content outline")
  }
}

/**
 * Check if user has sufficient AI credits/usage
 */
export function checkAIUsageLimit(
  userPlan: string,
  currentUsage: number,
  monthlyLimit: number
): boolean {
  const limits = {
    free: 1000, // 1000 tokens per month
    starter: 10000, // 10k tokens per month
    pro: 50000, // 50k tokens per month
  }

  const planLimit = limits[userPlan as keyof typeof limits] || limits.free
  return currentUsage < planLimit
}

/**
 * Calculate estimated cost for AI usage
 */
export function calculateAICost(tokens: number): number {
  return (tokens / 1000) * 0.001 // $0.001 per 1K tokens (approximate Gemini pricing)
}
