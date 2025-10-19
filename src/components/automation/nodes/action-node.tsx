"use client"

import { Handle, Position } from "@xyflow/react"
import { Clock, Mail, Plus, Tag, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import type { ActionNodeData, ActionType } from "@/lib/types/automation"

type ActionNodeProps = {
  readonly data: ActionNodeData
  readonly selected: boolean | undefined
}

/**
 * Gets the appropriate icon for an action type
 */
function getActionIcon(actionType: ActionType): React.ReactNode {
  switch (actionType) {
    case "SEND_EMAIL":
      return <Mail className="w-5 h-5" />
    case "ADD_TAG":
      return <Plus className="w-5 h-5" />
    case "REMOVE_TAG":
      return <X className="w-5 h-5" />
    case "WAIT":
      return <Clock className="w-5 h-5" />
    default:
      return <Tag className="w-5 h-5" />
  }
}

/**
 * Gets the display label for an action type
 */
function getActionLabel(actionType: ActionType): string {
  switch (actionType) {
    case "SEND_EMAIL":
      return "Send Email"
    case "ADD_TAG":
      return "Add Tag"
    case "REMOVE_TAG":
      return "Remove Tag"
    case "WAIT":
      return "Wait"
    default:
      return actionType
  }
}

/**
 * Gets the color variant for an action type
 */
function getActionColor(actionType: ActionType): string {
  switch (actionType) {
    case "SEND_EMAIL":
      return "bg-blue-500/10 text-blue-500"
    case "ADD_TAG":
      return "bg-green-500/10 text-green-500"
    case "REMOVE_TAG":
      return "bg-red-500/10 text-red-500"
    case "WAIT":
      return "bg-amber-500/10 text-amber-500"
    default:
      return "bg-gray-500/10 text-gray-500"
  }
}

/**
 * Action node component for React Flow
 * Represents an action in the automation workflow
 */
export function ActionNode({ data, selected }: ActionNodeProps) {
  const isConfigured = data.config !== undefined

  return (
    <Card
      className={`min-w-[200px] p-4 shadow-md transition-all cursor-pointer ${
        selected ? "ring-2 ring-primary" : ""
      } ${!isConfigured ? "border-dashed border-yellow-500" : ""}`}
    >
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-primary !w-3 !h-3 !border-2 !border-background"
      />

      <div className="flex items-center gap-3">
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-full ${getActionColor(data.actionType)}`}
        >
          {getActionIcon(data.actionType)}
        </div>
        <div className="flex-1">
          <div className="text-xs font-medium text-muted-foreground uppercase">
            Action
          </div>
          <div className="text-sm font-semibold">
            {getActionLabel(data.actionType)}
          </div>
          {!isConfigured && (
            <Badge variant="outline" className="mt-1 text-xs">
              Not configured
            </Badge>
          )}
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

