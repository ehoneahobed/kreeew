"use client"

import { useState, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RichTextEditor } from "@/components/editor/rich-text-editor"
import { AIAssistantPanel } from "@/components/editor/ai-assistant-panel"
import { Save, Eye, Send, ArrowLeft, Brain } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface CreatePostPageProps {
  params: Promise<{
    slug: string
  }>
}

export default function CreatePostPage({ params }: CreatePostPageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("write")
  
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    status: "DRAFT",
    isPaid: false,
    featuredImage: "",
    seoTitle: "",
    seoDescription: "",
  })

  const handleContentChange = (content: string) => {
    setFormData(prev => ({ ...prev, content }))
  }

  const handleContentGenerated = (content: string) => {
    setFormData(prev => ({ ...prev, content: prev.content + "\n\n" + content }))
    setActiveTab("write")
  }

  const handleContentImproved = (content: string) => {
    setFormData(prev => ({ ...prev, content }))
    setActiveTab("write")
  }

  const handleTitlesGenerated = (titles: string[]) => {
    if (titles.length > 0) {
      setFormData(prev => ({ ...prev, title: titles[0] }))
      setActiveTab("write")
    }
  }

  const handleSave = async (status: "DRAFT" | "PUBLISHED") => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Please fill in the title and content")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/publications/${resolvedParams.slug}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          status,
          publishedAt: status === "PUBLISHED" ? new Date().toISOString() : null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save post")
      }

      const { post } = await response.json()
      
      toast.success(`Post ${status.toLowerCase()} successfully!`)
      router.push(`/portal/publications/${resolvedParams.slug}/posts/${post.id}`)
    } catch (error) {
      console.error("Error saving post:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save post")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/portal/publications/${resolvedParams.slug}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Publication
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Post</h1>
          <p className="text-muted-foreground">
            Write and publish content for your publication
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Post Content</CardTitle>
                  <CardDescription>
                    Write your post content using our rich text editor
                  </CardDescription>
                </div>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="write">Write</TabsTrigger>
                    <TabsTrigger value="ai">AI Assistant</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsContent value="write" className="space-y-6">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter your post title..."
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="excerpt">Excerpt (Optional)</Label>
                      <Textarea
                        id="excerpt"
                        value={formData.excerpt}
                        onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                        placeholder="A brief summary of your post..."
                        rows={3}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label>Content</Label>
                      <RichTextEditor
                        content={formData.content}
                        onChange={handleContentChange}
                        placeholder="Start writing your post..."
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="ai">
                  <AIAssistantPanel
                    currentContent={formData.content}
                    onContentGenerated={handleContentGenerated}
                    onContentImproved={handleContentImproved}
                    onTitlesGenerated={handleTitlesGenerated}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Publish Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPaid"
                  checked={formData.isPaid}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPaid: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isPaid">Premium Content</Label>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleSave("DRAFT")}
                  disabled={loading}
                  variant="outline"
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Draft
                </Button>
                <Button
                  onClick={() => handleSave("PUBLISHED")}
                  disabled={loading}
                  className="flex-1"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Publish
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* SEO Settings */}
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="seoTitle">SEO Title</Label>
                <Input
                  id="seoTitle"
                  value={formData.seoTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
                  placeholder={formData.title || "SEO title..."}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="seoDescription">SEO Description</Label>
                <Textarea
                  id="seoDescription"
                  value={formData.seoDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, seoDescription: e.target.value }))}
                  placeholder={formData.excerpt || "SEO description..."}
                  rows={3}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="featuredImage">Featured Image URL</Label>
                <Input
                  id="featuredImage"
                  value={formData.featuredImage}
                  onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
