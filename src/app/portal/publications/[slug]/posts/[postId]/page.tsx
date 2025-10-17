"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  Edit, 
  Eye, 
  Calendar, 
  User, 
  BarChart3, 
  MessageSquare, 
  Bookmark,
  Share2,
  Trash2,
  Save,
  Send
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"

interface PostDetailPageProps {
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
  publication: {
    id: string
    name: string
    slug: string
  }
  _count: {
    comments: number
    bookmarks: number
    analytics: number
  }
}

export default function PostDetailPage({ params }: PostDetailPageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

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
    } catch (error) {
      console.error("Error fetching post:", error)
      toast.error("Failed to load post")
      router.push(`/portal/publications/${resolvedParams.slug}`)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!post) return

    setActionLoading("status")
    try {
      const response = await fetch(`/api/publications/${resolvedParams.slug}/posts/${resolvedParams.postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          publishedAt: newStatus === "PUBLISHED" ? new Date().toISOString() : post.publishedAt,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update post status")
      }

      const data = await response.json()
      setPost(data.post)
      toast.success(`Post ${newStatus.toLowerCase()} successfully!`)
    } catch (error) {
      console.error("Error updating post:", error)
      toast.error("Failed to update post")
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async () => {
    if (!post) return

    if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return
    }

    setActionLoading("delete")
    try {
      const response = await fetch(`/api/publications/${resolvedParams.slug}/posts/${resolvedParams.postId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete post")
      }

      toast.success("Post deleted successfully!")
      router.push(`/portal/publications/${resolvedParams.slug}`)
    } catch (error) {
      console.error("Error deleting post:", error)
      toast.error("Failed to delete post")
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
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
          <p className="text-muted-foreground mb-6">The post you're looking for doesn't exist or has been deleted.</p>
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
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/portal/publications/${resolvedParams.slug}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Publication
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{post.title}</h1>
          <div className="flex items-center gap-4 mt-2">
            <Badge variant={post.status === "PUBLISHED" ? "default" : "secondary"}>
              {post.status}
            </Badge>
            {post.isPaid && (
              <Badge variant="outline">Premium</Badge>
            )}
            <span className="text-sm text-muted-foreground">
              Created {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/portal/publications/${resolvedParams.slug}/posts/${post.id}/edit`}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/${resolvedParams.slug}/${post.slug}`} target="_blank">
              <Eye className="w-4 h-4 mr-2" />
              View
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="content" className="space-y-6">
            <TabsList>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
            </TabsList>

            <TabsContent value="content">
              <Card>
                <CardHeader>
                  <CardTitle>Post Content</CardTitle>
                  <CardDescription>
                    {post.excerpt || "No excerpt provided"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div 
                    className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl max-w-none"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>Analytics</CardTitle>
                  <CardDescription>
                    Track your post's performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{post._count.analytics}</div>
                      <div className="text-sm text-muted-foreground">Views</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{post._count.bookmarks}</div>
                      <div className="text-sm text-muted-foreground">Bookmarks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{post._count.comments}</div>
                      <div className="text-sm text-muted-foreground">Comments</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comments">
              <Card>
                <CardHeader>
                  <CardTitle>Comments</CardTitle>
                  <CardDescription>
                    Manage post comments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Comments feature coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {post.status === "DRAFT" && (
                <Button 
                  onClick={() => handleStatusChange("PUBLISHED")}
                  disabled={actionLoading === "status"}
                  className="w-full"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Publish Now
                </Button>
              )}
              
              {post.status === "PUBLISHED" && (
                <Button 
                  onClick={() => handleStatusChange("DRAFT")}
                  disabled={actionLoading === "status"}
                  variant="outline"
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Unpublish
                </Button>
              )}

              <Button asChild variant="outline" className="w-full">
                <Link href={`/portal/publications/${resolvedParams.slug}/posts/${post.id}/edit`}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Post
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full">
                <Link href={`/${resolvedParams.slug}/${post.slug}`} target="_blank">
                  <Eye className="w-4 h-4 mr-2" />
                  View Public
                </Link>
              </Button>

              <Button 
                onClick={handleDelete}
                disabled={actionLoading === "delete"}
                variant="destructive"
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Post
              </Button>
            </CardContent>
          </Card>

          {/* Post Details */}
          <Card>
            <CardHeader>
              <CardTitle>Post Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Status</div>
                <Badge variant={post.status === "PUBLISHED" ? "default" : "secondary"}>
                  {post.status}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Content Type</div>
                <div className="text-sm text-muted-foreground">
                  {post.isPaid ? "Premium Content" : "Free Content"}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Created</div>
                <div className="text-sm text-muted-foreground">
                  {new Date(post.createdAt).toLocaleDateString()}
                </div>
              </div>

              {post.publishedAt && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Published</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(post.publishedAt).toLocaleDateString()}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="text-sm font-medium">Last Updated</div>
                <div className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(post.updatedAt), { addSuffix: true })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


