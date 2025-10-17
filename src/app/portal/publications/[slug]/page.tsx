import { auth } from "@/lib/auth/auth"
import { getPublicationByIdForDashboard } from "@/lib/publications"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  FileText, 
  Users, 
  BarChart3, 
  Settings, 
  Plus,
  Calendar,
  ExternalLink,
  Mail,
  BookOpen,
  Zap,
  Edit,
  Eye
} from "lucide-react"
import Link from "next/link"

interface PublicationPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function PublicationPage({ params }: PublicationPageProps) {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  const resolvedParams = await params

  // Get publication with all posts (including drafts) for dashboard
  const publication = await getPublicationByIdForDashboard(resolvedParams.slug, session.user.id)
  
  if (!publication) {
    notFound()
  }

  // Check if user owns this publication
  if (publication.userId !== session.user.id) {
    redirect("/portal/publications")
  }

  const stats = [
    {
      title: "Posts",
      value: publication._count.posts,
      icon: FileText,
      description: "Total posts"
    },
    {
      title: "Subscribers",
      value: publication._count.subscriptions,
      icon: Users,
      description: "Active subscribers"
    },
    {
      title: "Contacts",
      value: publication._count.subscriberContacts,
      icon: Mail,
      description: "Email contacts"
    },
    {
      title: "Courses",
      value: publication._count.courses || 0,
      icon: BookOpen,
      description: "Published courses"
    }
  ]

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{publication.name}</h1>
          <p className="text-muted-foreground">
            {publication.description || "No description provided"}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{publication.slug}</Badge>
            {publication.domain && (
              <Badge variant="secondary">
                <ExternalLink className="w-3 h-3 mr-1" />
                {publication.domain}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/${publication.slug}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              View Public Site
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/portal/publications/${publication.slug}/posts/create`}>
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Recent Posts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Recent Posts
                </CardTitle>
                <CardDescription>
                  Your latest published content
                </CardDescription>
              </CardHeader>
              <CardContent>
                {publication.posts && publication.posts.length > 0 ? (
                  <div className="space-y-3">
                    {publication.posts.slice(0, 5).map((post) => (
                      <div key={post.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{post.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {post.publishedAt 
                              ? new Date(post.publishedAt).toLocaleDateString()
                              : "Draft"
                            }
                          </p>
                        </div>
                        <Badge variant={post.status === "PUBLISHED" ? "default" : "secondary"}>
                          {post.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No posts yet</p>
                    <Button asChild className="mt-2" size="sm">
                      <Link href={`/portal/publications/${publication.slug}/posts/create`}>
                        Create your first post
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Common tasks for your publication
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full justify-start">
                  <Link href={`/portal/publications/${publication.slug}/posts/create`}>
                    <Plus className="w-4 h-4 mr-2" />
                    Write New Post
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href={`/portal/publications/${publication.slug}/subscribers`}>
                    <Users className="w-4 h-4 mr-2" />
                    Manage Subscribers
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href={`/portal/publications/${publication.slug}/analytics`}>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Analytics
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href={`/portal/publications/${publication.slug}/settings`}>
                    <Settings className="w-4 h-4 mr-2" />
                    Publication Settings
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="posts">
          <Card>
            <CardHeader>
              <CardTitle>All Posts</CardTitle>
              <CardDescription>
                Manage your publication's content
              </CardDescription>
            </CardHeader>
            <CardContent>
              {publication.posts && publication.posts.length > 0 ? (
                <div className="space-y-4">
                  {publication.posts.map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{post.title}</h3>
                          <Badge variant={post.status === "PUBLISHED" ? "default" : "secondary"}>
                            {post.status}
                          </Badge>
                          {post.isPaid && (
                            <Badge variant="outline">Premium</Badge>
                          )}
                        </div>
                        {post.excerpt && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {post.excerpt}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Created {new Date(post.createdAt).toLocaleDateString()}</span>
                          {post.publishedAt && (
                            <span>Published {new Date(post.publishedAt).toLocaleDateString()}</span>
                          )}
                          <span>Updated {new Date(post.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/portal/publications/${publication.slug}/posts/${post.id}`}>
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/portal/publications/${publication.slug}/posts/${post.id}/edit`}>
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No posts yet</p>
                  <Button asChild className="mt-2">
                    <Link href={`/portal/publications/${publication.slug}/posts/create`}>
                      Create New Post
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscribers">
          <Card>
            <CardHeader>
              <CardTitle>Subscribers</CardTitle>
              <CardDescription>
                Manage your subscriber base
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Subscriber management coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <CardTitle>Email Campaigns</CardTitle>
              <CardDescription>
                Create and manage email campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground mb-4">Email campaigns coming soon</p>
                <Button asChild>
                  <Link href={`/portal/publications/${publication.slug}/campaigns`}>
                    <Mail className="w-4 h-4 mr-2" />
                    Manage Campaigns
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                Track your publication's performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Analytics dashboard coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Publication Settings</CardTitle>
              <CardDescription>
                Configure your publication
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground mb-4">Manage your publication settings</p>
                <Button asChild>
                  <Link href={`/portal/publications/${publication.slug}/settings`}>
                    <Settings className="w-4 h-4 mr-2" />
                    Open Settings
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
