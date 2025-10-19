"use client"

import { useEffect, useState, use } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
  ArrowLeft,
  Plus,
  Save,
  Play,
  Pause,
  Eye,
  Settings,
} from "lucide-react"
import Link from "next/link"
import { WorkflowCanvas } from "@/components/automation/workflow-canvas"
import { NodeToolbar } from "@/components/automation/node-toolbar"
import { NodePropertiesPanel } from "@/components/automation/node-properties-panel"
import { WorkflowSettingsPanel } from "@/components/automation/workflow-settings-panel"
import type {
  WorkflowNode,
  WorkflowEdge,
  WorkflowNodeData,
  TriggerNodeData,
  TriggerConfig,
  TRIGGER_TYPES,
} from "@/lib/types/automation"

// Helper function to get trigger label
function getTriggerLabel(trigger: string): string {
  switch (trigger) {
    case "SUBSCRIBE":
      return "New Subscriber"
    case "UNSUBSCRIBE":
      return "Unsubscribe"
    case "POST_PUBLISHED":
      return "Post Published"
    case "COURSE_ENROLLED":
      return "Course Enrolled"
    default:
      return trigger
  }
}

// Helper function to get trigger display label with configuration
function getTriggerDisplayLabel(triggerType: string, config?: TriggerConfig): string {
  const baseLabel = getTriggerLabel(triggerType)
  
  if (config?.targetName) {
    // Handle special cases for subscription sources
    if (triggerType === "SUBSCRIBE" || triggerType === "UNSUBSCRIBE") {
      if (config.targetId === "publication") {
        return `${baseLabel} (Publication)`
      } else if (config.targetId === "course") {
        return `${baseLabel}: ${config.targetName}`
      } else if (config.targetId === "post") {
        return `${baseLabel}: ${config.targetName}`
      }
    }
    
    // Handle tag-based triggers
    if (triggerType === "TAG_ADDED" || triggerType === "TAG_REMOVED") {
      return `${baseLabel}: "${config.targetName}"`
    }
    
    // Handle tier changes
    if (triggerType === "TIER_CHANGED") {
      const fromTier = config.targetName || "Any"
      const toTier = config.targetId || "Any"
      return `${baseLabel}: ${fromTier} → ${toTier}`
    }
    
    return `${baseLabel}: ${config.targetName}`
  }
  
  if (config?.customDate) {
    return `${baseLabel}: ${new Date(config.customDate).toLocaleDateString()}`
  }
  
  if (config?.formId) {
    return `${baseLabel}: Form ${config.formId}`
  }
  
  return baseLabel
}
/**
 * Workflow builder page component
 * Provides the main interface for creating and editing automation workflows
 */
