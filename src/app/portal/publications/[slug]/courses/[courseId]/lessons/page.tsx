"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  BookOpen,
  Clock,
  Send,
  Eye,
  Play,
  Pause
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
  _count: {
    emailLogs: number
  }
}

interface LessonsPageProps {
  params: Promise<{
    slug: string
    courseId: string
  }>
}

export default function LessonsPage({ params }: LessonsPageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLessons()
  }, [])

  const fetchLessons = async () => {
    try {
      const response = await fetch(`/api/publications/${resolvedParams.slug}/courses/${resolvedParams.courseId}/lessons`)
      if (response.ok) {
        const data = await response.json()
        setLessons(data)
      } else {
        toast.error("Failed to fetch lessons")
      }
    } catch (error) {
      console.error("Error fetching lessons:", error)
      toast.error("Failed to fetch lessons")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (lessonId: string) => {
    if (!confirm("Are you sure you want to delete this lesson? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/publications/${resolvedParams.slug}/courses/${resolvedParams.courseId}/lessons/${lessonId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Lesson deleted successfully")
        fetchLessons()
      } else {
        toast.error("Failed to delete lesson")
      }
    } catch (error) {
      console.error("Error deleting lesson:", error)
      toast.error("Failed to delete lesson")
    }
  }

  const togglePublish = async (lessonId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/publications/${resolvedParams.slug}/courses/${resolvedParams.courseId}/lessons/${lessonId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isPublished: !currentStatus
        }),
      })

      if (response.ok) {
        toast.success(`Lesson ${!currentStatus ? "published" : "unpublished"} successfully`)
        fetchLessons()
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
          <p className="text-muted-foreground">Loading lessons...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href={`/portal/publications/${resolvedParams.slug}/courses/${resolvedParams.courseId}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course
          </Link>
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Course Lessons</h1>
            <p className="text-muted-foreground">Manage the lessons for this course</p>
          </div>
          <Button asChild>
            <Link href={`/portal/publications/${resolvedParams.slug}/courses/${resolvedParams.courseId}/lessons/create`}>
              <Plus className="w-4 h-4 mr-2" />
              Add Lesson
            </Link>
          </Button>
        </div>
      </div>

      {/* Lessons List */}
      {lessons.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No lessons yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start building your course by adding lessons
            </p>
            <Button asChild>
              <Link href={`/portal/publications/${resolvedParams.slug}/courses/${resolvedParams.courseId}/lessons/create`}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Lesson
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {lessons.map((lesson, index) => (
            <Card key={lesson.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
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

                    <h3 className="text-lg font-semibold mb-2">{lesson.title}</h3>

                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {lesson.content.substring(0, 150)}...
                    </p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Send className="w-4 h-4" />
                        {lesson._count.emailLogs} sent
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {lesson.scheduledFor
                          ? `Scheduled for ${new Date(lesson.scheduledFor).toLocaleDateString()}`
                          : "No schedule"
                        }
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/portal/publications/${resolvedParams.slug}/courses/${resolvedParams.courseId}/lessons/${lesson.id}`}>
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/portal/publications/${resolvedParams.slug}/courses/${resolvedParams.courseId}/lessons/${lesson.id}/edit`}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => togglePublish(lesson.id, lesson.isPublished)}
                    >
                      {lesson.isPublished ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Unpublish
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Publish
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(lesson.id)}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
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
