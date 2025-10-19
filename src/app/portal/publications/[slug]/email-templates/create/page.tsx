"use client"

import { useState, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  ArrowLeft, 
  Save,
  Eye,
  Send
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { EmailEditor } from "@/components/automation/email-editor"

interface CreateEmailTemplatePageProps {
  params: Promise<{
    slug: string
  }>
}

export default function CreateEmailTemplatePage({ params }: CreateEmailTemplatePageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [name, setName] = useState("")
  const [subject, setSubject] = useState("")
  const [content, setContent] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const handleSave = async () => {
    if (!name.trim() || !subject.trim() || !content.trim()) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`/api/publications/${resolvedParams.slug}/email-templates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          subject: subject.trim(),
          htmlContent: content.trim(),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create template")
      }

      const data = await response.json()
      toast.success("Template created successfully")
      router.push(`/portal/publications/${resolvedParams.slug}/email-templates`)
    } catch (error) {
      console.error("Error creating template:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create template")
    } finally {
      setIsSaving(false)
    }
  }

  const handlePreview = () => {
    setShowPreview(true)
  }

  const handleTestSend = async (email: string, subject: string, content: string) => {
    // Handle test send for template
    console.log("Test send:", { email, subject, content })
    toast.success("Test email sent successfully")
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/portal/publications/${resolvedParams.slug}/email-templates`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Templates
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Email Template</h1>
          <p className="text-muted-foreground">
            Create a new email template for your automations
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Template Editor */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Template Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter template name"
                  className="mt-1"
                />
              </div>

              <EmailEditor
                subject={subject}
                content={content}
                onSubjectChange={setSubject}
                onContentChange={setContent}
                onTemplateChange={() => {}}
                onPreview={handlePreview}
                onTestSend={handleTestSend}
                publicationSlug={resolvedParams.slug}
              />
            </CardContent>
          </Card>
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={handleSave}
                disabled={isSaving || !name.trim() || !subject.trim() || !content.trim()}
                className="w-full"
                type="button"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create Template
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={handlePreview}
                disabled={!subject.trim() || !content.trim()}
                className="w-full"
                type="button"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Template Info</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p className="mb-2">
                Email templates can be used in automation workflows to send personalized emails to your subscribers.
              </p>
              <p className="mb-2">
                Use personalization variables like <code className="bg-muted px-1 rounded">{"{{subscriber.name}}"}</code> to customize your emails.
              </p>
              <p>
                Templates are automatically saved and can be reused across multiple automations.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
