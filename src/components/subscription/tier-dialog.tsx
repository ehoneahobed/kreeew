"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
import { toast } from "sonner"

interface SubscriptionTier {
  id?: string
  name: string
  description?: string
  price: number
  features?: string[]
  isActive: boolean
}

interface TierDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tier?: SubscriptionTier | null
  onSave: (tier: Omit<SubscriptionTier, 'id'>) => void
  loading?: boolean
}

export function TierDialog({ open, onOpenChange, tier, onSave, loading = false }: TierDialogProps) {
  const [formData, setFormData] = useState<Omit<SubscriptionTier, 'id'>>({
    name: "",
    description: "",
    price: 0,
    features: [],
    isActive: true,
  })
  const [newFeature, setNewFeature] = useState("")

  useEffect(() => {
    if (tier) {
      setFormData({
        name: tier.name,
        description: tier.description || "",
        price: tier.price,
        features: tier.features || [],
        isActive: tier.isActive,
      })
    } else {
      setFormData({
        name: "",
        description: "",
        price: 0,
        features: [],
        isActive: true,
      })
    }
  }, [tier])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error("Tier name is required")
      return
    }

    onSave(formData)
  }

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...(prev.features || []), newFeature.trim()]
      }))
      setNewFeature("")
    }
  }

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features?.filter((_, i) => i !== index) || []
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addFeature()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {tier ? "Edit Subscription Tier" : "Create Subscription Tier"}
          </DialogTitle>
          <DialogDescription>
            {tier 
              ? "Update the subscription tier details below."
              : "Create a new subscription tier for your publication."
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Tier Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Premium, Pro, Basic"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this tier includes..."
              rows={3}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="price">Price (in cents)</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="1"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
              placeholder="0 for free tier, 999 for $9.99"
            />
            <p className="text-xs text-muted-foreground">
              Enter price in cents (e.g., 999 = $9.99)
            </p>
          </div>

          <div className="grid gap-2">
            <Label>Features</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a feature..."
                />
                <Button type="button" onClick={addFeature} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {formData.features && formData.features.length > 0 && (
                <div className="space-y-1">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Badge variant="secondary" className="flex-1 justify-start">
                        {feature}
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFeature(index)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: !!checked }))}
            />
            <Label htmlFor="isActive">Active tier</Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : tier ? "Update Tier" : "Create Tier"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


