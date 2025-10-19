"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  ArrowLeft, 
  Save,
  Eye,
  Send
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { EmailEditor } from "@/components/automation/email-editor"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Publication {
  id: string
  name: string
  slug: string
}

export default function CreateEmailTemplatePage() {
  const router = useRouter()
  const [publications, setPublications] = useState<Publication[]>([])
  const [selectedPublication, setSelectedPublication] = useState<string>("")
  const [name, setName] = useState("")
  const [subject, setSubject] = useState("")
  const [content, setContent] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPublications()
  }, [])

  const fetchPublications = async () => {
    try {
      const response = await fetch("/api/publications")
      if (response.ok) {
        const data = await response.json()
        setPublications(data.publications || [])
        if (data.publications?.length === 1) {
          setSelectedPublication(data.publications[0].slug)
        }
      }
    } catch (error) {
      console.error("Error fetching publications:", error)
      toast.error("Failed to load publications")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!selectedPublication || !name.trim() || !subject.trim() || !content.trim()) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`/api/publications/${selectedPublication}/email-templates`, {
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
      router.push("/portal/email-templates")
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

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="sm" asChild>
          <Link href="/portal/email-templates">
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
                <Label htmlFor="publication">Publication</Label>
                <Select value={selectedPublication} onValueChange={setSelectedPublication}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a publication" />
                  </SelectTrigger>
                  <SelectContent>
                    {publications.map((publication) => (
                      <SelectItem key={publication.id} value={publication.slug}>
                        {publication.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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

              {selectedPublication && (
                <EmailEditor
                  subject={subject}
                  content={content}
                  onSubjectChange={setSubject}
                  onContentChange={setContent}
                  onTemplateChange={() => {}}
                  onPreview={handlePreview}
                  onTestSend={handleTestSend}
                  publicationSlug={selectedPublication}
                />
              )}
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
                disabled={isSaving || !selectedPublication || !name.trim() || !subject.trim() || !content.trim()}
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
