"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SubscriberList } from "@/components/subscribers/subscriber-list"
import { 
  Plus, 
  ArrowLeft, 
  Users,
  Mail,
  UserPlus,
  Download,
  Upload
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface Subscriber {
  id: string
  email: string
  tags: string[]
  customFields?: Record<string, any>
  preferences?: Record<string, any>
  isActive: boolean
  subscribedAt: string
  unsubscribedAt?: string
  user?: {
    id: string
    name: string
    email: string
  }
}

interface SubscribersPageProps {
  params: Promise<{
    slug: string
  }>
}

export default function SubscribersPage({ params }: SubscribersPageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0,
  })

  useEffect(() => {
    fetchSubscribers()
  }, [resolvedParams.slug, pagination.page])

  const fetchSubscribers = async () => {
    try {
      const response = await fetch(
        `/api/publications/${resolvedParams.slug}/subscribers?page=${pagination.page}&limit=${pagination.limit}`
      )
      
      if (!response.ok) {
        throw new Error("Failed to fetch subscribers")
      }

      const data = await response.json()
      setSubscribers(data.subscribers)
      setPagination(data.pagination)
    } catch (error) {
      console.error("Error fetching subscribers:", error)
      toast.error("Failed to load subscribers")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSubscriber = async (subscriberId: string) => {
    if (!confirm("Are you sure you want to delete this subscriber? This action cannot be undone.")) {
      return
    }

    setActionLoading(subscriberId)
    try {
      const response = await fetch(`/api/publications/${resolvedParams.slug}/subscribers/${subscriberId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete subscriber")
      }

      setSubscribers(prev => prev.filter(s => s.id !== subscriberId))
      toast.success("Subscriber deleted successfully")
    } catch (error) {
      console.error("Error deleting subscriber:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete subscriber")
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleStatus = async (subscriberId: string, isActive: boolean) => {
    setActionLoading(subscriberId)
    try {
      const response = await fetch(`/api/publications/${resolvedParams.slug}/subscribers/${subscriberId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update subscriber")
      }

      const { subscriber } = await response.json()
      setSubscribers(prev => prev.map(s => s.id === subscriberId ? subscriber : s))
      toast.success(`Subscriber ${isActive ? 'activated' : 'deactivated'} successfully`)
    } catch (error) {
      console.error("Error updating subscriber:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update subscriber")
    } finally {
      setActionLoading(null)
    }
  }

  const handleEditSubscriber = (subscriber: Subscriber) => {
    // TODO: Implement edit subscriber dialog
    toast.info("Edit subscriber feature coming soon")
  }

  const handleAddTag = (subscriberId: string, tag: string) => {
    // TODO: Implement add tag functionality
    toast.info("Add tag feature coming soon")
  }

  const handleRemoveTag = (subscriberId: string, tag: string) => {
    // TODO: Implement remove tag functionality
    toast.info("Remove tag feature coming soon")
  }

  const activeSubscribers = subscribers.filter(s => s.isActive)
  const totalSubscribers = pagination.total

  if (loading && subscribers.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading subscribers...</p>
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
          <h1 className="text-3xl font-bold">Subscribers</h1>
          <p className="text-muted-foreground">
            Manage your publication's subscribers and segments
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubscribers}</div>
            <p className="text-xs text-muted-foreground">
              All time subscribers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubscribers.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently subscribed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalSubscribers > 0 ? ((activeSubscribers.length / totalSubscribers) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Active vs total subscribers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Subscriber List</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Subscriber
          </Button>
        </div>
      </div>

      {/* Subscribers List */}
      <SubscriberList
        subscribers={subscribers}
        onEdit={handleEditSubscriber}
        onDelete={handleDeleteSubscriber}
        onToggleStatus={handleToggleStatus}
        onAddTag={handleAddTag}
        onRemoveTag={handleRemoveTag}
        loading={loading}
      />

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page === pagination.pages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}


