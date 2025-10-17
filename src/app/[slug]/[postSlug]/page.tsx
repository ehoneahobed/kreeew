import { getPostBySlug } from "@/lib/publications"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AnalyticsTracker } from "@/components/analytics/analytics-tracker"
import { 
  Calendar,
  User,
  ArrowLeft,
  BookOpen,
  Share2,
  Bookmark,
  MessageSquare
} from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface PublicPostPageProps {
  params: Promise<{
    slug: string
    postSlug: string
  }>
}

export default async function PublicPostPage({ params }: PublicPostPageProps) {
  const resolvedParams = await params
  const post = await getPostBySlug(resolvedParams.slug, resolvedParams.postSlug)
  
  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Analytics Tracking */}
      <AnalyticsTracker 
        publicationId={post.publication.id} 
        postId={post.id} 
      />
      
      {/* Sticky Navigation Bar */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/${resolvedParams.slug}`}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to {post.publication.name}
                </Link>
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Bookmark className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <article className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl max-w-none">
              {/* Post Header */}
              <header className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant={post.isPaid ? "default" : "secondary"}>
                    {post.isPaid ? "Premium" : "Free"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {post.publishedAt 
                      ? formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })
                      : "Draft"
                    }
                  </span>
                </div>
                
                <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
                
                {post.excerpt && (
                  <p className="text-xl text-muted-foreground mb-6">{post.excerpt}</p>
                )}

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{post.publication.user.name || "Anonymous"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {post.publishedAt 
                        ? new Date(post.publishedAt).toLocaleDateString()
                        : "Draft"
                      }
                    </span>
                  </div>
                </div>
              </header>

              {/* Post Content */}
              <div 
                className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Post Footer */}
              <footer className="mt-12 pt-8 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Comment
                    </Button>
                    <Button variant="outline" size="sm">
                      <Bookmark className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </div>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </footer>
            </article>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* About Publication */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  About {post.publication.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>By {post.publication.user.name || "Anonymous"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Created {formatDistanceToNow(new Date(post.publication.createdAt), { addSuffix: true })}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                  <span>{post.publication._count.posts} posts</span>
                </div>
                <Button asChild className="w-full">
                  <Link href={`/${resolvedParams.slug}`}>
                    View All Posts
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Subscribe */}
            <Card>
              <CardHeader>
                <CardTitle>Subscribe</CardTitle>
                <CardDescription>
                  Get notified when new posts are published
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full">
                    Subscribe to Newsletter
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Join {post.publication._count.subscriptions} other subscribers
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>
              © {new Date().getFullYear()} {post.publication.name}. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
