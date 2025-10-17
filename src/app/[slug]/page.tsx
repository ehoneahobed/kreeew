import { getPublicationBySlug } from "@/lib/publications"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SubscriptionForm } from "@/components/subscription-form"
import { 
  Calendar,
  User,
  Mail,
  ExternalLink,
  BookOpen,
  Users,
  Home,
  ChevronRight
} from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface PublicPublicationPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function PublicPublicationPage({ params }: PublicPublicationPageProps) {
  const resolvedParams = await params
  const publication = await getPublicationBySlug(resolvedParams.slug)
  
  if (!publication) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Navigation Bar */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/" 
                className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
              >
                <Home className="w-4 h-4" />
                Kreeew
              </Link>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">{publication.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild size="sm">
                <Link href={`/portal/publications/${publication.slug}`}>
                  Manage Publication
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold">{publication.name}</h1>
                {publication.description && (
                  <p className="text-muted-foreground mt-2 text-lg">{publication.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">{publication.slug}</Badge>
              {publication.domain && (
                <Badge variant="secondary" className="text-sm">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  {publication.domain}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {publication.posts && publication.posts.length > 0 ? (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Latest Posts</h2>
                {publication.posts.map((post) => (
                  <Link key={post.id} href={`/${publication.slug}/${post.slug}`}>
                    <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg group-hover:text-primary transition-colors">
                              {post.title}
                            </CardTitle>
                            {post.excerpt && (
                              <CardDescription className="line-clamp-2">
                                {post.excerpt}
                              </CardDescription>
                            )}
                          </div>
                          <Badge variant={post.isPaid ? "default" : "secondary"}>
                            {post.isPaid ? "Premium" : "Free"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {post.publishedAt 
                              ? formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })
                              : "Draft"
                            }
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {publication.user.name || "Anonymous"}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
                <p className="text-muted-foreground">
                  This publication hasn't published any content yet. Check back later!
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  About {publication.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>By {publication.user.name || "Anonymous"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Created {formatDistanceToNow(new Date(publication.createdAt), { addSuffix: true })}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                  <span>{publication._count.posts} posts</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{publication._count.subscriptions} subscribers</span>
                </div>
              </CardContent>
            </Card>

            {/* Subscribe */}
            <SubscriptionForm 
              publicationSlug={resolvedParams.slug}
              publicationName={publication.name}
            />

            {/* Subscription Tiers */}
            {publication.subscriptionTiers && publication.subscriptionTiers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Plans</CardTitle>
                  <CardDescription>
                    Choose a plan that works for you
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {publication.subscriptionTiers.map((tier) => (
                    <div key={tier.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{tier.name}</h4>
                        <span className="text-lg font-bold">
                          ${(tier.price / 100).toFixed(2)}
                        </span>
                      </div>
                      {tier.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {tier.description}
                        </p>
                      )}
                      <Button size="sm" className="w-full">
                        Subscribe to Publication
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>
              © {new Date().getFullYear()} {publication.name}. All rights reserved.
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
