"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
  Brain, 
  Sparkles, 
  Wand2, 
  Type, 
  Lightbulb,
  Loader2,
  Copy,
  Check
} from "lucide-react"
import { toast } from "sonner"

interface AIAssistantPanelProps {
  onContentGenerated: (content: string) => void
  onContentImproved: (content: string) => void
  onTitlesGenerated: (titles: string[]) => void
  currentContent?: string
}

export function AIAssistantPanel({
  onContentGenerated,
  onContentImproved,
  onTitlesGenerated,
  currentContent = "",
}: AIAssistantPanelProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [generatedContent, setGeneratedContent] = useState("")
  const [improvedContent, setImprovedContent] = useState("")
  const [suggestedTitles, setSuggestedTitles] = useState<string[]>([])
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set())

  // Content Generation
  const [generatePrompt, setGeneratePrompt] = useState("")
  const [generateContext, setGenerateContext] = useState("")
  const [generateTone, setGenerateTone] = useState("professional")
  const [generateLength, setGenerateLength] = useState("medium")

  // Content Improvement
  const [improvementType, setImprovementType] = useState("clarity")
  const [targetAudience, setTargetAudience] = useState("")

  // Title Generation
  const [titleStyle, setTitleStyle] = useState("professional")
  const [titleCount, setTitleCount] = useState(5)

  const copyToClipboard = async (text: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedItems(prev => new Set([...prev, itemId]))
      toast.success("Copied to clipboard")
      setTimeout(() => {
        setCopiedItems(prev => {
          const newSet = new Set(prev)
          newSet.delete(itemId)
          return newSet
        })
      }, 2000)
    } catch (error) {
      toast.error("Failed to copy to clipboard")
    }
  }

  const handleGenerateContent = async () => {
    if (!generatePrompt.trim()) {
      toast.error("Please enter a prompt")
      return
    }

    setLoading("generate")
    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: generatePrompt,
          context: generateContext || undefined,
          tone: generateTone,
          length: generateLength,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to generate content")
      }

      const data = await response.json()
      setGeneratedContent(data.content)
      toast.success("Content generated successfully")
    } catch (error) {
      console.error("Error generating content:", error)
      toast.error(error instanceof Error ? error.message : "Failed to generate content")
    } finally {
      setLoading(null)
    }
  }

  const handleImproveContent = async () => {
    if (!currentContent.trim()) {
      toast.error("Please enter some content to improve")
      return
    }

    setLoading("improve")
    try {
      const response = await fetch("/api/ai/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: currentContent,
          improvementType,
          targetAudience: targetAudience || undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to improve content")
      }

      const data = await response.json()
      setImprovedContent(data.improvedContent)
      toast.success("Content improved successfully")
    } catch (error) {
      console.error("Error improving content:", error)
      toast.error(error instanceof Error ? error.message : "Failed to improve content")
    } finally {
      setLoading(null)
    }
  }

  const handleGenerateTitles = async () => {
    if (!currentContent.trim()) {
      toast.error("Please enter some content to generate titles for")
      return
    }

    setLoading("titles")
    try {
      const response = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: currentContent,
          count: titleCount,
          style: titleStyle,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to generate titles")
      }

      const data = await response.json()
      setSuggestedTitles(data.titles)
      toast.success("Title suggestions generated")
    } catch (error) {
      console.error("Error generating titles:", error)
      toast.error(error instanceof Error ? error.message : "Failed to generate titles")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Content Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Generate Content
          </CardTitle>
          <CardDescription>
            Create new content from a prompt
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              value={generatePrompt}
              onChange={(e) => setGeneratePrompt(e.target.value)}
              placeholder="Write about the benefits of remote work..."
              rows={3}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="context">Context (Optional)</Label>
            <Input
              id="context"
              value={generateContext}
              onChange={(e) => setGenerateContext(e.target.value)}
              placeholder="For a tech blog audience..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Tone</Label>
              <Select value={generateTone} onValueChange={setGenerateTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="authoritative">Authoritative</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Length</Label>
              <Select value={generateLength} onValueChange={setGenerateLength}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="long">Long</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleGenerateContent}
            disabled={loading === "generate" || !generatePrompt.trim()}
            className="w-full"
          >
            {loading === "generate" ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            Generate Content
          </Button>

          {generatedContent && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Generated Content</Label>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(generatedContent, "generated")}
                  >
                    {copiedItems.has("generated") ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onContentGenerated(generatedContent)}
                  >
                    Use Content
                  </Button>
                </div>
              </div>
              <div className="p-3 bg-muted rounded-lg text-sm max-h-40 overflow-y-auto">
                <div dangerouslySetInnerHTML={{ __html: generatedContent }} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content Improvement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            Improve Content
          </CardTitle>
          <CardDescription>
            Enhance your existing content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Improvement Type</Label>
            <Select value={improvementType} onValueChange={setImprovementType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grammar">Grammar & Style</SelectItem>
                <SelectItem value="clarity">Clarity</SelectItem>
                <SelectItem value="engagement">Engagement</SelectItem>
                <SelectItem value="seo">SEO Optimization</SelectItem>
                <SelectItem value="tone">Tone Adjustment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="audience">Target Audience (Optional)</Label>
            <Input
              id="audience"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="Tech professionals, students, general audience..."
            />
          </div>

          <Button 
            onClick={handleImproveContent}
            disabled={loading === "improve" || !currentContent.trim()}
            className="w-full"
          >
            {loading === "improve" ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4 mr-2" />
            )}
            Improve Content
          </Button>

          {improvedContent && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Improved Content</Label>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(improvedContent, "improved")}
                  >
                    {copiedItems.has("improved") ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onContentImproved(improvedContent)}
                  >
                    Use Content
                  </Button>
                </div>
              </div>
              <div className="p-3 bg-muted rounded-lg text-sm max-h-40 overflow-y-auto">
                <div dangerouslySetInnerHTML={{ __html: improvedContent }} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Title Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="w-5 h-5" />
            Title Suggestions
          </CardTitle>
          <CardDescription>
            Generate compelling titles for your content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Style</Label>
              <Select value={titleStyle} onValueChange={setTitleStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="clickbait">Clickbait</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Count</Label>
              <Select value={titleCount.toString()} onValueChange={(v) => setTitleCount(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 titles</SelectItem>
                  <SelectItem value="5">5 titles</SelectItem>
                  <SelectItem value="10">10 titles</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleGenerateTitles}
            disabled={loading === "titles" || !currentContent.trim()}
            className="w-full"
          >
            {loading === "titles" ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Lightbulb className="w-4 h-4 mr-2" />
            )}
            Generate Titles
          </Button>

          {suggestedTitles.length > 0 && (
            <div className="space-y-2">
              <Label>Title Suggestions</Label>
              <div className="space-y-2">
                {suggestedTitles.map((title, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm flex-1">{title}</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(title, `title-${index}`)}
                      >
                        {copiedItems.has(`title-${index}`) ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => onTitlesGenerated([title])}
                      >
                        Use
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


