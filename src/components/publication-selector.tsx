"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  const [showAutomationModal, setShowAutomationModal] = useState(false)
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null)
  const [workflowName, setWorkflowName] = useState("")
  const [workflowDescription, setWorkflowDescription] = useState("")
  const [workflowTrigger, setWorkflowTrigger] = useState("SUBSCRIBE")
  const [workflowTriggerConfig, setWorkflowTriggerConfig] = useState<{
    targetId?: string
    targetName?: string
    selectedId?: string
  }>({})
  const [courses, setCourses] = useState<Array<{ id: string; title: string }>>([])
  const [posts, setPosts] = useState<Array<{ id: string; title: string; slug: string }>>([])
  const [loadingResources, setLoadingResources] = useState(false)

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

  const loadCoursesAndPosts = async (publicationSlug: string) => {
    setLoadingResources(true)
    try {
      const [coursesRes, postsRes] = await Promise.all([
        fetch(`/api/publications/${publicationSlug}/courses`),
        fetch(`/api/publications/${publicationSlug}/posts`)
      ])

      if (coursesRes.ok) {
        const coursesData = await coursesRes.json()
        setCourses(coursesData.courses || [])
      }

      if (postsRes.ok) {
        const postsData = await postsRes.json()
        setPosts(postsData.posts || [])
      }
    } catch (error) {
      console.error("Error loading courses and posts:", error)
    } finally {
      setLoadingResources(false)
    }
  }

  const handleCreate = async (publication: Publication) => {
    setOpen(false)

    if (type === "automation") {
      // Show automation configuration modal
      setSelectedPublication(publication)
      setWorkflowName("")
      setWorkflowDescription("")
      setWorkflowTrigger("SUBSCRIBE")
      setWorkflowTriggerConfig({})
      setShowAutomationModal(true)
      // Load courses and posts for the selected publication
      loadCoursesAndPosts(publication.slug)
      return
    }

    const routes = {
      campaign: `/portal/publications/${publication.slug}/campaigns/create`,
      course: `/portal/publications/${publication.slug}/courses/create`,
    }

    router.push(routes[type as keyof typeof routes])
  }

  const handleCreateAutomation = async () => {
    if (!selectedPublication || !workflowName.trim()) {
      toast.error("Please enter a workflow name")
      return
    }

    try {
      const response = await fetch(`/api/publications/${selectedPublication.slug}/automation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: workflowName.trim(),
          description: workflowDescription.trim() || undefined,
          trigger: workflowTrigger,
          triggerConfig: {
            targetId: workflowTriggerConfig.targetId || "publication",
            selectedId: workflowTriggerConfig.selectedId,
            targetName: workflowTriggerConfig.targetName,
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create automation")
      }

      const data = await response.json()
      setShowAutomationModal(false)
      router.push(`/portal/automation/builder/${data.workflow.id}?publication=${selectedPublication.slug}`)
    } catch (error) {
      console.error("Error creating automation:", error)
      toast.error("Failed to create automation workflow")
    }
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

      {/* Automation Configuration Modal */}
      <Dialog open={showAutomationModal} onOpenChange={setShowAutomationModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Automation Workflow</DialogTitle>
            <DialogDescription>
              Configure your new automation workflow for {selectedPublication?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="workflow-name">Workflow Name</Label>
              <Input
                id="workflow-name"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                placeholder="Enter workflow name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="workflow-description">Description (Optional)</Label>
              <Textarea
                id="workflow-description"
                value={workflowDescription}
                onChange={(e) => setWorkflowDescription(e.target.value)}
                placeholder="Describe what this workflow does"
                rows={3}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="workflow-trigger">Trigger Type</Label>
              <select
                id="workflow-trigger"
                value={workflowTrigger}
                onChange={(e) => {
                  setWorkflowTrigger(e.target.value)
                  // Reset trigger config when trigger type changes
                  setWorkflowTriggerConfig({})
                }}
                className="mt-1 w-full p-2 border rounded-md"
              >
                <option value="SUBSCRIBE">New Subscriber</option>
                <option value="UNSUBSCRIBE">Unsubscribe</option>
                <option value="POST_PUBLISHED">Post Published</option>
                <option value="COURSE_ENROLLED">Course Enrolled</option>
                <option value="TAG_ADDED">Tag Added</option>
                <option value="TAG_REMOVED">Tag Removed</option>
                <option value="TIER_CHANGED">Tier Changed</option>
                <option value="CUSTOM_DATE">Custom Date</option>
                <option value="FORM_SUBMITTED">Form Submitted</option>
                <option value="POST_VIEWED">Post Viewed</option>
              </select>
            </div>

            {/* Trigger Configuration */}
            {workflowTrigger === "SUBSCRIBE" && (
              <div className="space-y-3">
                <div>
                  <Label className="text-sm">Subscription Source</Label>
                  <select
                    value={workflowTriggerConfig.targetId || "publication"}
                    onChange={(e) => {
                      const sourceName = e.target.value === "publication" ? "Publication" : 
                                       e.target.value === "course" ? "Course" : 
                                       e.target.value === "post" ? "Post" : "Publication"
                      setWorkflowTriggerConfig({
                        targetId: e.target.value,
                        targetName: sourceName
                      })
                    }}
                    className="mt-1 w-full p-2 border rounded-md"
                  >
                    <option value="publication">Publication (General)</option>
                    <option value="course">Specific Course</option>
                    <option value="post">Specific Post</option>
                  </select>
                </div>
                
                {workflowTriggerConfig.targetId === "course" && (
                  <div>
                    <Label className="text-sm">Course</Label>
                    <select
                      value={workflowTriggerConfig.selectedId || ""}
                      onChange={(e) => {
                        const course = courses.find(c => c.id === e.target.value)
                        setWorkflowTriggerConfig({
                          ...workflowTriggerConfig,
                          targetId: "course",
                          selectedId: e.target.value,
                          targetName: course?.title
                        })
                      }}
                      className="mt-1 w-full p-2 border rounded-md"
                      disabled={loadingResources}
                    >
                      <option value="">Select a course</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {workflowTriggerConfig.targetId === "post" && (
                  <div>
                    <Label className="text-sm">Post</Label>
                    <select
                      value={workflowTriggerConfig.selectedId || ""}
                      onChange={(e) => {
                        const post = posts.find(p => p.id === e.target.value)
                        setWorkflowTriggerConfig({
                          ...workflowTriggerConfig,
                          targetId: "post",
                          selectedId: e.target.value,
                          targetName: post?.title
                        })
                      }}
                      className="mt-1 w-full p-2 border rounded-md"
                      disabled={loadingResources}
                    >
                      <option value="">Select a post</option>
                      {posts.map((post) => (
                        <option key={post.id} value={post.id}>
                          {post.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {workflowTrigger === "UNSUBSCRIBE" && (
              <div className="space-y-3">
                <div>
                  <Label className="text-sm">Unsubscribe Source</Label>
                  <select
                    value={workflowTriggerConfig.targetId || "publication"}
                    onChange={(e) => {
                      const sourceName = e.target.value === "publication" ? "Publication" : 
                                       e.target.value === "course" ? "Course" : 
                                       e.target.value === "post" ? "Post" : "Publication"
                      setWorkflowTriggerConfig({
                        targetId: e.target.value,
                        targetName: sourceName
                      })
                    }}
                    className="mt-1 w-full p-2 border rounded-md"
                  >
                    <option value="publication">Publication (General)</option>
                    <option value="course">Specific Course</option>
                    <option value="post">Specific Post</option>
                  </select>
                </div>
              </div>
            )}

            {workflowTrigger === "COURSE_ENROLLED" && (
              <div>
                <Label className="text-sm">Course</Label>
                <select
                  value={workflowTriggerConfig.targetId || ""}
                  onChange={(e) => {
                    const course = courses.find(c => c.id === e.target.value)
                    setWorkflowTriggerConfig({
                      ...workflowTriggerConfig,
                      targetId: e.target.value,
                      targetName: course?.title
                    })
                  }}
                  className="mt-1 w-full p-2 border rounded-md"
                  disabled={loadingResources}
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(workflowTrigger === "POST_PUBLISHED" || workflowTrigger === "POST_VIEWED") && (
              <div>
                <Label className="text-sm">Post</Label>
                <select
                  value={workflowTriggerConfig.targetId || ""}
                  onChange={(e) => {
                    const post = posts.find(p => p.id === e.target.value)
                    setWorkflowTriggerConfig({
                      ...workflowTriggerConfig,
                      targetId: e.target.value,
                      targetName: post?.title
                    })
                  }}
                  className="mt-1 w-full p-2 border rounded-md"
                  disabled={loadingResources}
                >
                  <option value="">Select a post</option>
                  {posts.map((post) => (
                    <option key={post.id} value={post.id}>
                      {post.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {loadingResources && (
              <div className="text-sm text-muted-foreground">
                Loading courses and posts...
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAutomationModal(false)}
                type="button"
              >
                Cancel
              </Button>
              <Button onClick={handleCreateAutomation} type="button">
                Create Workflow
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}
