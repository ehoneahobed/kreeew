"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PublicationSelector } from "@/components/publication-selector"
import {
  BookOpen,
  Plus,
  Users,
  DollarSign,
  Calendar,
  Play,
  Edit,
  Trash2,
  TrendingUp,
  Eye
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface Course {
  id: string
  title: string
  description?: string
  price: number
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED"
  createdAt: string
  updatedAt: string
  publication: {
    id: string
    name: string
    slug: string
  }
  _count: {
    enrollments: number
    lessons: number
  }
}

export default function GlobalCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchAllCourses()
  }, [])

  const fetchAllCourses = async () => {
    try {
      const response = await fetch("/api/courses")
      
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

  const handleToggleStatus = async (courseId: string, publicationSlug: string, status: string) => {
    setActionLoading(courseId)
    try {
      const newStatus = status === "PUBLISHED" ? "DRAFT" : "PUBLISHED"
      
      const response = await fetch(`/api/publications/${publicationSlug}/courses/${courseId}`, {
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

  const handleDeleteCourse = async (courseId: string, publicationSlug: string) => {
    if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      return
    }

    setActionLoading(courseId)
    try {
      const response = await fetch(`/api/publications/${publicationSlug}/courses/${courseId}`, {
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

  const formatPrice = (price: number) => {
    if (price === 0) return "Free"
    return `$${(price / 100).toFixed(2)}`
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "PUBLISHED":
        return "default"
      case "DRAFT":
        return "secondary"
      case "ARCHIVED":
        return "outline"
      default:
        return "secondary"
    }
  }

  const publishedCourses = courses.filter(course => course.status === "PUBLISHED")
  const draftCourses = courses.filter(course => course.status === "DRAFT" || !course.status)
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold">All Courses</h1>
        <p className="text-muted-foreground">
          Manage email courses across all your publications
        </p>
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
          <h2 className="text-xl font-semibold">All Courses</h2>
          <PublicationSelector 
            type="course"
            trigger={
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Course
              </Button>
            }
          />
        </div>

        {courses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first email course to start teaching your subscribers.
              </p>
              <PublicationSelector 
                type="course"
                trigger={
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Course
                  </Button>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        {course.title}
                        {course.status && (
                          <Badge variant={getStatusColor(course.status)}>
                            {course.status}
                          </Badge>
                        )}
                      </CardTitle>
                      {course.description && (
                        <CardDescription className="mt-1 line-clamp-2">
                          {course.description}
                        </CardDescription>
                      )}
                      <Badge variant="outline" className="mt-2 text-xs">
                        {course.publication.name}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-medium">{formatPrice(course.price)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{course._count.lessons} lessons</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{course._count.enrollments} enrolled</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        Created {new Date(course.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          asChild
                        >
                          <Link href={`/portal/publications/${course.publication.slug}/courses/${course.id}`}>
                            <Eye className="w-4 h-4 mr-1" />
                            Open
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(course.id, course.publication.slug, course.status || "DRAFT")}
                          disabled={actionLoading === course.id}
                        >
                          {(course.status || "DRAFT") === "PUBLISHED" ? "Unpublish" : "Publish"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCourse(course.id, course.publication.slug)}
                          disabled={actionLoading === course.id}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
