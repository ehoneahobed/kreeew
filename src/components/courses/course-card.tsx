"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Edit, 
  Trash2, 
  BookOpen, 
  Users,
  DollarSign,
  Calendar,
  Play
} from "lucide-react"
import Link from "next/link"

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

interface CourseCardProps {
  course: Course
  onEdit: (course: Course) => void
  onDelete: (courseId: string) => void
  onToggleStatus: (courseId: string, status: string) => void
}

export function CourseCard({ course, onEdit, onDelete, onToggleStatus }: CourseCardProps) {
  const formatPrice = (price: number) => {
    if (price === 0) return "Free"
    return `$${(price / 100).toFixed(2)}`
  }

  const getStatusColor = (status: string) => {
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

  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
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
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleStatus(course.id, (course.status || "DRAFT") === "PUBLISHED" ? "DRAFT" : "PUBLISHED")}
            >
              {(course.status || "DRAFT") === "PUBLISHED" ? "Unpublish" : "Publish"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(course)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(course.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
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
              <Button asChild variant="outline" size="sm">
                <Link href={`/portal/publications/${course.id}/courses/${course.id}/lessons`}>
                  <Play className="w-4 h-4 mr-2" />
                  Manage Lessons
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

