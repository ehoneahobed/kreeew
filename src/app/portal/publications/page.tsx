import { auth } from "@/lib/auth/auth"
import { getUserPublications } from "@/lib/publications"
import { CreatePublicationDialog } from "@/components/dashboard/create-publication-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Users, FileText, Calendar, ExternalLink } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function PublicationsPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  const publications = await getUserPublications(session.user.id)

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Your Publications</h1>
          <p className="text-muted-foreground">
            Manage your publications and content
          </p>
        </div>
        <CreatePublicationDialog />
      </div>

      {publications.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <FileText className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No publications yet</h3>
          <p className="text-muted-foreground mb-6">
            Create your first publication to start sharing your content with the world.
          </p>
          <CreatePublicationDialog>
            <Button size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Publication
            </Button>
          </CreatePublicationDialog>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {publications.map((publication) => (
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
                      <div className="font-semibold">{publication._count.subscriptions}</div>
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
                      <Link 
                        href={`/${publication.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-3 h-3" />
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
  )
}
