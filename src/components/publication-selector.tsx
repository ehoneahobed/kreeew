"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, BookOpen, Mail, Users, Calendar } from "lucide-react"
import { toast } from "sonner"

interface Publication {
  id: string
  name: string
  slug: string
  description?: string
  _count: {
    posts: number
    subscriptions: number
  }
}

interface PublicationSelectorProps {
  type: "campaign" | "course" | "automation"
  trigger: React.ReactNode
}

export function PublicationSelector({ type, trigger }: PublicationSelectorProps) {
  const router = useRouter()
  const [publications, setPublications] = useState<Publication[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (open) {
      fetchPublications()
    }
  }, [open])

  const fetchPublications = async () => {
    try {
      const response = await fetch("/api/publications")
      if (response.ok) {
        const data = await response.json()
        setPublications(data.publications || [])
      } else {
        toast.error("Failed to fetch publications")
      }
    } catch (error) {
      console.error("Error fetching publications:", error)
      toast.error("Failed to fetch publications")
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = (publication: Publication) => {
    setOpen(false)
    
    const routes = {
      campaign: `/portal/publications/${publication.slug}/campaigns/create`,
      course: `/portal/publications/${publication.slug}/courses/create`,
      automation: `/portal/publications/${publication.slug}/automation/create`
    }
    
    router.push(routes[type])
  }

  const getTypeInfo = () => {
    switch (type) {
      case "campaign":
        return {
          title: "Create Email Campaign",
          description: "Choose a publication to create an email campaign for",
          icon: Mail,
          createText: "Create Campaign"
        }
      case "course":
        return {
          title: "Create Course",
          description: "Choose a publication to create a course for",
          icon: BookOpen,
          createText: "Create Course"
        }
      case "automation":
        return {
          title: "Create Automation",
          description: "Choose a publication to create an automation workflow for",
          icon: Calendar,
          createText: "Create Automation"
        }
    }
  }

  const typeInfo = getTypeInfo()
  const Icon = typeInfo.icon

  // Handle the case when we have loaded publications and there's only one
  useEffect(() => {
    if (!loading && publications.length === 1 && open) {
      // Auto-navigate to creation for single publication
      handleCreate(publications[0])
    }
  }, [loading, publications, open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="w-5 h-5" />
            {typeInfo.title}
          </DialogTitle>
          <DialogDescription>
            {typeInfo.description}
          </DialogDescription>
        </DialogHeader>
        <CardContent className="pt-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading publications...</p>
            </div>
          ) : publications.length === 0 ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No Publications Found</h3>
              <p className="text-muted-foreground mb-4">
                Create your first publication to start building {type}s.
              </p>
              <Button onClick={() => {
                setOpen(false)
                router.push("/portal/publications")
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Create Publication
              </Button>
            </div>
          ) : publications.length === 1 ? (
            <div className="text-center py-6">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Redirecting...</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {publications.map((publication) => (
                <Card key={publication.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium">{publication.name}</h3>
                        {publication.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {publication.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <BookOpen className="w-4 h-4" />
                            {publication._count.posts} posts
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Users className="w-4 h-4" />
                            {publication._count.subscriptions} subscribers
                          </div>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleCreate(publication)}
                      >
                        {typeInfo.createText}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </DialogContent>
    </Dialog>
  )
}
