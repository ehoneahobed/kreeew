"use client"

import { useState, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, BookOpen, Save } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface CreateCoursePageProps {
  params: Promise<{
    slug: string
  }>
}

export default function CreateCoursePage({ params }: CreateCoursePageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "0",
    status: "DRAFT" as "DRAFT" | "PUBLISHED"
  })

  const handleSubmit = async (e: React.FormEvent, status: "DRAFT" | "PUBLISHED") => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error("Course title is required")
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/publications/${resolvedParams.slug}/courses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price) || 0,
          status
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create course")
      }

      const course = await response.json()
      toast.success(`Course ${status === "DRAFT" ? "saved as draft" : "published"} successfully!`)
      router.push(`/portal/publications/${resolvedParams.slug}/courses/${course.id}`)
    } catch (error) {
      console.error("Error creating course:", error)
      toast.error("Failed to create course")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href={`/portal/publications/${resolvedParams.slug}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Publication
          </Link>
        </Button>
        
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Create New Course</h1>
            <p className="text-muted-foreground">Build an email course for your subscribers</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={(e) => handleSubmit(e, "DRAFT")}>
        <Card>
          <CardHeader>
            <CardTitle>Course Details</CardTitle>
            <CardDescription>
              Provide the basic information about your course
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Course Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g., Complete Guide to Content Marketing"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Course Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what students will learn in this course..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={loading}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                This will be shown to potential students on your course page
              </p>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Price (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  disabled={loading}
                  className="pl-7"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Set to 0 for a free course
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4">
              <Button 
                type="submit" 
                disabled={loading || !formData.title.trim()}
                className="flex-1 sm:flex-none"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save as Draft
                  </>
                )}
              </Button>
              
              <Button 
                type="button"
                onClick={(e) => handleSubmit(e as any, "PUBLISHED")}
                disabled={loading || !formData.title.trim()}
                variant="default"
                className="flex-1 sm:flex-none"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <BookOpen className="w-4 h-4 mr-2" />
                    Publish Course
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Help Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">What's Next?</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>After creating your course, you'll be able to add lessons and modules</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Each lesson will be delivered via email to enrolled students</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>You can schedule lessons to be sent at specific intervals</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

