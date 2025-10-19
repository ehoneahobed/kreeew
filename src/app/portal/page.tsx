import { auth } from "@/lib/auth/auth"
import { getUserPublications } from "@/lib/publications"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CreatePublicationDialog } from "@/components/dashboard/create-publication-dialog"
import { 
  FileText, 
  Users, 
  TrendingUp, 
  Plus, 
  Eye,
  MessageSquare,
  Bookmark,
  Calendar
} from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

// Type for publication with counts
type PublicationWithCounts = {
  id: string
  name: string
  slug: string
  description: string | null
  createdAt: Date
  _count: {
    posts: number
    subscriptions: number
    subscriberContacts: number
    activeSubscriptions: number
    activeSubscriberContacts: number
  }
}

export default async function PortalPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  const publications = await getUserPublications(session.user.id)

  // Calculate totals across all publications
  const totalStats = publications.reduce(
    (acc: { posts: number; subscribers: number; paidSubscribers: number; contacts: number }, pub: PublicationWithCounts) => ({
      posts: acc.posts + pub._count.posts,
      subscribers: acc.subscribers + pub._count.activeSubscriberContacts,
      paidSubscribers: acc.paidSubscribers + pub._count.activeSubscriptions,
      contacts: acc.contacts + pub._count.subscriberContacts,
    }),
    { posts: 0, subscribers: 0, paidSubscribers: 0, contacts: 0 }
  )

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session.user.name || session.user.email}
          </p>
        </div>
        <CreatePublicationDialog />
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.posts}</div>
            <p className="text-xs text-muted-foreground">
              Across {publications.length} publications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.subscribers}</div>
            <p className="text-xs text-muted-foreground">
              Active email subscribers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.paidSubscribers}</div>
            <p className="text-xs text-muted-foreground">
              Active paid subscriptions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Publications */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Your Publications</h2>
          <CreatePublicationDialog>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              New Publication
            </Button>
          </CreatePublicationDialog>
        </div>

        {publications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No publications yet</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Create your first publication to start sharing your content with the world.
                Build your audience and monetize your knowledge.
              </p>
              <CreatePublicationDialog>
                <Button size="lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Publication
                </Button>
              </CreatePublicationDialog>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {publications.slice(0, 6).map((publication) => (
              <Card key={publication.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{publication.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {publication.description || "No description"}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {publication.slug}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-semibold">{publication._count.posts}</div>
                        <div className="text-muted-foreground">Posts</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{publication._count.activeSubscriberContacts}</div>
                        <div className="text-muted-foreground">Subscribers</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{publication._count.subscriberContacts}</div>
                        <div className="text-muted-foreground">Contacts</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3 mr-1" />
                      Created {new Date(publication.createdAt).toLocaleDateString()}
                    </div>

                    <div className="flex gap-2">
                      <Button asChild size="sm" className="flex-1">
                        <Link href={`/portal/publications/${publication.slug}`}>
                          Manage
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/${publication.slug}`} target="_blank">
                          <Eye className="w-3 h-3" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {publications.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Write New Post</h3>
                    <p className="text-sm text-muted-foreground">Create content</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Email Campaign</h3>
                    <p className="text-sm text-muted-foreground">Send newsletter</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">View Analytics</h3>
                    <p className="text-sm text-muted-foreground">Track performance</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Growth Tools</h3>
                    <p className="text-sm text-muted-foreground">Expand audience</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}