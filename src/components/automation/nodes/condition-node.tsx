"use client"

import { Handle, Position } from "@xyflow/react"
import { CreditCard, Filter, Tag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import type { ConditionNodeData, ConditionType } from "@/lib/types/automation"

type ConditionNodeProps = {
  readonly data: ConditionNodeData
  readonly selected: boolean | undefined
}

/**
 * Gets the appropriate icon for a condition type
 */
function getConditionIcon(conditionType: ConditionType): React.ReactNode {
  switch (conditionType) {
    case "HAS_TAG":
      return <Tag className="w-5 h-5" />
    case "SUBSCRIPTION_TIER":
      return <CreditCard className="w-5 h-5" />
    case "CUSTOM_FIELD":
      return <Filter className="w-5 h-5" />
    default:
      return <Filter className="w-5 h-5" />
  }
}

/**
 * Gets the display label for a condition type
 */
function getConditionLabel(conditionType: ConditionType): string {
  switch (conditionType) {
    case "HAS_TAG":
      return "Has Tag"
    case "SUBSCRIPTION_TIER":
      return "Subscription Tier"
    case "CUSTOM_FIELD":
      return "Custom Field"
    default:
      return conditionType
  }
}

/**
 * Condition node component for React Flow
 * Represents a branching condition in the automation workflow
 */
export function ConditionNode({ data, selected }: ConditionNodeProps) {
  const isConfigured = data.config !== undefined

  return (
    <Card
      className={`min-w-[220px] p-4 shadow-md transition-all ${
        selected ? "ring-2 ring-primary" : ""
      } ${!isConfigured ? "border-dashed border-yellow-500" : ""}`}
    >
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-primary !w-3 !h-3 !border-2 !border-background"
      />

      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-500/10 text-purple-500">
          {getConditionIcon(data.conditionType)}
        </div>
        <div className="flex-1">
          <div className="text-xs font-medium text-muted-foreground uppercase">
            Condition
          </div>
          <div className="text-sm font-semibold">
            {getConditionLabel(data.conditionType)}
          </div>
          {!isConfigured && (
            <Badge variant="outline" className="mt-1 text-xs">
              Not configured
            </Badge>
          )}
        </div>
      </div>

      {/* Branch indicators */}
      <div className="flex justify-between text-xs text-muted-foreground px-1">
        <span className="text-green-600 font-medium">Yes</span>
        <span className="text-red-600 font-medium">No</span>
      </div>

      {/* Output handles - True (left) and False (right) */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        className="!bg-green-500 !w-3 !h-3 !border-2 !border-background !left-[25%]"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        className="!bg-red-500 !w-3 !h-3 !border-2 !border-background !left-[75%]"
      />
    </Card>
  )
}

