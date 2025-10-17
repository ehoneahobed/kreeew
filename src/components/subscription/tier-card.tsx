"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Edit, 
  Trash2, 
  Check, 
  X,
  DollarSign,
  Users
} from "lucide-react"

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

interface TierCardProps {
  tier: SubscriptionTier
  onEdit: (tier: SubscriptionTier) => void
  onDelete: (tierId: string) => void
  onToggleActive: (tierId: string, isActive: boolean) => void
}

export function TierCard({ tier, onEdit, onDelete, onToggleActive }: TierCardProps) {
  const formatPrice = (price: number) => {
    if (price === 0) return "Free"
    return `$${(price / 100).toFixed(2)}`
  }

  return (
    <Card className={`${tier.isActive ? 'border-primary' : 'border-muted'}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {tier.name}
              <Badge variant={tier.isActive ? "default" : "secondary"}>
                {tier.isActive ? "Active" : "Inactive"}
              </Badge>
            </CardTitle>
            {tier.description && (
              <CardDescription className="mt-1">
                {tier.description}
              </CardDescription>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleActive(tier.id, !tier.isActive)}
            >
              {tier.isActive ? (
                <X className="w-4 h-4" />
              ) : (
                <Check className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(tier)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(tier.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span className="text-2xl font-bold">{formatPrice(tier.price)}</span>
            <span className="text-sm text-muted-foreground">per month</span>
          </div>

          {tier.features && tier.features.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Features</h4>
              <ul className="space-y-1">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-3 h-3 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-2 border-t">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="w-3 h-3" />
              <span>0 subscribers</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


