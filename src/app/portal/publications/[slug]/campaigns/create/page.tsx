"use client"

import { useState, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RichTextEditor } from "@/components/editor/rich-text-editor"
import { 
  ArrowLeft, 
  Save, 
  Send, 
  Clock,
  Mail,
  Users,
  Calendar
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface CreateCampaignPageProps {
  params: Promise<{
    slug: string
  }>
}

export default function CreateCampaignPage({ params }: CreateCampaignPageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: "",
    type: "NEWSLETTER" as "NEWSLETTER" | "DRIP" | "COURSE" | "AUTOMATION",
    subject: "",
    content: "",
    scheduledAt: "",
    targetAudience: "all" as "all" | "active" | "premium",
  })

  const handleContentChange = (content: string) => {
    setFormData(prev => ({ ...prev, content }))
  }

  const handleSave = async (status: "DRAFT" | "SCHEDULED") => {
    if (!formData.name.trim() || !formData.subject.trim() || !formData.content.trim()) {
      toast.error("Please fill in all required fields")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/publications/${resolvedParams.slug}/campaigns`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          status,
          scheduledAt: status === "SCHEDULED" && formData.scheduledAt 
            ? new Date(formData.scheduledAt).toISOString() 
            : null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save campaign")
      }

      const { campaign } = await response.json()
      
      toast.success(`Campaign ${status.toLowerCase()} successfully!`)
      router.push(`/portal/publications/${resolvedParams.slug}/campaigns`)
    } catch (error) {
      console.error("Error saving campaign:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save campaign")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/portal/publications/${resolvedParams.slug}/campaigns`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Campaigns
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Email Campaign</h1>
          <p className="text-muted-foreground">
            Create and send email campaigns to your subscribers
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Content</CardTitle>
              <CardDescription>
                Write your email campaign content using our rich text editor
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Campaign Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter campaign name..."
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="subject">Email Subject *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Enter email subject..."
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Email Content *</Label>
                  <RichTextEditor
                    content={formData.content}
                    onChange={handleContentChange}
                    placeholder="Write your email content..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Campaign Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Campaign Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value: "NEWSLETTER" | "DRIP" | "COURSE" | "AUTOMATION") => 
                    setFormData(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEWSLETTER">Newsletter</SelectItem>
                    <SelectItem value="DRIP">Drip Campaign</SelectItem>
                    <SelectItem value="COURSE">Course Email</SelectItem>
                    <SelectItem value="AUTOMATION">Automation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Target Audience</Label>
                <Select 
                  value={formData.targetAudience} 
                  onValueChange={(value: "all" | "active" | "premium") => 
                    setFormData(prev => ({ ...prev, targetAudience: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subscribers</SelectItem>
                    <SelectItem value="active">Active Subscribers</SelectItem>
                    <SelectItem value="premium">Premium Subscribers</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="scheduledAt">Schedule Send (Optional)</Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduledAt: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to send immediately
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleSave("DRAFT")}
                  disabled={loading}
                  variant="outline"
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Draft
                </Button>
                <Button
                  onClick={() => handleSave(formData.scheduledAt ? "SCHEDULED" : "DRAFT")}
                  disabled={loading}
                  className="flex-1"
                >
                  {formData.scheduledAt ? (
                    <>
                      <Clock className="w-4 h-4 mr-2" />
                      Schedule
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Now
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Campaign Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                Preview your email campaign
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Subject:</span>
                  <span className="text-muted-foreground">
                    {formData.subject || "No subject"}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Audience:</span>
                  <span className="text-muted-foreground">
                    {formData.targetAudience === "all" ? "All Subscribers" :
                     formData.targetAudience === "active" ? "Active Subscribers" :
                     "Premium Subscribers"}
                  </span>
                </div>
                
                {formData.scheduledAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Scheduled:</span>
                    <span className="text-muted-foreground">
                      {new Date(formData.scheduledAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

