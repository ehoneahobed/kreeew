"use client"

import { useState, useEffect, use } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft,
  Edit,
  Send,
  Calendar,
  Users,
  Mail,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react"
import { toast } from "sonner"

interface Campaign {
  id: string
  name: string
  subject: string
  content: string
  type: string
  status: string
  scheduledAt?: string
  sentAt?: string
  createdAt: string
  updatedAt: string
  metadata?: {
    targetAudience?: string
  }
  _count: {
    emailLogs: number
  }
}

export default function CampaignViewPage({
  params: paramsPromise,
}: {
  params: Promise<{ slug: string; campaignId: string }>
}) {
  const params = use(paramsPromise)
  const router = useRouter()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)

  const slug = params.slug
  const campaignId = params.campaignId

  useEffect(() => {
    fetchCampaign()
  }, [slug, campaignId])

  const fetchCampaign = async () => {
    try {
      const response = await fetch(`/api/publications/${slug}/campaigns/${campaignId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch campaign")
      }
      const data = await response.json()
      setCampaign(data.campaign)
    } catch (error) {
      console.error("Error fetching campaign:", error)
      toast.error("Failed to load campaign")
    } finally {
      setLoading(false)
    }
  }

  const handleSendCampaign = async () => {
    try {
      const response = await fetch(`/api/publications/${slug}/campaigns/${campaignId}/send`, {
        method: "POST",
      })
      
      if (!response.ok) {
        throw new Error("Failed to send campaign")
      }
      
      toast.success("Campaign sent successfully!")
      fetchCampaign() // Refresh campaign data
    } catch (error) {
      console.error("Error sending campaign:", error)
      toast.error("Failed to send campaign")
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
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "secondary"
      case "SCHEDULED":
        return "default"
      case "SENDING":
        return "default"
      case "SENT":
        return "default"
      case "FAILED":
        return "destructive"
      default:
        return "secondary"
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading campaign...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Campaign Not Found</h1>
          <p className="text-muted-foreground mb-6">The campaign you're looking for doesn't exist.</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Campaigns
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{campaign.name}</h1>
            <p className="text-muted-foreground mt-1">{campaign.subject}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusColor(campaign.status)} className="flex items-center gap-1">
              {getStatusIcon(campaign.status)}
              {campaign.status}
            </Badge>
            {campaign.status === "DRAFT" && (
              <Button onClick={handleSendCampaign}>
                <Send className="w-4 h-4 mr-2" />
                Send Now
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campaign Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Content</CardTitle>
              <CardDescription>
                Preview of your email campaign
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-muted/50">
                <div className="mb-4">
                  <h3 className="font-semibold text-lg">{campaign.subject}</h3>
                </div>
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: campaign.content }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campaign Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Type</span>
                <Badge variant="outline">{campaign.type}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <Badge variant={getStatusColor(campaign.status)} className="flex items-center gap-1">
                  {getStatusIcon(campaign.status)}
                  {campaign.status}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Target Audience</span>
                <span className="text-sm text-muted-foreground">
                  {campaign.metadata?.targetAudience || "All subscribers"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Recipients</span>
                <span className="text-sm text-muted-foreground">
                  {campaign._count.emailLogs} emails
                </span>
              </div>

              {campaign.scheduledAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Scheduled</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(campaign.scheduledAt).toLocaleString()}
                  </span>
                </div>
              )}

              {campaign.sentAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Sent</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(campaign.sentAt).toLocaleString()}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Created</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(campaign.createdAt).toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Edit className="w-4 h-4 mr-2" />
                Edit Campaign
              </Button>
              
              {campaign.status === "DRAFT" && (
                <Button variant="outline" className="w-full justify-start" onClick={handleSendCampaign}>
                  <Send className="w-4 h-4 mr-2" />
                  Send Now
                </Button>
              )}
              
              <Button variant="outline" className="w-full justify-start">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

