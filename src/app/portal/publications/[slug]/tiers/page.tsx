"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TierCard } from "@/components/subscription/tier-card"
import { TierDialog } from "@/components/subscription/tier-dialog"
import { 
  Plus, 
  ArrowLeft, 
  DollarSign,
  Users,
  TrendingUp
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface SubscriptionTier {
  id: string
  name: string
  description?: string
  price: number
  features?: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface TiersPageProps {
  params: Promise<{
    slug: string
  }>
}

export default function TiersPage({ params }: TiersPageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [tiers, setTiers] = useState<SubscriptionTier[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTier, setEditingTier] = useState<SubscriptionTier | null>(null)

  useEffect(() => {
    fetchTiers()
  }, [resolvedParams.slug])

  const fetchTiers = async () => {
    try {
      const response = await fetch(`/api/publications/${resolvedParams.slug}/tiers`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch tiers")
      }

      const data = await response.json()
      setTiers(data.tiers)
    } catch (error) {
      console.error("Error fetching tiers:", error)
      toast.error("Failed to load subscription tiers")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTier = () => {
    setEditingTier(null)
    setDialogOpen(true)
  }

  const handleEditTier = (tier: SubscriptionTier) => {
    setEditingTier(tier)
    setDialogOpen(true)
  }

  const handleSaveTier = async (tierData: Omit<SubscriptionTier, 'id'>) => {
    setActionLoading("save")
    try {
      const url = editingTier 
        ? `/api/publications/${resolvedParams.slug}/tiers/${editingTier.id}`
        : `/api/publications/${resolvedParams.slug}/tiers`
      
      const method = editingTier ? "PUT" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tierData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save tier")
      }

      const { tier } = await response.json()
      
      if (editingTier) {
        setTiers(prev => prev.map(t => t.id === editingTier.id ? tier : t))
        toast.success("Tier updated successfully")
      } else {
        setTiers(prev => [...prev, tier])
        toast.success("Tier created successfully")
      }
      
      setDialogOpen(false)
      setEditingTier(null)
    } catch (error) {
      console.error("Error saving tier:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save tier")
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteTier = async (tierId: string) => {
    if (!confirm("Are you sure you want to delete this tier? This action cannot be undone.")) {
      return
    }

    setActionLoading(tierId)
    try {
      const response = await fetch(`/api/publications/${resolvedParams.slug}/tiers/${tierId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete tier")
      }

      setTiers(prev => prev.filter(t => t.id !== tierId))
      toast.success("Tier deleted successfully")
    } catch (error) {
      console.error("Error deleting tier:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete tier")
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleActive = async (tierId: string, isActive: boolean) => {
    setActionLoading(tierId)
    try {
      const response = await fetch(`/api/publications/${resolvedParams.slug}/tiers/${tierId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update tier")
      }

      const { tier } = await response.json()
      setTiers(prev => prev.map(t => t.id === tierId ? tier : t))
      toast.success(`Tier ${isActive ? 'activated' : 'deactivated'} successfully`)
    } catch (error) {
      console.error("Error updating tier:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update tier")
    } finally {
      setActionLoading(null)
    }
  }

  const activeTiers = tiers.filter(tier => tier.isActive)
  const totalRevenue = activeTiers.reduce((sum, tier) => sum + tier.price, 0)

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading subscription tiers...</p>
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
          <h1 className="text-3xl font-bold">Subscription Tiers</h1>
          <p className="text-muted-foreground">
            Manage your publication's subscription plans and pricing
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tiers</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tiers.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeTiers.length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tiers</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTiers.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(totalRevenue / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per month potential
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tiers List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Subscription Tiers</h2>
          <Button onClick={handleCreateTier}>
            <Plus className="w-4 h-4 mr-2" />
            Create Tier
          </Button>
        </div>

        {tiers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <DollarSign className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No subscription tiers yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first subscription tier to start monetizing your content.
              </p>
              <Button onClick={handleCreateTier}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Tier
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tiers.map((tier) => (
              <TierCard
                key={tier.id}
                tier={tier}
                onEdit={handleEditTier}
                onDelete={handleDeleteTier}
                onToggleActive={handleToggleActive}
              />
            ))}
          </div>
        )}
      </div>

      {/* Tier Dialog */}
      <TierDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tier={editingTier}
        onSave={handleSaveTier}
        loading={actionLoading === "save"}
      />
    </div>
  )
}


