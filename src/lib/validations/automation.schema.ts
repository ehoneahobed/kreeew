import { z } from "zod"
import {
  ACTION_TYPES,
  CONDITION_TYPES,
  NODE_TYPES,
  TRIGGER_TYPES,
  WORKFLOW_STATUS,
} from "@/lib/types/automation"

/**
 * Schema for email send action configuration
 */
const sendEmailConfigSchema = z.object({
  templateId: z.string().optional(),
  subject: z.string().min(1, "Subject is required"),
  content: z.string().min(1, "Content is required"),
  personalization: z.record(z.string()).optional(),
})

/**
 * Schema for tag manipulation configuration
 */
const tagConfigSchema = z.object({
  tagIds: z.array(z.string()).min(1, "At least one tag is required"),
})

/**
 * Schema for wait/delay configuration
 */
const waitConfigSchema = z.object({
  delayMinutes: z.number().min(1, "Delay must be at least 1 minute"),
  delayUnit: z.enum(["minutes", "hours", "days"]),
})

/**
 * Schema for has tag condition
 */
const hasTagConditionSchema = z.object({
  tagId: z.string().min(1, "Tag is required"),
  hasTag: z.boolean(),
})

/**
 * Schema for subscription tier condition
 */
const subscriptionTierConditionSchema = z.object({
  tierId: z.string().min(1, "Tier is required"),
})

/**
 * Schema for custom field condition
 */
const customFieldConditionSchema = z.object({
  fieldName: z.string().min(1, "Field name is required"),
  operator: z.enum(["equals", "contains", "greater_than", "less_than"]),
  value: z.string().min(1, "Value is required"),
})

/**
 * Schema for node position
 */
const positionSchema = z.object({
  x: z.number(),
  y: z.number(),
})

/**
 * Schema for trigger configuration
 */
const triggerConfigSchema = z.object({
  targetId: z.string().optional(),
  targetName: z.string().optional(),
  customDate: z.string().optional(),
  formId: z.string().optional(),
})

/**
 * Schema for trigger node data
 */
const triggerNodeDataSchema = z.object({
  type: z.literal(NODE_TYPES.TRIGGER),
  triggerType: z.enum([
    TRIGGER_TYPES.SUBSCRIBE,
    TRIGGER_TYPES.UNSUBSCRIBE,
    TRIGGER_TYPES.POST_PUBLISHED,
    TRIGGER_TYPES.COURSE_ENROLLED,
    TRIGGER_TYPES.TAG_ADDED,
    TRIGGER_TYPES.TAG_REMOVED,
    TRIGGER_TYPES.TIER_CHANGED,
    TRIGGER_TYPES.CUSTOM_DATE,
    TRIGGER_TYPES.FORM_SUBMITTED,
    TRIGGER_TYPES.POST_VIEWED,
  ]),
  label: z.string(),
  config: triggerConfigSchema.optional(),
})

/**
 * Schema for action node data
 */
const actionNodeDataSchema = z.object({
  type: z.literal(NODE_TYPES.ACTION),
  actionType: z.enum([
    ACTION_TYPES.SEND_EMAIL,
    ACTION_TYPES.ADD_TAG,
    ACTION_TYPES.REMOVE_TAG,
    ACTION_TYPES.WAIT,
  ]),
  label: z.string(),
  config: z
    .union([sendEmailConfigSchema, tagConfigSchema, waitConfigSchema])
    .optional(),
})

/**
 * Schema for condition node data
 */
const conditionNodeDataSchema = z.object({
  type: z.literal(NODE_TYPES.CONDITION),
  conditionType: z.enum([
    CONDITION_TYPES.HAS_TAG,
    CONDITION_TYPES.SUBSCRIPTION_TIER,
    CONDITION_TYPES.CUSTOM_FIELD,
  ]),
  label: z.string(),
  config: z
    .union([
      hasTagConditionSchema,
      subscriptionTierConditionSchema,
      customFieldConditionSchema,
    ])
    .optional(),
})

/**
 * Schema for workflow node
 */
export const workflowNodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  position: positionSchema,
  data: z.union([
    triggerNodeDataSchema,
    actionNodeDataSchema,
    conditionNodeDataSchema,
  ]),
  measured: z
    .object({
      width: z.number().optional(),
      height: z.number().optional(),
    })
    .optional(),
  selected: z.boolean().optional(),
  dragging: z.boolean().optional(),
})

/**
 * Schema for workflow edge
 */
export const workflowEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
  label: z.string().optional(),
  animated: z.boolean().optional(),
  type: z.string().optional(),
})

/**
 * Schema for workflow definition
 */
export const workflowDefinitionSchema = z.object({
  nodes: z.array(workflowNodeSchema),
  edges: z.array(workflowEdgeSchema),
})

/**
 * Schema for creating a new workflow
 */
export const createWorkflowSchema = z.object({
  name: z.string().min(1, "Workflow name is required").max(100),
  description: z.string().max(500).optional(),
  trigger: z.enum([
    TRIGGER_TYPES.SUBSCRIBE,
    TRIGGER_TYPES.UNSUBSCRIBE,
    TRIGGER_TYPES.POST_PUBLISHED,
    TRIGGER_TYPES.COURSE_ENROLLED,
    TRIGGER_TYPES.TAG_ADDED,
    TRIGGER_TYPES.TAG_REMOVED,
    TRIGGER_TYPES.TIER_CHANGED,
    TRIGGER_TYPES.CUSTOM_DATE,
    TRIGGER_TYPES.FORM_SUBMITTED,
    TRIGGER_TYPES.POST_VIEWED,
  ]),
  triggerConfig: triggerConfigSchema.optional(),
})

/**
 * Schema for updating a workflow
 */
export const updateWorkflowSchema = z.object({
  name: z.string().min(1, "Workflow name is required").max(100).optional(),
  description: z.string().max(500).optional(),
  status: z
    .enum([
      WORKFLOW_STATUS.ACTIVE,
      WORKFLOW_STATUS.PAUSED,
      WORKFLOW_STATUS.DRAFT,
      WORKFLOW_STATUS.ARCHIVED,
    ])
    .optional(),
  trigger: z
    .enum([
      TRIGGER_TYPES.SUBSCRIBE,
      TRIGGER_TYPES.UNSUBSCRIBE,
      TRIGGER_TYPES.POST_PUBLISHED,
      TRIGGER_TYPES.COURSE_ENROLLED,
      TRIGGER_TYPES.TAG_ADDED,
      TRIGGER_TYPES.TAG_REMOVED,
      TRIGGER_TYPES.TIER_CHANGED,
      TRIGGER_TYPES.CUSTOM_DATE,
      TRIGGER_TYPES.FORM_SUBMITTED,
      TRIGGER_TYPES.POST_VIEWED,
    ])
    .optional(),
  triggerConfig: triggerConfigSchema.optional(),
})

/**
 * Schema for updating workflow steps
 */
export const updateWorkflowStepsSchema = z.object({
  definition: workflowDefinitionSchema,
})

export type CreateWorkflowInput = z.infer<typeof createWorkflowSchema>
export type UpdateWorkflowInput = z.infer<typeof updateWorkflowSchema>
export type UpdateWorkflowStepsInput = z.infer<typeof updateWorkflowStepsSchema>

