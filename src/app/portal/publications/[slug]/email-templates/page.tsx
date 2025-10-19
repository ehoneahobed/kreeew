"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  ArrowLeft, 
  Mail,
  Edit,
  Trash2,
  Eye,
  Copy,
  Calendar
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface EmailTemplate {
  id: string
  name: string
  subject: string
  htmlContent: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface EmailTemplatesPageProps {
  params: Promise<{
    slug: string
  }>
}

export default function EmailTemplatesPage({ params }: EmailTemplatesPageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchTemplates()
  }, [resolvedParams.slug])

  const fetchTemplates = async () => {
    try {
      const response = await fetch(`/api/publications/${resolvedParams.slug}/email-templates`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch templates")
      }

      const data = await response.json()
      setTemplates(data.templates)
    } catch (error) {
      console.error("Error fetching templates:", error)
      toast.error("Failed to load email templates")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this template? This action cannot be undone.")) {
      return
    }

    setActionLoading(templateId)
    try {
      const response = await fetch(`/api/publications/${resolvedParams.slug}/email-templates/${templateId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete template")
      }

      setTemplates(prev => prev.filter(t => t.id !== templateId))
      toast.success("Template deleted successfully")
    } catch (error) {
      console.error("Error deleting template:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete template")
    } finally {
      setActionLoading(null)
    }
  }

  const handleDuplicateTemplate = async (template: EmailTemplate) => {
    try {
      const response = await fetch(`/api/publications/${resolvedParams.slug}/email-templates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `${template.name} (Copy)`,
          subject: template.subject,
          htmlContent: template.htmlContent,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to duplicate template")
      }

      const data = await response.json()
      setTemplates(prev => [data.template, ...prev])
      toast.success("Template duplicated successfully")
    } catch (error) {
      console.error("Error duplicating template:", error)
      toast.error("Failed to duplicate template")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading templates...</p>
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
          <h1 className="text-3xl font-bold">Email Templates</h1>
          <p className="text-muted-foreground">
            Create and manage email templates for your automations
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
            <p className="text-xs text-muted-foreground">
              All templates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {templates.filter(t => t.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Ready to use
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {templates.filter(t => !t.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Draft templates
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Templates List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Templates</h2>
          <Button asChild>
            <Link href={`/portal/publications/${resolvedParams.slug}/email-templates/create`}>
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Link>
          </Button>
        </div>

        {templates.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Mail className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No templates yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first email template to use in automations.
              </p>
              <Button asChild>
                <Link href={`/portal/publications/${resolvedParams.slug}/email-templates/create`}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Template
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {templates.map((template) => (
              <Card key={template.id} className="group hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{template.name}</h3>
                        <Badge variant={template.isActive ? "default" : "secondary"}>
                          {template.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Subject:</p>
                        <p className="text-sm">{template.subject}</p>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Updated {formatDate(template.updatedAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/portal/publications/${resolvedParams.slug}/email-templates/${template.id}`}>
                          <Edit className="w-4 h-4" />
                        </Link>
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDuplicateTemplate(template)}
                        type="button"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id)}
                        disabled={actionLoading === template.id}
                        className="text-destructive hover:text-destructive"
                        type="button"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
