"use client"

import { Handle, Position } from "@xyflow/react"
import { Calendar, Mail, Settings, Users, Zap } from "lucide-react"
import { Card } from "@/components/ui/card"
import type { TriggerNodeData, TriggerType, TriggerConfig } from "@/lib/types/automation"

type TriggerNodeProps = {
  readonly data: TriggerNodeData
  readonly selected: boolean | undefined
}

/**
 * Gets the appropriate icon for a trigger type
 */
function getTriggerIcon(triggerType: TriggerType): React.ReactNode {
  switch (triggerType) {
    case "SUBSCRIBE":
      return <Users className="w-5 h-5" />
    case "UNSUBSCRIBE":
      return <Users className="w-5 h-5" />
    case "POST_PUBLISHED":
      return <Mail className="w-5 h-5" />
    case "COURSE_ENROLLED":
      return <Settings className="w-5 h-5" />
    default:
      return <Zap className="w-5 h-5" />
  }
}

/**
 * Gets the display label for a trigger type
 */
function getTriggerLabel(triggerType: TriggerType): string {
  switch (triggerType) {
    case "SUBSCRIBE":
      return "New Subscriber"
    case "UNSUBSCRIBE":
      return "Unsubscribe"
    case "POST_PUBLISHED":
      return "Post Published"
    case "COURSE_ENROLLED":
      return "Course Enrolled"
    case "TAG_ADDED":
      return "Tag Added"
    case "TAG_REMOVED":
      return "Tag Removed"
    case "TIER_CHANGED":
      return "Tier Changed"
    case "CUSTOM_DATE":
      return "Custom Date"
    case "FORM_SUBMITTED":
      return "Form Submitted"
    case "POST_VIEWED":
      return "Post Viewed"
    default:
      return triggerType
  }
}

/**
 * Gets the display label with configuration details
 */
function getTriggerDisplayLabel(data: TriggerNodeData): string {
  const baseLabel = getTriggerLabel(data.triggerType)
  
  if (data.config?.targetName) {
    // Handle special cases for subscription sources
    if (data.triggerType === "SUBSCRIBE" || data.triggerType === "UNSUBSCRIBE") {
      if (data.config.targetId === "publication") {
        return `${baseLabel} (Publication)`
      } else if (data.config.targetId === "course") {
        return `${baseLabel}: ${data.config.targetName}`
      } else if (data.config.targetId === "post") {
        return `${baseLabel}: ${data.config.targetName}`
      }
    }
    
    // Handle tag-based triggers
    if (data.triggerType === "TAG_ADDED" || data.triggerType === "TAG_REMOVED") {
      return `${baseLabel}: "${data.config.targetName}"`
    }
    
    // Handle tier changes
    if (data.triggerType === "TIER_CHANGED") {
      const fromTier = data.config.targetName || "Any"
      const toTier = data.config.targetId || "Any"
      return `${baseLabel}: ${fromTier} → ${toTier}`
    }
    
    return `${baseLabel}: ${data.config.targetName}`
  }
  
  if (data.config?.customDate) {
    return `${baseLabel}: ${new Date(data.config.customDate).toLocaleDateString()}`
  }
  
  if (data.config?.formId) {
    return `${baseLabel}: Form ${data.config.formId}`
  }
  
  return baseLabel
}

/**
 * Trigger node component for React Flow
 * Represents the starting point of an automation workflow
 */
export function TriggerNode({ data, selected }: TriggerNodeProps) {
  return (
    <Card
      className={`min-w-[200px] p-4 shadow-md transition-all ${
        selected ? "ring-2 ring-primary" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
          {getTriggerIcon(data.triggerType)}
        </div>
        <div className="flex-1">
          <div className="text-xs font-medium text-muted-foreground uppercase">
            Trigger
          </div>
          <div className="text-sm font-semibold">
            {getTriggerDisplayLabel(data)}
          </div>
        </div>
      </div>

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-primary !w-3 !h-3 !border-2 !border-background"
      />
    </Card>
  )
}