export default function WorkflowBuilderPage({
  params: paramsPromise,
  searchParams: searchParamsPromise,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = use(paramsPromise)
  const searchParams = use(searchParamsPromise)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [workflow, setWorkflow] = useState<{
    readonly id: string
    readonly name: string
    readonly trigger: keyof typeof TRIGGER_TYPES
    readonly triggerConfig?: any
    readonly publication: { readonly slug: string }
  } | null>(null)
  const [nodes, setNodes] = useState<readonly WorkflowNode[]>([])
  const [edges, setEdges] = useState<readonly WorkflowEdge[]>([])
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | undefined>(
    undefined
  )
  const [showSettings, setShowSettings] = useState(false)
  const [courses, setCourses] = useState<Array<{ id: string; title: string }>>([])
  const [posts, setPosts] = useState<Array<{ id: string; title: string; slug: string }>>([])

  // Load workflow data on mount
  useEffect(() => {
    if (params.id) {
      loadWorkflow()
    }
  }, [params.id])

  // Load courses and posts when workflow is loaded
  useEffect(() => {
    if (workflow?.publication?.slug) {
      loadCoursesAndPosts()
    }
  }, [workflow?.publication?.slug])

  const loadCoursesAndPosts = async (): Promise<void> => {
    if (!workflow?.publication?.slug) return

    try {
      const [coursesRes, postsRes] = await Promise.all([
        fetch(`/api/publications/${workflow.publication.slug}/courses`),
        fetch(`/api/publications/${workflow.publication.slug}/posts`)
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
    }
  }

  // Set up nodes and edges when workflow changes
  useEffect(() => {
    if (workflow) {
      // Check if we have existing nodes in the definition
      const hasExistingNodes = workflow.definition && 
        workflow.definition.nodes && 
        workflow.definition.nodes.length > 0

      if (hasExistingNodes) {
        // Fix any nodes that might be missing triggerType
        const fixedNodes = (workflow.definition.nodes || []).map(node => {
          if (node.data.type === "trigger" && !node.data.triggerType) {
            const triggerType = workflow.trigger || "SUBSCRIBE"
            const config = node.data.config || {}
            return {
              ...node,
              data: {
                ...node.data,
                triggerType: triggerType,
                label: getTriggerDisplayLabel(triggerType, config),
                config: config
              }
            }
          }
          return node
        })
        setNodes(fixedNodes)
        setEdges(workflow.definition.edges || [])
      }
    }
  }, [workflow])

  // Set up initial trigger node when workflow and courses/posts are loaded
  useEffect(() => {
    if (workflow && !workflow.definition?.nodes?.length) {
      // Create a default trigger node for new workflows or workflows without nodes
      const triggerType = workflow.trigger || "SUBSCRIBE" // Fallback to SUBSCRIBE if undefined
      
      // Use the triggerConfig from the workflow if available, otherwise set up defaults
      let initialConfig: TriggerConfig = workflow.triggerConfig || {}
      
      // If no triggerConfig was provided, set up defaults based on trigger type
      if (!workflow.triggerConfig) {
        if (triggerType === "SUBSCRIBE" || triggerType === "UNSUBSCRIBE") {
          initialConfig = {
            targetId: "publication",
            targetName: "Publication"
          }
        }
      } else {
        // Handle legacy configuration format where targetId might be a course/post ID
        if ((triggerType === "SUBSCRIBE" || triggerType === "UNSUBSCRIBE") && 
            initialConfig.targetId && 
            initialConfig.targetId !== "publication" &&
            initialConfig.targetId !== "course" &&
            initialConfig.targetId !== "post") {
          // This is likely a legacy format where targetId contains the course/post ID
          // Check if it's a course or post based on the loaded data
          const isCourse = courses.some(c => c.id === initialConfig.targetId)
          const isPost = posts.some(p => p.id === initialConfig.targetId)
          
          if (isCourse) {
            initialConfig = {
              targetId: "course",
              selectedId: initialConfig.targetId,
              targetName: initialConfig.targetName
            }
          } else if (isPost) {
            initialConfig = {
              targetId: "post",
              selectedId: initialConfig.targetId,
              targetName: initialConfig.targetName
            }
          }
        }
      }
      
      const triggerNode: WorkflowNode = {
        id: `node-${Date.now()}`,
        type: "trigger",
        position: { x: 100, y: 100 },
        data: {
          type: "trigger",
          triggerType: triggerType,
          label: getTriggerDisplayLabel(triggerType, initialConfig),
          config: initialConfig,
        },
      }
      setNodes([triggerNode])
      setEdges([])
      
      // Save the initial workflow definition with the configured trigger node
      const initialDefinition = {
        nodes: [triggerNode],
        edges: []
      }
      
      // Update the workflow in the database with the initial definition
      handleSaveWorkflowDefinition(initialDefinition)
    }
  }, [workflow, courses, posts])

  const loadWorkflow = async (): Promise<void> => {
    try {
      const publicationSlug = searchParams?.publication as string

      if (!publicationSlug) {
        toast.error("Publication slug is required")
        router.push("/portal/automation")
        return
      }

      const response = await fetch(`/api/publications/${publicationSlug}/automation/${params.id}`)

      if (!response.ok) {
        if (response.status === 404) {
          toast.error("Workflow not found")
          router.push("/portal/automation")
          return
        }
        throw new Error("Failed to load workflow")
      }

      const data = await response.json()

      if (!data.workflow) {
        toast.error("Workflow data not found in response")
        router.push("/portal/automation")
        return
      }

      setWorkflow(data.workflow)
    } catch (error) {
      console.error("Error loading workflow:", error)
      toast.error("Failed to load workflow")
      router.push("/portal/automation")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (): Promise<void> => {
    setIsSaving(true)
    try {
      const publicationSlug = searchParams?.publication as string

      if (!publicationSlug) {
        toast.error("Publication slug is required")
        return
      }

      const response = await fetch(`/api/publications/${publicationSlug}/automation/${params.id}/steps`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          definition: {
            nodes,
            edges,
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save workflow")
      }

      toast.success("Workflow saved successfully")
    } catch (error) {
      console.error("Error saving workflow:", error)
      toast.error("Failed to save workflow")
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddNode = (nodeData: WorkflowNodeData): void => {
    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type: nodeData.type,
      position: { x: Math.random() * 300, y: Math.random() * 200 },
      data: nodeData,
    }
    setNodes((prev) => [...prev, newNode])
  }

  const handleUpdateNode = (nodeId: string, data: Partial<WorkflowNodeData>): void => {
    setNodes((prev) =>
      prev.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
      )
    )
  }

  const handleNodesChange = (updatedNodes: readonly WorkflowNode[]): void => {
    setNodes(updatedNodes)
  }

  const handleEdgesChange = (updatedEdges: readonly WorkflowEdge[]): void => {
    setEdges(updatedEdges)
  }

  const handleNodeSelect = (node: WorkflowNode | undefined): void => {
    setSelectedNode(node)
  }

  const handleUpdateWorkflow = async (updates: {
    name?: string
    description?: string
    trigger?: keyof typeof TRIGGER_TYPES
  }): Promise<void> => {
    if (!workflow) return

    try {
      const publicationSlug = searchParams?.publication as string
      if (!publicationSlug) {
        toast.error("Publication slug is required")
        return
      }

      const response = await fetch(`/api/publications/${publicationSlug}/automation/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error("Failed to update workflow")
      }

      const data = await response.json()
      setWorkflow(data.workflow)
    } catch (error) {
      console.error("Error updating workflow:", error)
      throw error
    }
  }

  const handleSaveWorkflowDefinition = async (definition: { nodes: WorkflowNode[]; edges: WorkflowEdge[] }): Promise<void> => {
    try {
      const publicationSlug = searchParams?.publication as string
      if (!publicationSlug) {
        toast.error("Publication slug is required")
        return
      }

      const response = await fetch(`/api/publications/${publicationSlug}/automation/${params.id}/steps`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ definition }),
      })

      if (!response.ok) {
        throw new Error("Failed to save workflow definition")
      }
    } catch (error) {
      console.error("Error saving workflow definition:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading workflow...</p>
        </div>
      </div>
    )
  }

  if (!workflow) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Workflow not found</p>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-4">
          <Link href="/portal/automation">
            <Button variant="outline" size="sm" type="button">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Automations
            </Button>
          </Link>
          <Separator orientation="vertical" className="h-6" />
          <div>
            <h1 className="text-lg font-semibold">{workflow.name}</h1>
            <p className="text-sm text-muted-foreground">
              Trigger: {workflow.trigger.replace("_", " ").toLowerCase()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowSettings(!showSettings)}
            type="button"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline" size="sm" type="button">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline" size="sm" type="button">
            <Play className="w-4 h-4 mr-2" />
            Test
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            size="sm"
            type="button"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save
              </>
            )}
          </Button>
          <Button size="sm" type="button">
            <Play className="w-4 h-4 mr-2" />
            Activate
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex">
        {/* Left sidebar - Node toolbar */}
        <div className="w-80 border-r bg-card">
          <div className="p-4">
            <NodeToolbar onAddNode={handleAddNode} />
          </div>
        </div>

        {/* Center - Workflow canvas */}
        <div className="flex-1 relative">
          <WorkflowCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onNodeSelect={handleNodeSelect}
          />
        </div>

        {/* Right sidebar - Properties panel or Settings panel */}
        <div className="w-80 border-l bg-card">
          <div className="p-4">
            {showSettings ? (
              <WorkflowSettingsPanel
                workflow={workflow}
                onUpdateWorkflow={handleUpdateWorkflow}
                onClose={() => setShowSettings(false)}
              />
            ) : (
              <NodePropertiesPanel
                node={selectedNode}
                onUpdateNode={handleUpdateNode}
                onClose={() => setSelectedNode(undefined)}
                publicationSlug={searchParams?.publication as string}
                workflowId={params.id}
              />
            )}
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between p-3 border-t bg-card text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>Nodes: {nodes.length}</span>
          <span>Connections: {edges.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Ready</span>
        </div>
      </div>
    </div>
  )
}

