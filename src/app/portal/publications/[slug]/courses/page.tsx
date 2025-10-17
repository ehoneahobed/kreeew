"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CourseCard } from "@/components/courses/course-card"
import { CourseDialog } from "@/components/courses/course-dialog"
import { 
  Plus, 
  ArrowLeft, 
  BookOpen,
  Users,
  DollarSign,
  TrendingUp
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface Course {
  id: string
  title: string
  description?: string
  price: number
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED"
  enrollmentCount: number
  createdAt: string
  updatedAt: string
  lessons: Array<{
    id: string
    title: string
    order: number
  }>
  _count: {
    enrollments: number
    lessons: number
  }
}

interface CoursesPageProps {
  params: Promise<{
    slug: string
  }>
}

export default function CoursesPage({ params }: CoursesPageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)

  useEffect(() => {
    fetchCourses()
  }, [resolvedParams.slug])

  const fetchCourses = async () => {
    try {
      const response = await fetch(`/api/publications/${resolvedParams.slug}/courses`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch courses")
      }

      const data = await response.json()
      setCourses(data.courses)
    } catch (error) {
      console.error("Error fetching courses:", error)
      toast.error("Failed to load courses")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCourse = () => {
    setEditingCourse(null)
    setDialogOpen(true)
  }

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course)
    setDialogOpen(true)
  }

  const handleSaveCourse = async (courseData: Omit<Course, 'id'>) => {
    setActionLoading("save")
    try {
      const url = editingCourse 
        ? `/api/publications/${resolvedParams.slug}/courses/${editingCourse.id}`
        : `/api/publications/${resolvedParams.slug}/courses`
      
      const method = editingCourse ? "PUT" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(courseData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save course")
      }

      const { course } = await response.json()
      
      if (editingCourse) {
        setCourses(prev => prev.map(c => c.id === editingCourse.id ? course : c))
        toast.success("Course updated successfully")
      } else {
        setCourses(prev => [...prev, course])
        toast.success("Course created successfully")
      }
      
      setDialogOpen(false)
      setEditingCourse(null)
    } catch (error) {
      console.error("Error saving course:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save course")
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      return
    }

    setActionLoading(courseId)
    try {
      const response = await fetch(`/api/publications/${resolvedParams.slug}/courses/${courseId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete course")
      }

      setCourses(prev => prev.filter(c => c.id !== courseId))
      toast.success("Course deleted successfully")
    } catch (error) {
      console.error("Error deleting course:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete course")
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleStatus = async (courseId: string, status: string) => {
    setActionLoading(courseId)
    try {
      const newStatus = status === "PUBLISHED" ? "DRAFT" : "PUBLISHED"
      
      const response = await fetch(`/api/publications/${resolvedParams.slug}/courses/${courseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update course")
      }

      const { course } = await response.json()
      setCourses(prev => prev.map(c => c.id === courseId ? course : c))
      toast.success(`Course ${newStatus.toLowerCase()} successfully`)
    } catch (error) {
      console.error("Error updating course:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update course")
    } finally {
      setActionLoading(null)
    }
  }

  const publishedCourses = courses.filter(course => (course.status || "DRAFT") === "PUBLISHED")
  const totalRevenue = publishedCourses.reduce((sum, course) => sum + course.price, 0)
  const totalEnrollments = courses.reduce((sum, course) => sum + course._count.enrollments, 0)

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading courses...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/portal/publications/${resolvedParams.slug}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Publication
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Email Courses</h1>
          <p className="text-muted-foreground">
            Create and manage email courses for your subscribers
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
            <p className="text-xs text-muted-foreground">
              {publishedCourses.length} published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEnrollments}</div>
            <p className="text-xs text-muted-foreground">
              Across all courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published Courses</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedCourses.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(totalRevenue / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per enrollment potential
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Courses List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Courses</h2>
          <Button onClick={handleCreateCourse}>
            <Plus className="w-4 h-4 mr-2" />
            Create Course
          </Button>
        </div>

        {courses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first email course to start teaching your subscribers.
              </p>
              <Button onClick={handleCreateCourse}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Course
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onEdit={handleEditCourse}
                onDelete={handleDeleteCourse}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        )}
      </div>

      {/* Course Dialog */}
      <CourseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        course={editingCourse}
        onSave={handleSaveCourse}
        loading={actionLoading === "save"}
      />
    </div>
  )
}

