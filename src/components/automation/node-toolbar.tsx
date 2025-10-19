"use client"

import { 
  Clock, 
  CreditCard, 
  Filter, 
  Mail, 
  Plus, 
  Tag, 
  X, 
  UserPlus, 
  UserMinus, 
  FileText, 
  GraduationCap,
  Calendar,
  FormInput,
  Eye
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

type NodeTemplate = {
  readonly type: string
  readonly label: string
  readonly icon: React.ReactNode
  readonly nodeData: {
    readonly type: "action" | "condition"
    readonly actionType: string | undefined
    readonly conditionType: string | undefined
    readonly label: string
    readonly config: undefined
  }
}

const actionNodes: readonly NodeTemplate[] = [
  {
    type: "action",
    label: "Send Email",
    icon: <Mail className="w-4 h-4" />,
    nodeData: {
      type: "action",
      actionType: "SEND_EMAIL",
      conditionType: undefined,
      label: "Send Email",
      config: undefined,
    },
  },
  {
    type: "action",
    label: "Add Tag",
    icon: <Plus className="w-4 h-4" />,
    nodeData: {
      type: "action",
      actionType: "ADD_TAG",
      conditionType: undefined,
      label: "Add Tag",
      config: undefined,
    },
  },
  {
    type: "action",
    label: "Remove Tag",
    icon: <X className="w-4 h-4" />,
    nodeData: {
      type: "action",
      actionType: "REMOVE_TAG",
      conditionType: undefined,
      label: "Remove Tag",
      config: undefined,
    },
  },
  {
    type: "action",
    label: "Wait",
    icon: <Clock className="w-4 h-4" />,
    nodeData: {
      type: "action",
      actionType: "WAIT",
      conditionType: undefined,
      label: "Wait",
      config: undefined,
    },
  },
] as const

const triggerNodes: readonly NodeTemplate[] = [
  {
    type: "trigger",
    label: "New Subscriber",
    icon: <UserPlus className="w-4 h-4" />,
    nodeData: {
      type: "trigger",
      actionType: undefined,
      conditionType: undefined,
      label: "New Subscriber",
      config: undefined,
    },
  },
  {
    type: "trigger",
    label: "Unsubscribe",
    icon: <UserMinus className="w-4 h-4" />,
    nodeData: {
      type: "trigger",
      actionType: undefined,
      conditionType: undefined,
      label: "Unsubscribe",
      config: undefined,
    },
  },
  {
    type: "trigger",
    label: "Post Published",
    icon: <FileText className="w-4 h-4" />,
    nodeData: {
      type: "trigger",
      actionType: undefined,
      conditionType: undefined,
      label: "Post Published",
      config: undefined,
    },
  },
  {
    type: "trigger",
    label: "Course Enrolled",
    icon: <GraduationCap className="w-4 h-4" />,
    nodeData: {
      type: "trigger",
      actionType: undefined,
      conditionType: undefined,
      label: "Course Enrolled",
      config: undefined,
    },
  },
  {
    type: "trigger",
    label: "Tag Added",
    icon: <Tag className="w-4 h-4" />,
    nodeData: {
      type: "trigger",
      actionType: undefined,
      conditionType: undefined,
      label: "Tag Added",
      config: undefined,
    },
  },
  {
    type: "trigger",
    label: "Tag Removed",
    icon: <X className="w-4 h-4" />,
    nodeData: {
      type: "trigger",
      actionType: undefined,
      conditionType: undefined,
      label: "Tag Removed",
      config: undefined,
    },
  },
  {
    type: "trigger",
    label: "Tier Changed",
    icon: <CreditCard className="w-4 h-4" />,
    nodeData: {
      type: "trigger",
      actionType: undefined,
      conditionType: undefined,
      label: "Tier Changed",
      config: undefined,
    },
  },
  {
    type: "trigger",
    label: "Custom Date",
    icon: <Calendar className="w-4 h-4" />,
    nodeData: {
      type: "trigger",
      actionType: undefined,
      conditionType: undefined,
      label: "Custom Date",
      config: undefined,
    },
  },
  {
    type: "trigger",
    label: "Form Submitted",
    icon: <FormInput className="w-4 h-4" />,
    nodeData: {
      type: "trigger",
      actionType: undefined,
      conditionType: undefined,
      label: "Form Submitted",
      config: undefined,
    },
  },
  {
    type: "trigger",
    label: "Post Viewed",
    icon: <Eye className="w-4 h-4" />,
    nodeData: {
      type: "trigger",
      actionType: undefined,
      conditionType: undefined,
      label: "Post Viewed",
      config: undefined,
    },
  },
] as const

const conditionNodes: readonly NodeTemplate[] = [
  {
    type: "condition",
    label: "Has Tag",
    icon: <Tag className="w-4 h-4" />,
    nodeData: {
      type: "condition",
      actionType: undefined,
      conditionType: "HAS_TAG",
      label: "Has Tag",
      config: undefined,
    },
  },
  {
    type: "condition",
    label: "Subscription Tier",
    icon: <CreditCard className="w-4 h-4" />,
    nodeData: {
      type: "condition",
      actionType: undefined,
      conditionType: "SUBSCRIPTION_TIER",
      label: "Subscription Tier",
      config: undefined,
    },
  },
  {
    type: "condition",
    label: "Custom Field",
    icon: <Filter className="w-4 h-4" />,
    nodeData: {
      type: "condition",
      actionType: undefined,
      conditionType: "CUSTOM_FIELD",
      label: "Custom Field",
      config: undefined,
    },
  },
] as const

type NodeToolbarProps = {
  readonly onAddNode: (nodeData: NodeTemplate["nodeData"]) => void
}

/**
 * Node toolbar component that displays available nodes
 * Users can click to add nodes to the workflow
 */
export function NodeToolbar({ onAddNode }: NodeToolbarProps) {
  return (
    <Card className="w-64 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Add Nodes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Triggers Section */}
        <div>
          <h3 className="text-xs font-medium text-muted-foreground uppercase mb-2">
            Triggers
          </h3>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {triggerNodes.map((node) => (
              <button
                key={node.label}
                type="button"
                onClick={() => onAddNode(node.nodeData)}
                className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-accent transition-colors text-sm"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded bg-blue-500/10 text-blue-500">
                  {node.icon}
                </div>
                <span className="flex-1 text-left">{node.label}</span>
              </button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Actions Section */}
        <div>
          <h3 className="text-xs font-medium text-muted-foreground uppercase mb-2">
            Actions
          </h3>
          <div className="space-y-1">
            {actionNodes.map((node) => (
              <button
                key={node.label}
                type="button"
                onClick={() => onAddNode(node.nodeData)}
                className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-accent transition-colors text-sm"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded bg-primary/10 text-primary">
                  {node.icon}
                </div>
                <span className="flex-1 text-left">{node.label}</span>
              </button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Conditions Section */}
        <div>
          <h3 className="text-xs font-medium text-muted-foreground uppercase mb-2">
            Conditions
          </h3>
          <div className="space-y-1">
            {conditionNodes.map((node) => (
              <button
                key={node.label}
                type="button"
                onClick={() => onAddNode(node.nodeData)}
                className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-accent transition-colors text-sm"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded bg-purple-500/10 text-purple-500">
                  {node.icon}
                </div>
                <span className="flex-1 text-left">{node.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-muted-foreground pt-2">
          <p>Click on a node to add it to the workflow canvas.</p>
        </div>
      </CardContent>
    </Card>
  )
}

