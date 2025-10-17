"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PublicationSelector } from "@/components/publication-selector"
import { 
  Zap,
  Plus,
  Play,
  Pause,
  Edit,
  Trash2,
  Calendar,
  Users,
  Mail,
  Settings
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface Automation {
  id: string
  name: string
  description?: string
  status: "ACTIVE" | "PAUSED" | "DRAFT"
  triggerType: "SUBSCRIBE" | "UNSUBSCRIBE" | "POST_PUBLISHED" | "COURSE_ENROLLED"
  createdAt: string
  updatedAt: string
  publication: {
    id: string
    name: string
    slug: string
  }
  _count: {
    steps: number
    executions: number
  }
}

export default function AutomationPage() {
  const [automations, setAutomations] = useState<Automation[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchAutomations()
  }, [])

  const fetchAutomations = async () => {
    try {
      const response = await fetch("/api/automation")
      
      if (!response.ok) {
        throw new Error("Failed to fetch automations")
      }

      const data = await response.json()
      setAutomations(data.automations)
    } catch (error) {
      console.error("Error fetching automations:", error)
      toast.error("Failed to load automations")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (automationId: string, publicationSlug: string, status: string) => {
    setActionLoading(automationId)
    try {
      const newStatus = status === "ACTIVE" ? "PAUSED" : "ACTIVE"
      
      const response = await fetch(`/api/publications/${publicationSlug}/automation/${automationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update automation")
      }

      const { automation } = await response.json()
      setAutomations(prev => prev.map(a => a.id === automationId ? automation : a))
      toast.success(`Automation ${newStatus.toLowerCase()} successfully`)
    } catch (error) {
      console.error("Error updating automation:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update automation")
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteAutomation = async (automationId: string, publicationSlug: string) => {
    if (!confirm("Are you sure you want to delete this automation? This action cannot be undone.")) {
      return
    }

    setActionLoading(automationId)
    try {
      const response = await fetch(`/api/publications/${publicationSlug}/automation/${automationId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete automation")
      }

      setAutomations(prev => prev.filter(a => a.id !== automationId))
      toast.success("Automation deleted successfully")
    } catch (error) {
      console.error("Error deleting automation:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete automation")
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "default"
      case "PAUSED":
        return "secondary"
      case "DRAFT":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getTriggerIcon = (triggerType: string) => {
    switch (triggerType) {
      case "SUBSCRIBE":
        return <Users className="w-4 h-4" />
      case "UNSUBSCRIBE":
        return <Users className="w-4 h-4" />
      case "POST_PUBLISHED":
        return <Mail className="w-4 h-4" />
      case "COURSE_ENROLLED":
        return <Settings className="w-4 h-4" />
      default:
        return <Zap className="w-4 h-4" />
    }
  }

  const getTriggerLabel = (triggerType: string) => {
    switch (triggerType) {
      case "SUBSCRIBE":
        return "New Subscriber"
      case "UNSUBSCRIBE":
        return "Unsubscribe"
      case "POST_PUBLISHED":
        return "Post Published"
      case "COURSE_ENROLLED":
        return "Course Enrolled"
      default:
        return triggerType
    }
  }

  const activeAutomations = automations.filter(a => a.status === "ACTIVE")
  const totalExecutions = automations.reduce((sum, a) => sum + a._count.executions, 0)

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading automations...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Automation</h1>
        <p className="text-muted-foreground">
          Create automated workflows to engage with your subscribers
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Automations</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{automations.length}</div>
            <p className="text-xs text-muted-foreground">
              All workflows
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAutomations.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paused</CardTitle>
            <Pause className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {automations.filter(a => a.status === "PAUSED").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Temporarily stopped
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExecutions}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Automations List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Automation Workflows</h2>
          <PublicationSelector 
            type="automation"
            trigger={
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Automation
              </Button>
            }
          />
        </div>

        {automations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Zap className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No automations yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create automated workflows to engage with your subscribers automatically.
              </p>
              <PublicationSelector 
                type="automation"
                trigger={
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Automation
                  </Button>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {automations.map((automation) => (
              <Card key={automation.id} className="group hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{automation.name}</h3>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(automation.status)}>
                            <div className="flex items-center gap-1">
                              {automation.status === "ACTIVE" ? <Play className="w-3 h-3" /> : 
                               automation.status === "PAUSED" ? <Pause className="w-3 h-3" /> : 
                               <Edit className="w-3 h-3" />}
                              {automation.status}
                            </div>
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            {getTriggerIcon(automation.triggerType)}
                            {getTriggerLabel(automation.triggerType)}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {automation.publication.name}
                          </Badge>
                        </div>
                      </div>
                      
                      {automation.description && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {automation.description}
                        </p>
                      )}
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Created {new Date(automation.createdAt).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Settings className="w-3 h-3" />
                          <span>{automation._count.steps} steps</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          <span>{automation._count.executions} executions</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(automation.id, automation.publication.slug, automation.status)}
                        disabled={actionLoading === automation.id}
                        className="w-full sm:w-auto"
                      >
                        {automation.status === "ACTIVE" ? (
                          <>
                            <Pause className="w-4 h-4 mr-1" />
                            <span className="sm:hidden">Pause</span>
                            <span className="hidden sm:inline">Pause</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-1" />
                            <span className="sm:hidden">Start</span>
                            <span className="hidden sm:inline">Start</span>
                          </>
                        )}
                      </Button>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                          <Edit className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAutomation(automation.id, automation.publication.slug)}
                          disabled={actionLoading === automation.id}
                          className="text-destructive hover:text-destructive flex-1 sm:flex-none"
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
