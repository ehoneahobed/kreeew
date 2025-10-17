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
  Send,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Eye,
  BarChart3
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface EmailCampaign {
  id: string
  name: string
  type: "NEWSLETTER" | "DRIP" | "COURSE" | "AUTOMATION"
  status: "DRAFT" | "SCHEDULED" | "SENDING" | "SENT" | "FAILED"
  scheduledAt?: string
  sentAt?: string
  createdAt: string
  updatedAt: string
  _count?: {
    emailLogs: number
  }
}

interface CampaignsPageProps {
  params: Promise<{
    slug: string
  }>
}

export default function CampaignsPage({ params }: CampaignsPageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchCampaigns()
  }, [resolvedParams.slug])

  const fetchCampaigns = async () => {
    try {
      const response = await fetch(`/api/publications/${resolvedParams.slug}/campaigns`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch campaigns")
      }

      const data = await response.json()
      setCampaigns(data.campaigns)
    } catch (error) {
      console.error("Error fetching campaigns:", error)
      toast.error("Failed to load email campaigns")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm("Are you sure you want to delete this campaign? This action cannot be undone.")) {
      return
    }

    setActionLoading(campaignId)
    try {
      const response = await fetch(`/api/publications/${resolvedParams.slug}/campaigns/${campaignId}`, {
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

  const handleSendCampaign = async (campaignId: string) => {
    setActionLoading(campaignId)
    try {
      const response = await fetch(`/api/publications/${resolvedParams.slug}/campaigns/${campaignId}/send`, {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DRAFT":
        return <Edit className="w-4 h-4" />
      case "SCHEDULED":
        return <Clock className="w-4 h-4" />
      case "SENDING":
        return <Send className="w-4 h-4" />
      case "SENT":
        return <CheckCircle className="w-4 h-4" />
      case "FAILED":
        return <XCircle className="w-4 h-4" />
      default:
        return <Mail className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-gray-100 text-gray-800"
      case "SCHEDULED":
        return "bg-blue-100 text-blue-800"
      case "SENDING":
        return "bg-yellow-100 text-yellow-800"
      case "SENT":
        return "bg-green-100 text-green-800"
      case "FAILED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
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
          <Link href={`/portal/publications/${resolvedParams.slug}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Publication
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Email Campaigns</h1>
          <p className="text-muted-foreground">
            Create and manage email campaigns for your subscribers
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
              Ready to send
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
          <h2 className="text-xl font-semibold">Campaigns</h2>
          <Button asChild>
            <Link href={`/portal/publications/${resolvedParams.slug}/campaigns/create`}>
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Link>
          </Button>
        </div>

        {campaigns.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Mail className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first email campaign to start engaging with your subscribers.
              </p>
              <Button asChild>
                <Link href={`/portal/publications/${resolvedParams.slug}/campaigns/create`}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Campaign
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="group hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{campaign.name}</h3>
                        <Badge className={getStatusColor(campaign.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(campaign.status)}
                            {campaign.status}
                          </div>
                        </Badge>
                        <Badge variant="outline">
                          {campaign.type}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
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
                          onClick={() => handleSendCampaign(campaign.id)}
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
                          <Link href={`/portal/publications/${resolvedParams.slug}/campaigns/${campaign.id}` as any}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCampaign(campaign.id)}
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
