"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PublicationSelector } from "@/components/publication-selector"
import { 
  ArrowLeft, 
  Mail,
  Plus,
  Edit,
  Send,
  Clock,
  CheckCircle,
  BarChart3,
  Eye,
  Trash2
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface Campaign {
  id: string
  name: string
  type: "NEWSLETTER" | "DRIP" | "COURSE" | "AUTOMATION"
  status: "DRAFT" | "SCHEDULED" | "SENDING" | "SENT" | "FAILED"
  subject: string
  scheduledAt?: string
  sentAt?: string
  createdAt: string
  publication: {
    id: string
    name: string
    slug: string
  }
  _count: {
    emailLogs: number
  }
}

export default function GlobalCampaignsPage() {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchAllCampaigns()
  }, [])

  const fetchAllCampaigns = async () => {
    try {
      const response = await fetch("/api/campaigns")
      
      if (!response.ok) {
        throw new Error("Failed to fetch campaigns")
      }

      const data = await response.json()
      setCampaigns(data.campaigns)
    } catch (error) {
      console.error("Error fetching campaigns:", error)
      toast.error("Failed to load campaigns")
    } finally {
      setLoading(false)
    }
  }

  const handleSendCampaign = async (campaignId: string, publicationSlug: string) => {
    setActionLoading(campaignId)
    try {
      const response = await fetch(`/api/publications/${publicationSlug}/campaigns/${campaignId}/send`, {
        method: "POST",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to send campaign")
      }

      const { campaign } = await response.json()
      setCampaigns(prev => prev.map(c => c.id === campaignId ? campaign : c))
      toast.success("Campaign sent successfully")
    } catch (error) {
      console.error("Error sending campaign:", error)
      toast.error(error instanceof Error ? error.message : "Failed to send campaign")
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteCampaign = async (campaignId: string, publicationSlug: string) => {
    if (!confirm("Are you sure you want to delete this campaign? This action cannot be undone.")) {
      return
    }

    setActionLoading(campaignId)
    try {
      const response = await fetch(`/api/publications/${publicationSlug}/campaigns/${campaignId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete campaign")
      }

      setCampaigns(prev => prev.filter(c => c.id !== campaignId))
      toast.success("Campaign deleted successfully")
    } catch (error) {
      console.error("Error deleting campaign:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete campaign")
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SENT":
        return "default"
      case "DRAFT":
        return "secondary"
      case "SCHEDULED":
        return "outline"
      case "SENDING":
        return "default"
      case "FAILED":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SENT":
        return <CheckCircle className="w-3 h-3" />
      case "DRAFT":
        return <Edit className="w-3 h-3" />
      case "SCHEDULED":
        return <Clock className="w-3 h-3" />
      case "SENDING":
        return <Send className="w-3 h-3" />
      case "FAILED":
        return <Trash2 className="w-3 h-3" />
      default:
        return <Edit className="w-3 h-3" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading campaigns...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="sm" asChild>
          <Link href="/portal">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">All Email Campaigns</h1>
          <p className="text-muted-foreground">
            Manage email campaigns across all your publications
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.length}</div>
            <p className="text-xs text-muted-foreground">
              All campaigns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.filter(c => c.status === "DRAFT").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Not sent yet
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.filter(c => c.status === "SCHEDULED").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Waiting to send
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.filter(c => c.status === "SENT").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully sent
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">All Campaigns</h2>
          <PublicationSelector 
            type="campaign"
            trigger={
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Campaign
              </Button>
            }
          />
        </div>

        {campaigns.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Mail className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first email campaign to start engaging with your subscribers.
              </p>
              <PublicationSelector 
                type="campaign"
                trigger={
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Campaign
                  </Button>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="group hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{campaign.name}</h3>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(campaign.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(campaign.status)}
                              {campaign.status}
                            </div>
                          </Badge>
                          <Badge variant="outline">
                            {campaign.type}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {campaign.publication.name}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          <span>Created {formatDate(campaign.createdAt)}</span>
                        </div>
                        
                        {campaign.scheduledAt && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Scheduled {formatDateTime(campaign.scheduledAt)}</span>
                          </div>
                        )}
                        
                        {campaign.sentAt && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            <span>Sent {formatDateTime(campaign.sentAt)}</span>
                          </div>
                        )}

                        {campaign._count?.emailLogs && (
                          <div className="flex items-center gap-1">
                            <BarChart3 className="w-3 h-3" />
                            <span>{campaign._count.emailLogs} emails sent</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      {campaign.status === "DRAFT" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendCampaign(campaign.id, campaign.publication.slug)}
                          disabled={actionLoading === campaign.id}
                          className="w-full sm:w-auto"
                        >
                          <Send className="w-4 h-4 mr-1" />
                          <span className="sm:hidden">Send</span>
                          <span className="hidden sm:inline">Send Now</span>
                        </Button>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none">
                          <Link href={`/portal/publications/${campaign.publication.slug}/campaigns/${campaign.id}` as any}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCampaign(campaign.id, campaign.publication.slug)}
                          disabled={actionLoading === campaign.id}
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
