"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EmailEditor } from "./email-editor"
import { EmailPreviewModal } from "./email-preview-modal"
import type { WorkflowNode, WorkflowNodeData, TriggerConfig } from "@/lib/types/automation"

type NodePropertiesPanelProps = {
  readonly node: WorkflowNode | undefined
  readonly onUpdateNode: (
    nodeId: string,
    data: Partial<WorkflowNodeData>
  ) => void
  readonly onClose: () => void
  readonly publicationSlug?: string
  readonly workflowId?: string
}

/**
 * Node properties panel component
 * Displays configuration forms for selected nodes
 */
export function NodePropertiesPanel({
  node,
  onUpdateNode,
  onClose,
  publicationSlug,
  workflowId,
}: NodePropertiesPanelProps) {
  if (!node) {
    return (
      <Card className="w-80 shadow-lg">
        <CardHeader>
          <CardTitle className="text-sm">Node Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Select a node to view its properties
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-80 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Node Properties</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} type="button">
            ✕
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {node.data.type === "trigger" && (
          <TriggerProperties 
            node={node} 
            onUpdateNode={onUpdateNode}
            publicationSlug={publicationSlug}
          />
        )}
        {node.data.type === "action" && (
          <ActionProperties 
            node={node} 
            onUpdateNode={onUpdateNode}
            publicationSlug={publicationSlug}
            workflowId={workflowId}
          />
        )}
        {node.data.type === "condition" && (
          <ConditionProperties node={node} onUpdateNode={onUpdateNode} />
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Properties form for trigger nodes (configurable)
 */
function TriggerProperties({ 
  node, 
  onUpdateNode,
  publicationSlug 
}: { 
  readonly node: WorkflowNode
  readonly onUpdateNode: (
    nodeId: string,
    data: Partial<WorkflowNodeData>
  ) => void
  readonly publicationSlug?: string
}) {
  if (node.data.type !== "trigger") return null

  const [courses, setCourses] = useState<Array<{ id: string; title: string }>>([])
  const [posts, setPosts] = useState<Array<{ id: string; title: string; slug: string }>>([])
  const [loading, setLoading] = useState(false)
  const [config, setConfig] = useState<TriggerConfig>(node.data.config || {})

  // Update config when node changes
  useEffect(() => {
    setConfig(node.data.config || {})
  }, [node.data.config])

  // Load courses and posts when component mounts
  useEffect(() => {
    if (publicationSlug) {
      loadCoursesAndPosts()
    }
  }, [publicationSlug])

  const loadCoursesAndPosts = async () => {
    if (!publicationSlug) return

    setLoading(true)
    try {
      const [coursesRes, postsRes] = await Promise.all([
        fetch(`/api/publications/${publicationSlug}/courses`),
        fetch(`/api/publications/${publicationSlug}/posts`)
      ])

      if (coursesRes.ok) {
        const coursesData = await coursesRes.json()
        setCourses(coursesData.courses || [])
      }

      if (postsRes.ok) {
        const postsData = await postsRes.json()
        setPosts(postsData.posts || [])
      }
    } catch (error) {
      console.error("Error loading courses and posts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleConfigChange = (newConfig: Partial<TriggerConfig>) => {
    const updatedConfig = { ...config, ...newConfig }
    setConfig(updatedConfig)
    onUpdateNode(node.id, {
      ...node.data,
      config: updatedConfig,
    })
  }

  const getTriggerDescription = () => {
    switch (node.data.triggerType) {
      case "SUBSCRIBE":
        return "Triggers when someone subscribes to your publication, a specific course, or a specific post"
      case "UNSUBSCRIBE":
        return "Triggers when someone unsubscribes from your publication, a specific course, or a specific post"
      case "POST_PUBLISHED":
        return "Triggers when a specific post is published"
      case "COURSE_ENROLLED":
        return "Triggers when someone enrolls in a specific course"
      case "TAG_ADDED":
        return "Triggers when a specific tag is added to a subscriber"
      case "TAG_REMOVED":
        return "Triggers when a specific tag is removed from a subscriber"
      case "TIER_CHANGED":
        return "Triggers when a subscriber's subscription tier changes (optionally from/to specific tiers)"
      case "CUSTOM_DATE":
        return "Triggers on a specific date (e.g., birthday, anniversary)"
      case "FORM_SUBMITTED":
        return "Triggers when a subscriber submits a specific form"
      case "POST_VIEWED":
        return "Triggers when a subscriber views a specific post"
      default:
        return "Configure what triggers this workflow"
    }
  }

  const renderTriggerConfiguration = () => {
    const triggerType = node.data.triggerType?.trim()
    
    switch (triggerType) {
      case "SUBSCRIBE":
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Subscription Source</Label>
              <Select
                value={config.targetId || "publication"}
                onValueChange={(value) => {
                  const sourceName = value === "publication" ? "Publication" : 
                                   value === "course" ? "Course" : 
                                   value === "post" ? "Post" : "Publication"
                  handleConfigChange({
                    targetId: value,
                    targetName: sourceName
                  })
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select subscription source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="publication">Publication (General)</SelectItem>
                  <SelectItem value="course">Specific Course</SelectItem>
                  <SelectItem value="post">Specific Post</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {config.targetId === "course" && (
              <div>
                <Label className="text-xs">Course</Label>
                <Select
                  value={config.selectedId || ""}
                  onValueChange={(value) => {
                    const course = courses.find(c => c.id === value)
                    handleConfigChange({
                      selectedId: value,
                      targetName: course?.title
                    })
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {config.targetId === "post" && (
              <div>
                <Label className="text-xs">Post</Label>
                <Select
                  value={config.selectedId || ""}
                  onValueChange={(value) => {
                    const post = posts.find(p => p.id === value)
                    handleConfigChange({
                      selectedId: value,
                      targetName: post?.title
                    })
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a post" />
                  </SelectTrigger>
                  <SelectContent>
                    {posts.map((post) => (
                      <SelectItem key={post.id} value={post.id}>
                        {post.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )

      case "UNSUBSCRIBE":
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Unsubscribe Source</Label>
              <Select
                value={config.targetId || "publication"}
                onValueChange={(value) => {
                  const sourceName = value === "publication" ? "Publication" : 
                                   value === "course" ? "Course" : 
                                   value === "post" ? "Post" : "Publication"
                  handleConfigChange({
                    targetId: value,
                    targetName: sourceName
                  })
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select unsubscribe source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="publication">Publication (General)</SelectItem>
                  <SelectItem value="course">Specific Course</SelectItem>
                  <SelectItem value="post">Specific Post</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case "COURSE_ENROLLED":
        return (
          <div>
            <Label className="text-xs">Course</Label>
            <Select
              value={config.targetId || ""}
              onValueChange={(value) => {
                const course = courses.find(c => c.id === value)
                handleConfigChange({
                  targetId: value,
                  targetName: course?.title
                })
              }}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      case "POST_PUBLISHED":
      case "POST_VIEWED":
        return (
          <div>
            <Label className="text-xs">Post</Label>
            <Select
              value={config.targetId || ""}
              onValueChange={(value) => {
                const post = posts.find(p => p.id === value)
                handleConfigChange({
                  targetId: value,
                  targetName: post?.title
                })
              }}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a post" />
              </SelectTrigger>
              <SelectContent>
                {posts.map((post) => (
                  <SelectItem key={post.id} value={post.id}>
                    {post.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      case "TAG_ADDED":
      case "TAG_REMOVED":
        return (
          <div>
            <Label className="text-xs">Tag Name</Label>
            <Input
              value={config.targetName || ""}
              onChange={(e) => handleConfigChange({ 
                targetName: e.target.value,
                targetId: e.target.value.toLowerCase().replace(/\s+/g, '-')
              })}
              placeholder="Enter tag name (e.g., 'Premium', 'Newsletter')"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              This will trigger when the tag "{config.targetName || 'your-tag'}" is {node.data.triggerType === "TAG_ADDED" ? "added to" : "removed from"} a subscriber.
            </p>
          </div>
        )

      case "TIER_CHANGED":
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">From Tier</Label>
              <Input
                value={config.targetName || ""}
                onChange={(e) => handleConfigChange({ 
                  targetName: e.target.value
                })}
                placeholder="Enter tier name (optional)"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">To Tier</Label>
              <Input
                value={config.targetId || ""}
                onChange={(e) => handleConfigChange({ 
                  targetId: e.target.value
                })}
                placeholder="Enter tier name (optional)"
                className="mt-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Leave empty to trigger on any tier change, or specify specific tiers.
            </p>
          </div>
        )

      case "CUSTOM_DATE":
        return (
          <div>
            <Label className="text-xs">Date</Label>
            <Input
              type="date"
              value={config.customDate || ""}
              onChange={(e) => handleConfigChange({ customDate: e.target.value })}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              This will trigger on the specified date (e.g., birthday, anniversary).
            </p>
          </div>
        )

      case "FORM_SUBMITTED":
        return (
          <div>
            <Label className="text-xs">Form ID</Label>
            <Input
              value={config.formId || ""}
              onChange={(e) => handleConfigChange({ formId: e.target.value })}
              placeholder="Enter form ID"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              This will trigger when a subscriber submits the form with this ID.
            </p>
          </div>
        )

      default:
        return (
          <div className="text-xs text-muted-foreground">
            No additional configuration needed for this trigger type.
          </div>
        )
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs text-muted-foreground">Trigger Type</Label>
        <p className="text-sm font-medium">{node.data.label}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {getTriggerDescription()}
        </p>
      </div>

      <Separator />

      {renderTriggerConfiguration()}

      {config.targetName && (
        <div className="p-2 bg-muted rounded-md">
          <p className="text-xs text-muted-foreground">Selected:</p>
          <p className="text-sm font-medium">{config.targetName}</p>
        </div>
      )}

      {loading && (
        <div className="text-xs text-muted-foreground">
          Loading options...
        </div>
      )}
    </div>
  )
}

/**
 * Properties form for action nodes
 */
function ActionProperties({
  node,
  onUpdateNode,
  publicationSlug,
  workflowId,
}: {
  readonly node: WorkflowNode
  readonly onUpdateNode: (
    nodeId: string,
    data: Partial<WorkflowNodeData>
  ) => void
  readonly publicationSlug?: string
  readonly workflowId?: string
}) {
  if (node.data.type !== "action") return null

  const [subject, setSubject] = useState("")
  const [content, setContent] = useState("")
  const [templateId, setTemplateId] = useState<string | undefined>(undefined)
  const [delayAmount, setDelayAmount] = useState(1)
  const [delayUnit, setDelayUnit] = useState<"minutes" | "hours" | "days">(
    "hours"
  )
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    if (node.data.config && node.data.actionType === "SEND_EMAIL") {
      const config = node.data.config as {
        templateId?: string
        subject: string
        content: string
        personalization?: Record<string, string>
      }
      setSubject(config.subject || "")
      setContent(config.content || "")
      setTemplateId(config.templateId)
    }
    if (node.data.config && node.data.actionType === "WAIT") {
      const config = node.data.config as {
        delayMinutes: number
        delayUnit: "minutes" | "hours" | "days"
      }
      setDelayAmount(config.delayMinutes || 1)
      setDelayUnit(config.delayUnit || "hours")
    }
  }, [node])

  function handleSave(): void {
    if (node.data.actionType === "SEND_EMAIL") {
      onUpdateNode(node.id, {
        ...node.data,
        config: {
          templateId,
          subject,
          content,
          personalization: {},
        },
      })
    } else if (node.data.actionType === "WAIT") {
      onUpdateNode(node.id, {
        ...node.data,
        config: {
          delayMinutes: delayAmount,
          delayUnit,
        },
      })
    } else if (
      node.data.actionType === "ADD_TAG" ||
      node.data.actionType === "REMOVE_TAG"
    ) {
      onUpdateNode(node.id, {
        ...node.data,
        config: {
          tagIds: [],
        },
      })
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs text-muted-foreground">Action Type</Label>
        <p className="text-sm font-medium">{node.data.label}</p>
      </div>

      <Separator />

      {node.data.actionType === "SEND_EMAIL" && (
        publicationSlug && workflowId ? (
          <EmailEditor
            subject={subject}
            content={content}
            templateId={templateId}
            onSubjectChange={setSubject}
            onContentChange={setContent}
            onTemplateChange={setTemplateId}
            onPreview={() => setShowPreview(true)}
            onTestSend={async (email, subject, content) => {
              // Handle test send
              console.log("Test send:", { email, subject, content })
            }}
            publicationSlug={publicationSlug}
          />
        ) : (
          <div className="space-y-3">
            <div>
              <Label htmlFor="email-subject" className="text-xs">
                Subject Line
              </Label>
              <Input
                id="email-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email-content" className="text-xs">
                Email Content
              </Label>
              <Textarea
                id="email-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter email content (HTML supported)"
                rows={6}
                className="mt-1 font-mono text-sm"
              />
            </div>
          </div>
        )
      )}

      {node.data.actionType === "WAIT" && (
        <div className="space-y-3">
          <div>
            <Label htmlFor="delay" className="text-xs">
              Delay Duration
            </Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="delay"
                type="number"
                min={1}
                value={delayAmount}
                onChange={(e) => setDelayAmount(Number(e.target.value))}
                className="flex-1"
              />
              <Select value={delayUnit} onValueChange={(v) => setDelayUnit(v as "minutes" | "hours" | "days")}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minutes">Minutes</SelectItem>
                  <SelectItem value="hours">Hours</SelectItem>
                  <SelectItem value="days">Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {(node.data.actionType === "ADD_TAG" ||
        node.data.actionType === "REMOVE_TAG") && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Tag selection will be available when tags are configured for your
            publication.
          </p>
        </div>
      )}

      <Button onClick={handleSave} className="w-full" type="button">
        Save Configuration
      </Button>

      {/* Email Preview Modal */}
      {node.data.actionType === "SEND_EMAIL" && publicationSlug && workflowId && (
        <EmailPreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          subject={subject}
          content={content}
          onTestSend={async (email, subject, content) => {
            // Handle test send
            console.log("Test send:", { email, subject, content })
          }}
          publicationSlug={publicationSlug}
          workflowId={workflowId}
        />
      )}
    </div>
  )
}

/**
 * Properties form for condition nodes
 */
function ConditionProperties({
  node,
  onUpdateNode,
}: {
  readonly node: WorkflowNode
  readonly onUpdateNode: (
    nodeId: string,
    data: Partial<WorkflowNodeData>
  ) => void
}) {
  if (node.data.type !== "condition") return null

  const [tagCondition, setTagCondition] = useState(true)
  const [fieldName, setFieldName] = useState("")
  const [operator, setOperator] = useState<
    "equals" | "contains" | "greater_than" | "less_than"
  >("equals")
  const [value, setValue] = useState("")

  useEffect(() => {
    if (node.data.config && node.data.conditionType === "HAS_TAG") {
      const config = node.data.config as {
        hasTag: boolean
      }
      setTagCondition(config.hasTag || true)
    }
    if (node.data.config && node.data.conditionType === "CUSTOM_FIELD") {
      const config = node.data.config as {
        fieldName: string
        operator: "equals" | "contains" | "greater_than" | "less_than"
        value: string
      }
      setFieldName(config.fieldName || "")
      setOperator(config.operator || "equals")
      setValue(config.value || "")
    }
  }, [node])

  function handleSave(): void {
    if (node.data.conditionType === "HAS_TAG") {
      onUpdateNode(node.id, {
        ...node.data,
        config: {
          tagId: "temp-tag-id",
          hasTag: tagCondition,
        },
      })
    } else if (node.data.conditionType === "SUBSCRIPTION_TIER") {
      onUpdateNode(node.id, {
        ...node.data,
        config: {
          tierId: "temp-tier-id",
        },
      })
    } else if (node.data.conditionType === "CUSTOM_FIELD") {
      onUpdateNode(node.id, {
        ...node.data,
        config: {
          fieldName,
          operator,
          value,
        },
      })
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs text-muted-foreground">Condition Type</Label>
        <p className="text-sm font-medium">{node.data.label}</p>
      </div>

      <Separator />

      {node.data.conditionType === "HAS_TAG" && (
        <div className="space-y-3">
          <div>
            <Label htmlFor="tagCondition" className="text-xs">
              Tag Condition
            </Label>
            <Select
              value={tagCondition ? "has" : "not_has"}
              onValueChange={(v) => setTagCondition(v === "has")}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="has">Has tag</SelectItem>
                <SelectItem value="not_has">Does not have tag</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground">
            Tag selection will be available when tags are configured.
          </p>
        </div>
      )}

      {node.data.conditionType === "SUBSCRIPTION_TIER" && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Subscription tier selection will be available when tiers are
            configured.
          </p>
        </div>
      )}

      {node.data.conditionType === "CUSTOM_FIELD" && (
        <div className="space-y-3">
          <div>
            <Label htmlFor="fieldName" className="text-xs">
              Field Name
            </Label>
            <Input
              id="fieldName"
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
              placeholder="e.g., age, country"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="operator" className="text-xs">
              Operator
            </Label>
            <Select value={operator} onValueChange={(v) => setOperator(v as typeof operator)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equals">Equals</SelectItem>
                <SelectItem value="contains">Contains</SelectItem>
                <SelectItem value="greater_than">Greater than</SelectItem>
                <SelectItem value="less_than">Less than</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="value" className="text-xs">
              Value
            </Label>
            <Input
              id="value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter comparison value"
              className="mt-1"
            />
          </div>
        </div>
      )}

      <Button onClick={handleSave} className="w-full" type="button">
        Save Configuration
      </Button>
    </div>
  )
}

