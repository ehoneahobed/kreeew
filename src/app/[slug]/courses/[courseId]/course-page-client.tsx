"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  BookOpen,
  Users,
  Clock,
  CheckCircle,
  ArrowLeft,
  DollarSign,
  Calendar,
  Star
} from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface CoursePageClientProps {
  course: any
  slug: string
}

export function CoursePageClient({ course, slug }: CoursePageClientProps) {
  const router = useRouter()
  const [actionLoading, setActionLoading] = useState(false)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [isInWishlist, setIsInWishlist] = useState(false)

  const handleEnroll = async () => {
    if (isEnrolled || actionLoading) return

    setActionLoading(true)
    try {
      const response = await fetch(`/api/courses/${course.id}/enroll`, {
        method: "POST",
        credentials: "include",
      })

      if (response.ok) {
        setIsEnrolled(true)
        toast.success("Successfully enrolled in course!")
        router.refresh() // Refresh server component data
      } else {
        const error = await response.json()
        if (response.status === 401) {
          toast.error("Please sign in to enroll in this course")
          router.push(`/auth/signin?callbackUrl=${encodeURIComponent(`/${slug}/courses/${course.id}`)}`)
        } else {
          toast.error(error.error || "Failed to enroll in course")
        }
      }
    } catch (error) {
      console.error("Enroll error:", error)
      toast.error("Failed to enroll in course")
    } finally {
      setActionLoading(false)
    }
  }

  const handleWishlist = async () => {
    if (actionLoading) return

    setActionLoading(true)
    try {
      const method = isInWishlist ? "DELETE" : "POST"
      const response = await fetch(`/api/courses/${course.id}/wishlist`, {
        method,
        credentials: "include",
      })

      if (response.ok) {
        setIsInWishlist(!isInWishlist)
        toast.success(isInWishlist ? "Removed from wishlist" : "Added to wishlist")
      } else {
        const error = await response.json()
        if (response.status === 401) {
          toast.error("Please sign in to add to wishlist")
          router.push(`/auth/signin?callbackUrl=${encodeURIComponent(`/${slug}/courses/${course.id}`)}`)
        } else {
          toast.error(error.error || "Failed to update wishlist")
        }
      }
    } catch (error) {
      console.error("Wishlist error:", error)
      toast.error("Failed to update wishlist")
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/${slug}`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to {course.publication.name}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4 max-w-6xl">
        {/* Course Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                  <BookOpen className="w-4 h-4 mr-1" />
                  Course
                </Badge>
                <Badge variant={
                  (course.status || "DRAFT") === "PUBLISHED" ? "default" :
                  (course.status || "DRAFT") === "DRAFT" ? "secondary" :
                  "outline"
                }>
                  {course.status || "DRAFT"}
                </Badge>
              </div>
              <h1 className="text-4xl font-bold mb-3">{course.title}</h1>
              {course.description && (
                <p className="text-lg text-muted-foreground">{course.description}</p>
              )}
            </div>
          </div>

          {/* Course Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{course._count?.enrollments || 0}</p>
                    <p className="text-sm text-muted-foreground">Students Enrolled</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{course._count?.lessons || 0}</p>
                    <p className="text-sm text-muted-foreground">Lessons</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <DollarSign className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {course.price === 0 ? "Free" : `$${course.price}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {course.price === 0 ? "No cost" : "One-time payment"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            {(course.status || "DRAFT") === "PUBLISHED" && (
              <Button
                size="lg"
                onClick={handleEnroll}
                disabled={actionLoading || isEnrolled}
                className="flex-1"
              >
                {actionLoading ? (
                  <>
                    <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : isEnrolled ? (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Enrolled
                  </>
                ) : (
                  <>
                    <BookOpen className="w-5 h-5 mr-2" />
                    {course.price === 0 ? "Enroll for Free" : `Enroll for $${course.price}`}
                  </>
                )}
              </Button>
            )}
            {(course.status || "DRAFT") !== "PUBLISHED" && (
              <Button size="lg" disabled className="flex-1">
                <Clock className="w-5 h-5 mr-2" />
                Coming Soon
              </Button>
            )}
            <Button
              variant="outline"
              size="lg"
              onClick={handleWishlist}
              disabled={actionLoading}
            >
              <Star className="w-5 h-5 mr-2" />
              {isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
            </Button>
          </div>
        </div>

        {/* Course Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About this course */}
            <Card>
              <CardHeader>
                <CardTitle>About this course</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {course.description || "No description provided for this course."}
                </p>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm">
                      Created {formatDistanceToNow(new Date(course.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm">
                      Last updated {formatDistanceToNow(new Date(course.updatedAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Course Curriculum */}
            <Card>
              <CardHeader>
                <CardTitle>Course Curriculum</CardTitle>
                <CardDescription>
                  {course._count?.lessons || 0} lessons in this course
                </CardDescription>
              </CardHeader>
              <CardContent>
                {course._count?.lessons > 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Lesson details will be available after enrollment
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No lessons added yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <Card>
              <CardHeader>
                <CardTitle>Course Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  {course.price === 0 ? (
                    <>
                      <div className="text-3xl font-bold text-green-600">Free</div>
                      <p className="text-muted-foreground">No payment required</p>
                    </>
                  ) : (
                    <>
                      <div className="text-3xl font-bold">${course.price}</div>
                      <p className="text-muted-foreground">One-time payment</p>
                    </>
                  )}

                  <Button
                    size="lg"
                    className="w-full"
                    disabled={actionLoading || (course.status || "DRAFT") !== "PUBLISHED" || isEnrolled}
                    onClick={handleEnroll}
                  >
                    {actionLoading ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : isEnrolled ? (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Enrolled
                      </>
                    ) : (course.status || "DRAFT") === "PUBLISHED" ? (
                      <>
                        <BookOpen className="w-5 h-5 mr-2" />
                        {course.price === 0 ? "Enroll for Free" : `Enroll for $${course.price}`}
                      </>
                    ) : (
                      <>
                        <Clock className="w-5 h-5 mr-2" />
                        Coming Soon
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center mt-4">
                    {course.price === 0 ? "Start learning immediately" : "30-day money-back guarantee"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Instructor Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">About the Publication</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">{course.publication.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Educational content creator
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/${slug}`}>
                      View Publication
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Course Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm">Email-based course delivery</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm">Learn at your own pace</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm">Lifetime access</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm">Mobile-friendly content</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}


