"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  Save, 
  Trash2,
  AlertTriangle,
  Globe,
  Palette,
  Mail,
  Users,
  BookOpen
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface Publication {
  id: string
  name: string
  slug: string
  description?: string
  domain?: string
  themeColors?: {
    primary?: string
    secondary?: string
    accent?: string
  }
  createdAt: string
  updatedAt: string
}

interface PublicationSettingsPageProps {
  params: Promise<{
    slug: string
  }>
}

export default function PublicationSettingsPage({ params }: PublicationSettingsPageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [publication, setPublication] = useState<Publication | null>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    domain: "",
    themeColors: {
      primary: "#3b82f6",
      secondary: "#64748b",
      accent: "#f59e0b",
    },
  })

  useEffect(() => {
    fetchPublication()
  }, [resolvedParams.slug])

  const fetchPublication = async () => {
    try {
      const response = await fetch(`/api/publications/${resolvedParams.slug}/settings`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch publication settings")
      }

      const data = await response.json()
      setPublication(data.publication)
      setFormData({
        name: data.publication.name,
        description: data.publication.description || "",
        domain: data.publication.domain || "",
        themeColors: data.publication.themeColors || {
          primary: "#3b82f6",
          secondary: "#64748b",
          accent: "#f59e0b",
        },
      })
    } catch (error) {
      console.error("Error fetching publication:", error)
      toast.error("Failed to load publication settings")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!publication) return

    setSaving(true)
    try {
      const response = await fetch(`/api/publications/${resolvedParams.slug}/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update publication")
      }

      const { publication: updatedPublication } = await response.json()
      setPublication(updatedPublication)
      toast.success("Publication updated successfully")
    } catch (error) {
      console.error("Error updating publication:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update publication")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!publication) return

    if (!confirm("Are you sure you want to delete this publication? This action cannot be undone and will delete all posts, subscribers, and related data.")) {
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/publications/${resolvedParams.slug}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete publication")
      }

      toast.success("Publication deleted successfully")
      router.push("/portal/publications")
    } catch (error) {
      console.error("Error deleting publication:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete publication")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!publication) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Publication not found</h1>
          <Button asChild>
            <Link href="/portal/publications">
              Back to Publications
            </Link>
          </Button>
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
          <h1 className="text-3xl font-bold">Publication Settings</h1>
          <p className="text-muted-foreground">
            Manage your publication settings and preferences
          </p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="domain">Domain</TabsTrigger>
          <TabsTrigger value="danger">Danger Zone</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
              <CardDescription>
                Basic information about your publication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Publication Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter publication name..."
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={publication.slug}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  This is your publication's unique URL identifier. It cannot be changed.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your publication..."
                  rows={3}
                />
              </div>

              <Button onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme Colors</CardTitle>
              <CardDescription>
                Customize the appearance of your publication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="primary">Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="primary"
                      type="color"
                      value={formData.themeColors.primary}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        themeColors: { ...prev.themeColors, primary: e.target.value }
                      }))}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={formData.themeColors.primary}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        themeColors: { ...prev.themeColors, primary: e.target.value }
                      }))}
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="secondary">Secondary Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="secondary"
                      type="color"
                      value={formData.themeColors.secondary}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        themeColors: { ...prev.themeColors, secondary: e.target.value }
                      }))}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={formData.themeColors.secondary}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        themeColors: { ...prev.themeColors, secondary: e.target.value }
                      }))}
                      placeholder="#64748b"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="accent">Accent Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="accent"
                      type="color"
                      value={formData.themeColors.accent}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        themeColors: { ...prev.themeColors, accent: e.target.value }
                      }))}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={formData.themeColors.accent}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        themeColors: { ...prev.themeColors, accent: e.target.value }
                      }))}
                      placeholder="#f59e0b"
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="domain" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Custom Domain</CardTitle>
              <CardDescription>
                Set up a custom domain for your publication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="domain">Domain</Label>
                <Input
                  id="domain"
                  value={formData.domain}
                  onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
                  placeholder="example.com"
                />
                <p className="text-xs text-muted-foreground">
                  Enter your custom domain (without https://). You'll need to configure DNS settings.
                </p>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">DNS Configuration</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  To use a custom domain, add these DNS records:
                </p>
                <div className="font-mono text-sm">
                  <div>CNAME: www → kreeew.com</div>
                  <div>A: @ → 76.76.19.61</div>
                </div>
              </div>

              <Button onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="danger" className="space-y-6">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border border-destructive rounded-lg">
                <h4 className="font-medium text-destructive mb-2">Delete Publication</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Once you delete a publication, there is no going back. This will permanently delete:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                  <li>• All posts and content</li>
                  <li>• All subscribers and contacts</li>
                  <li>• All email campaigns</li>
                  <li>• All courses and lessons</li>
                  <li>• All analytics data</li>
                </ul>
                <Button 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={saving}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {saving ? "Deleting..." : "Delete Publication"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

