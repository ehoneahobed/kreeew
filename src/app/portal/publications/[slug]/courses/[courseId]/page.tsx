"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowLeft,
  Edit,
  Trash2,
  Users,
  BookOpen,
  Plus,
  DollarSign,
  Calendar,
  ExternalLink,
  Eye
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

function LessonsList({
  courseId,
  publicationSlug,
  lessons,
  onLessonsChange,
  onRefresh
}: {
  courseId: string;
  publicationSlug: string;
  lessons: any[];
  onLessonsChange: (lessons: any[]) => void;
  onRefresh: () => void;
}) {
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (lessons.length === 0) {
      onRefresh()
    }
  }, [courseId, publicationSlug])

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Loading lessons...</p>
      </div>
    )
  }

  if (lessons.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No lessons yet</h3>
        <p className="text-muted-foreground mb-4">
          Start building your course by adding lessons
        </p>
        <Button asChild>
          <Link href={`/portal/publications/${publicationSlug}/courses/${courseId}/lessons/create`}>
            <Plus className="w-4 h-4 mr-2" />
            Create First Lesson
          </Link>
        </Button>
      </div>
    )
  }

  const handleLessonChange = () => {
    fetchLessons()
  }

  return (
    <div className="space-y-3">
      {lessons.slice(0, 3).map((lesson) => (
        <div key={lesson.id} className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs">
                Lesson {lesson.order}
              </Badge>
              {lesson.isPublished ? (
                <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 text-xs">
                  Published
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">Draft</Badge>
              )}
            </div>
            <h4 className="font-medium text-sm">{lesson.title}</h4>
            <p className="text-xs text-muted-foreground mt-1">
              {lesson.content.substring(0, 100)}...
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/portal/publications/${publicationSlug}/courses/${courseId}/lessons/${lesson.id}`}>
                <Eye className="w-3 h-3 mr-1" />
                View
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/portal/publications/${publicationSlug}/courses/${courseId}/lessons/${lesson.id}/edit`}>
                <Edit className="w-3 h-3 mr-1" />
                Edit
              </Link>
            </Button>
          </div>
        </div>
      ))}

      {lessons.length > 3 && (
        <div className="text-center pt-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/portal/publications/${publicationSlug}/courses/${courseId}/lessons`}>
              View All {lessons.length} Lessons
            </Link>
          </Button>
        </div>
      )}

      {lessons.length === 0 && !loading && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No lessons yet</h3>
          <p className="text-muted-foreground mb-4">
            Start building your course by adding lessons
          </p>
          <Button asChild>
            <Link href={`/portal/publications/${publicationSlug}/courses/${courseId}/lessons/create`}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Lesson
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}

interface Course {
  id: string
  title: string
  description?: string
  price: number
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
  createdAt: string
  updatedAt: string
  publication: {
    id: string
    name: string
    slug: string
  }
  _count: {
    lessons: number
    enrollments: number
  }
}

interface CourseViewPageProps {
  params: Promise<{
    slug: string
    courseId: string
  }>
}

export default function CourseViewPage({ params }: CourseViewPageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourse()
  }, [])

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/publications/${resolvedParams.slug}/courses/${resolvedParams.courseId}`)
      if (response.ok) {
        const data = await response.json()
        setCourse(data)
      } else {
        toast.error("Failed to fetch course")
        router.push(`/portal/publications/${resolvedParams.slug}`)
      }
    } catch (error) {
      console.error("Error fetching course:", error)
      toast.error("Failed to fetch course")
    } finally {
      setLoading(false)
    }
  }

  const refreshLessons = () => {
    fetchLessons()
  }

  const fetchLessons = async () => {
    try {
      const response = await fetch(`/api/publications/${resolvedParams.slug}/courses/${resolvedParams.courseId}/lessons`)
      if (response.ok) {
        const data = await response.json()
        setLessons(data || [])
      } else {
        console.error("Failed to fetch lessons")
        setLessons([])
      }
    } catch (error) {
      console.error("Error fetching lessons:", error)
      setLessons([])
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/publications/${resolvedParams.slug}/courses/${resolvedParams.courseId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Course deleted successfully")
        router.push(`/portal/publications/${resolvedParams.slug}`)
      } else {
        toast.error("Failed to delete course")
      }
    } catch (error) {
      console.error("Error deleting course:", error)
      toast.error("Failed to delete course")
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading course...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">Course not found</h3>
            <p className="text-muted-foreground mb-4">
              The course you're looking for doesn't exist.
            </p>
            <Button asChild>
              <Link href={`/portal/publications/${resolvedParams.slug}`}>
                Back to Publication
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusColors = {
    DRAFT: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    PUBLISHED: "bg-green-500/10 text-green-700 dark:text-green-400",
    ARCHIVED: "bg-gray-500/10 text-gray-700 dark:text-gray-400"
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href={`/portal/publications/${resolvedParams.slug}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Publication
          </Link>
        </Button>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{course.title}</h1>
              <Badge className={statusColors[course.status || "DRAFT"]}>
                {course.status || "DRAFT"}
              </Badge>
            </div>
            <p className="text-muted-foreground">{course.publication.name}</p>
          </div>
          
          <div className="flex items-center gap-2">
            {(course.status || "DRAFT") === "PUBLISHED" && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/${resolvedParams.slug}/courses/${course.id}`} target="_blank">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Public Page
                </Link>
              </Button>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link href={`/portal/publications/${resolvedParams.slug}/courses/${course.id}/edit`}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{lessons.length}</p>
                <p className="text-sm text-muted-foreground">Lessons</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{course._count.enrollments}</p>
                <p className="text-sm text-muted-foreground">Enrollments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">${course.price.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Price</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {new Date(course.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
                <p className="text-sm text-muted-foreground">Created</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Course Description</CardTitle>
        </CardHeader>
        <CardContent>
          {course.description ? (
            <p className="text-muted-foreground whitespace-pre-wrap">{course.description}</p>
          ) : (
            <p className="text-muted-foreground italic">No description provided</p>
          )}
        </CardContent>
      </Card>

      {/* Lessons */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Course Lessons</CardTitle>
              <CardDescription>
                Manage the lessons and content for this course
              </CardDescription>
            </div>
            <Button size="sm" asChild>
              <Link href={`/portal/publications/${resolvedParams.slug}/courses/${resolvedParams.courseId}/lessons/create`}>
                <Plus className="w-4 h-4 mr-2" />
                Add Lesson
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <LessonsList
            courseId={course.id}
            publicationSlug={resolvedParams.slug}
            lessons={lessons}
            onLessonsChange={setLessons}
            onRefresh={refreshLessons}
          />
        </CardContent>
      </Card>
    </div>
  )
}
