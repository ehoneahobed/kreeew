"use client"

import { useState, useEffect, use } from "react"
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
import { Save, Eye, Send, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface EditPostPageProps {
  params: Promise<{
    slug: string
    postId: string
  }>
}

interface Post {
  id: string
  title: string
  content: string
  excerpt: string | null
  slug: string
  status: "DRAFT" | "PUBLISHED" | "SCHEDULED" | "ARCHIVED"
  isPaid: boolean
  featuredImage: string | null
  seoTitle: string | null
  seoDescription: string | null
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export default function EditPostPage({ params }: EditPostPageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("write")
  const [post, setPost] = useState<Post | null>(null)
  
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    status: "DRAFT" as const,
    isPaid: false,
    featuredImage: "",
    seoTitle: "",
    seoDescription: "",
  })

  useEffect(() => {
    fetchPost()
  }, [resolvedParams.postId])

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/publications/${resolvedParams.slug}/posts/${resolvedParams.postId}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          toast.error("Post not found")
          router.push(`/portal/publications/${resolvedParams.slug}`)
          return
        }
        throw new Error("Failed to fetch post")
      }

      const data = await response.json()
      setPost(data.post)
      setFormData({
        title: data.post.title,
        excerpt: data.post.excerpt || "",
        content: data.post.content,
        status: data.post.status,
        isPaid: data.post.isPaid,
        featuredImage: data.post.featuredImage || "",
        seoTitle: data.post.seoTitle || "",
        seoDescription: data.post.seoDescription || "",
      })
    } catch (error) {
      console.error("Error fetching post:", error)
      toast.error("Failed to load post")
      router.push(`/portal/publications/${resolvedParams.slug}`)
    } finally {
      setLoading(false)
    }
  }

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

    setSaving(true)
    try {
      const response = await fetch(`/api/publications/${resolvedParams.slug}/posts/${resolvedParams.postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          status,
          publishedAt: status === "PUBLISHED" ? new Date().toISOString() : post?.publishedAt,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save post")
      }

      const { post: updatedPost } = await response.json()
      
      toast.success(`Post ${status.toLowerCase()} successfully!`)
      router.push(`/portal/publications/${resolvedParams.slug}/posts/${updatedPost.id}`)
    } catch (error) {
      console.error("Error saving post:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save post")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading post...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Post not found</h1>
          <p className="text-muted-foreground mb-6">The post you're trying to edit doesn't exist or has been deleted.</p>
          <Button asChild>
            <Link href={`/portal/publications/${resolvedParams.slug}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Publication
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/portal/publications/${resolvedParams.slug}/posts/${resolvedParams.postId}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Post
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Post</h1>
          <p className="text-muted-foreground">
            Update your post content and settings
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
                    Edit your post content using our rich text editor
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
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
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
                  disabled={saving}
                  variant="outline"
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Draft
                </Button>
                <Button
                  onClick={() => handleSave("PUBLISHED")}
                  disabled={saving}
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


