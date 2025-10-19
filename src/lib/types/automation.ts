import type { Node, Edge } from "@xyflow/react"

/**
 * Available trigger types for automation workflows
 */
export const TRIGGER_TYPES = {
  SUBSCRIBE: "SUBSCRIBE",
  UNSUBSCRIBE: "UNSUBSCRIBE",
  POST_PUBLISHED: "POST_PUBLISHED",
  COURSE_ENROLLED: "COURSE_ENROLLED",
  TAG_ADDED: "TAG_ADDED",
  TAG_REMOVED: "TAG_REMOVED",
  TIER_CHANGED: "TIER_CHANGED",
  CUSTOM_DATE: "CUSTOM_DATE",
  FORM_SUBMITTED: "FORM_SUBMITTED",
  POST_VIEWED: "POST_VIEWED",
} as const

export type TriggerType = keyof typeof TRIGGER_TYPES

/**
 * Available action types for workflow nodes
 */
export const ACTION_TYPES = {
  SEND_EMAIL: "SEND_EMAIL",
  ADD_TAG: "ADD_TAG",
  REMOVE_TAG: "REMOVE_TAG",
  WAIT: "WAIT",
} as const

export type ActionType = keyof typeof ACTION_TYPES

/**
 * Available condition types for branching logic
 */
export const CONDITION_TYPES = {
  HAS_TAG: "HAS_TAG",
  SUBSCRIPTION_TIER: "SUBSCRIPTION_TIER",
  CUSTOM_FIELD: "CUSTOM_FIELD",
} as const

export type ConditionType = keyof typeof CONDITION_TYPES

/**
 * Node type discriminator for workflow nodes
 */
export const NODE_TYPES = {
  TRIGGER: "trigger",
  ACTION: "action",
  CONDITION: "condition",
} as const

export type WorkflowNodeType = (typeof NODE_TYPES)[keyof typeof NODE_TYPES]

/**
 * Personalization variable definition
 */
export type PersonalizationVariable = {
  readonly key: string
  readonly label: string
  readonly description: string
  readonly example: string
}

/**
 * Configuration for email send action
 */
export type SendEmailConfig = {
  readonly templateId: string | undefined
  readonly subject: string
  readonly content: string
  readonly personalization?: Record<string, string>
}

/**
 * Configuration for tag manipulation actions
 */
export type TagConfig = {
  readonly tagIds: readonly string[]
}

/**
 * Configuration for wait/delay action
 */
export type WaitConfig = {
  readonly delayMinutes: number
  readonly delayUnit: "minutes" | "hours" | "days"
}

/**
 * Configuration for has tag condition
 */
export type HasTagConditionConfig = {
  readonly tagId: string
  readonly hasTag: boolean
}

/**
 * Configuration for subscription tier condition
 */
export type SubscriptionTierConditionConfig = {
  readonly tierId: string
}

/**
 * Configuration for custom field condition
 */
export type CustomFieldConditionConfig = {
  readonly fieldName: string
  readonly operator: "equals" | "contains" | "greater_than" | "less_than"
  readonly value: string
}

/**
 * Union type for all condition configurations
 */
export type ConditionConfig =
  | HasTagConditionConfig
  | SubscriptionTierConditionConfig
  | CustomFieldConditionConfig

/**
 * Union type for all action configurations
 */
export type ActionConfig = SendEmailConfig | TagConfig | WaitConfig

/**
 * Configuration for trigger nodes
 */
export type TriggerConfig = {
  readonly targetId?: string // ID of specific course, post, etc.
  readonly targetName?: string // Display name of the target
  readonly customDate?: string // For CUSTOM_DATE triggers
  readonly formId?: string // For FORM_SUBMITTED triggers
}

/**
 * Data structure for trigger nodes
 */
export type TriggerNodeData = {
  readonly type: "trigger"
  readonly triggerType: TriggerType
  readonly label: string
  readonly config?: TriggerConfig
}

/**
 * Data structure for action nodes
 */
export type ActionNodeData = {
  readonly type: "action"
  readonly actionType: ActionType
  readonly label: string
  readonly config: ActionConfig | undefined
}

/**
 * Data structure for condition nodes
 */
export type ConditionNodeData = {
  readonly type: "condition"
  readonly conditionType: ConditionType
  readonly label: string
  readonly config: ConditionConfig | undefined
}

/**
 * Union type for all node data types
 */
export type WorkflowNodeData =
  | TriggerNodeData
  | ActionNodeData
  | ConditionNodeData

/**
 * Custom node type extending React Flow's Node
 */
export type WorkflowNode = Node<WorkflowNodeData>

/**
 * Custom edge type extending React Flow's Edge
 */
export type WorkflowEdge = Edge & {
  readonly label: string | undefined
  readonly animated: boolean | undefined
}

/**
 * Complete workflow definition
 */
export type WorkflowDefinition = {
  readonly nodes: readonly WorkflowNode[]
  readonly edges: readonly WorkflowEdge[]
}

/**
 * Workflow status
 */
export const WORKFLOW_STATUS = {
  ACTIVE: "ACTIVE",
  PAUSED: "PAUSED",
  DRAFT: "DRAFT",
  ARCHIVED: "ARCHIVED",
} as const

export type WorkflowStatus = keyof typeof WORKFLOW_STATUS

/**
 * Complete automation workflow with metadata
 */
export type AutomationWorkflow = {
  readonly id: string
  readonly publicationId: string
  readonly name: string
  readonly description?: string
  readonly trigger: TriggerType
  readonly status: WorkflowStatus
  readonly isActive: boolean
  readonly definition: WorkflowDefinition
  readonly createdAt: string
  readonly updatedAt: string
}

