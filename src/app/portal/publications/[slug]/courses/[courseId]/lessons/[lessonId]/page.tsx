"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  Edit,
  Trash2,
  Save,
  Send,
  Clock,
  Eye,
  Users,
  Mail
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface Lesson {
  id: string
  title: string
  content: string
  order: number
  isPublished: boolean
  scheduledFor?: string | null
  sentAt?: string | null
  createdAt: string
  updatedAt: string
  course: {
    id: string
    title: string
  }
  _count: {
    emailLogs: number
  }
}

interface LessonViewPageProps {
  params: Promise<{
    slug: string
    courseId: string
    lessonId: string
  }>
}

export default function LessonViewPage({ params }: LessonViewPageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    scheduledFor: ""
  })

  useEffect(() => {
    fetchLesson()
  }, [])

  const fetchLesson = async () => {
    try {
      const response = await fetch(`/api/publications/${resolvedParams.slug}/courses/${resolvedParams.courseId}/lessons/${resolvedParams.lessonId}`)
      if (response.ok) {
        const data = await response.json()
        setLesson(data)
        setFormData({
          title: data.title,
          content: data.content,
          scheduledFor: data.scheduledFor ? new Date(data.scheduledFor).toISOString().slice(0, 16) : ""
        })
      } else {
        toast.error("Failed to fetch lesson")
        router.push(`/portal/publications/${resolvedParams.slug}/courses/${resolvedParams.courseId}/lessons`)
      }
    } catch (error) {
      console.error("Error fetching lesson:", error)
      toast.error("Failed to fetch lesson")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Title and content are required")
      return
    }

    setSaving(true)

    try {
      const response = await fetch(`/api/publications/${resolvedParams.slug}/courses/${resolvedParams.courseId}/lessons/${resolvedParams.lessonId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          scheduledFor: formData.scheduledFor ? new Date(formData.scheduledFor).toISOString() : null
        }),
      })

      if (response.ok) {
        toast.success("Lesson updated successfully")
        setEditing(false)
        fetchLesson()
      } else {
        toast.error("Failed to update lesson")
      }
    } catch (error) {
      console.error("Error updating lesson:", error)
      toast.error("Failed to update lesson")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this lesson? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/publications/${resolvedParams.slug}/courses/${resolvedParams.courseId}/lessons/${resolvedParams.lessonId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Lesson deleted successfully")
        router.push(`/portal/publications/${resolvedParams.slug}/courses/${resolvedParams.courseId}/lessons`)
      } else {
        toast.error("Failed to delete lesson")
      }
    } catch (error) {
      console.error("Error deleting lesson:", error)
      toast.error("Failed to delete lesson")
    }
  }

  const togglePublish = async () => {
    try {
      const response = await fetch(`/api/publications/${resolvedParams.slug}/courses/${resolvedParams.courseId}/lessons/${resolvedParams.lessonId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isPublished: !lesson?.isPublished
        }),
      })

      if (response.ok) {
        toast.success(`Lesson ${lesson?.isPublished ? "unpublished" : "published"} successfully`)
        fetchLesson()
      } else {
        toast.error("Failed to update lesson")
      }
    } catch (error) {
      console.error("Error updating lesson:", error)
      toast.error("Failed to update lesson")
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading lesson...</p>
        </div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">Lesson not found</h3>
            <p className="text-muted-foreground mb-4">
              The lesson you're looking for doesn't exist.
            </p>
            <Button asChild>
              <Link href={`/portal/publications/${resolvedParams.slug}/courses/${resolvedParams.courseId}/lessons`}>
                Back to Lessons
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href={`/portal/publications/${resolvedParams.slug}/courses/${resolvedParams.courseId}/lessons`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Lessons
          </Link>
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="outline">Lesson {lesson.order}</Badge>
              {lesson.isPublished ? (
                <Badge className="bg-green-500/10 text-green-700 dark:text-green-400">
                  Published
                </Badge>
              ) : (
                <Badge variant="secondary">Draft</Badge>
              )}
              {lesson.sentAt && (
                <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400">
                  Sent
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold">{lesson.title}</h1>
            <p className="text-muted-foreground">Course: {lesson.course.title}</p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditing(!editing)}>
              <Edit className="w-4 h-4 mr-2" />
              {editing ? "Cancel Edit" : "Edit"}
            </Button>
            <Button variant="outline" size="sm" onClick={togglePublish}>
              {lesson.isPublished ? (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Unpublish
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Publish
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{lesson._count.emailLogs}</p>
                <p className="text-sm text-muted-foreground">Emails Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-lg font-semibold">
                  {lesson.scheduledFor
                    ? new Date(lesson.scheduledFor).toLocaleDateString()
                    : "No schedule"
                  }
                </p>
                <p className="text-sm text-muted-foreground">Scheduled For</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-lg font-semibold">
                  {lesson.sentAt ? "Sent" : "Not sent"}
                </p>
                <p className="text-sm text-muted-foreground">Status</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content */}
      {editing ? (
        <Card>
          <CardHeader>
            <CardTitle>Edit Lesson</CardTitle>
            <CardDescription>
              Make changes to your lesson content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Lesson Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-content">Lesson Content</Label>
              <Textarea
                id="edit-content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                disabled={saving}
                rows={12}
                className="min-h-[300px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-scheduled">Schedule Delivery</Label>
              <Input
                id="edit-scheduled"
                type="datetime-local"
                value={formData.scheduledFor}
                onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
                disabled={saving}
              />
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Lesson Content</CardTitle>
            <CardDescription>
              This content will be sent as an email to students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-muted-foreground">
                {lesson.content}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
