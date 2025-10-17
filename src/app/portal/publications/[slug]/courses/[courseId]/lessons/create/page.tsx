"use client"

import { useState, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, BookOpen, Save, Send } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface CreateLessonPageProps {
  params: Promise<{
    slug: string
    courseId: string
  }>
}

export default function CreateLessonPage({ params }: CreateLessonPageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    scheduledFor: "",
    isPublished: false
  })


  const handleSubmit = async (e: React.FormEvent, publish: boolean = false) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast.error("Lesson title is required")
      return
    }

    if (!formData.content.trim()) {
      toast.error("Lesson content is required")
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/publications/${resolvedParams.slug}/courses/${resolvedParams.courseId}/lessons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          isPublished: publish,
          scheduledFor: formData.scheduledFor ? new Date(formData.scheduledFor).toISOString() : null
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create lesson")
      }

      const lesson = await response.json()
      toast.success(`Lesson ${publish ? "published" : "saved as draft"} successfully!`)
      router.push(`/portal/publications/${resolvedParams.slug}/courses/${resolvedParams.courseId}/lessons/${lesson.id}`)
    } catch (error) {
      console.error("Error creating lesson:", error)
      toast.error("Failed to create lesson")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href={`/portal/publications/${resolvedParams.slug}/courses/${resolvedParams.courseId}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course
          </Link>
        </Button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Create New Lesson</h1>
            <p className="text-muted-foreground">Add a lesson to your email course</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={(e) => handleSubmit(e, false)}>
        <Card>
          <CardHeader>
            <CardTitle>Lesson Details</CardTitle>
            <CardDescription>
              Create content that will be delivered to your students via email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Lesson Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g., Introduction to Email Marketing"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">
                Lesson Content <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="content"
                placeholder="Write your lesson content here. This will be sent as an email to enrolled students..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                disabled={loading}
                rows={12}
                className="min-h-[300px]"
              />
              <p className="text-xs text-muted-foreground">
                This content will be sent as an email to students when they reach this lesson
              </p>
            </div>

            {/* Scheduling */}
            <div className="space-y-2">
              <Label htmlFor="scheduledFor">Schedule Delivery (Optional)</Label>
              <Input
                id="scheduledFor"
                type="datetime-local"
                value={formData.scheduledFor}
                onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to send immediately when students reach this lesson
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading || !formData.title.trim() || !formData.content.trim()}
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
                onClick={(e) => handleSubmit(e, true)}
                disabled={loading || !formData.title.trim() || !formData.content.trim()}
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
                    <Send className="w-4 h-4 mr-2" />
                    Publish Lesson
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
          <CardTitle className="text-lg">How Email Courses Work</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Each lesson is sent as a separate email to enrolled students</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Students progress through lessons automatically or manually</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>You can schedule lessons to be sent at specific times</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Students receive lessons in sequence based on enrollment order</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
