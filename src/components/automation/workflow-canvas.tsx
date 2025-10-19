"use client"

import { useCallback, useMemo } from "react"
import {
  Background,
  BackgroundVariant,
  Controls,
  type Edge,
  MiniMap,
  type Node,
  type NodeTypes,
  type OnConnect,
  type OnEdgesChange,
  type OnNodesChange,
  ReactFlow,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { ActionNode } from "./nodes/action-node"
import { ConditionNode } from "./nodes/condition-node"
import { TriggerNode } from "./nodes/trigger-node"
import type { WorkflowEdge, WorkflowNode } from "@/lib/types/automation"

type WorkflowCanvasProps = {
  readonly nodes: readonly WorkflowNode[]
  readonly edges: readonly WorkflowEdge[]
  readonly onNodesChange: (nodes: readonly WorkflowNode[]) => void
  readonly onEdgesChange: (edges: readonly WorkflowEdge[]) => void
  readonly onNodeSelect: (node: WorkflowNode | undefined) => void
}

/**
 * Workflow canvas component using React Flow
 * Provides the visual workflow builder interface
 */
export function WorkflowCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onNodeSelect,
}: WorkflowCanvasProps) {
  // Define custom node types
  const nodeTypes: NodeTypes = useMemo(
    () => ({
      trigger: TriggerNode,
      action: ActionNode,
      condition: ConditionNode,
    }),
    []
  )

  // Handle node changes (position, selection, etc.)
  const handleNodesChange: OnNodesChange<Node> = useCallback(
    (changes) => {
      const updatedNodes = applyNodeChanges(
        changes,
        nodes as Node[]
      ) as WorkflowNode[]
      onNodesChange(updatedNodes)

      // Check for selection changes
      const selectionChange = changes.find(
        (change) => change.type === "select"
      )
      if (selectionChange && selectionChange.type === "select") {
        const selectedNode = updatedNodes.find(
          (n) => n.id === selectionChange.id && n.selected
        )
        onNodeSelect(selectedNode)
      } else {
        // Check if any node is selected after all changes
        const selectedNode = updatedNodes.find(n => n.selected)
        if (selectedNode) {
          onNodeSelect(selectedNode)
        }
      }
    },
    [nodes, onNodesChange, onNodeSelect]
  )

  // Handle edge changes (connections between nodes)
  const handleEdgesChange: OnEdgesChange<Edge> = useCallback(
    (changes) => {
      const updatedEdges = applyEdgeChanges(
        changes,
        edges as Edge[]
      ) as WorkflowEdge[]
      onEdgesChange(updatedEdges)
    },
    [edges, onEdgesChange]
  )

  // Handle new connections between nodes
  const handleConnect: OnConnect = useCallback(
    (connection) => {
      const edge: WorkflowEdge = {
        ...connection,
        id: `edge-${connection.source}-${connection.target}`,
        animated: true,
        label: connection.sourceHandle === "true" ? "Yes" : connection.sourceHandle === "false" ? "No" : undefined,
      }
      const updatedEdges = addEdge(edge, edges as Edge[]) as WorkflowEdge[]
      onEdgesChange(updatedEdges)
    },
    [edges, onEdgesChange]
  )

  // Handle pane click (deselect nodes)
  const handlePaneClick = useCallback(() => {
    onNodeSelect(undefined)
  }, [onNodeSelect])

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes as Node[]}
        edges={edges as Edge[]}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        fitView
        className="bg-background"
        defaultEdgeOptions={{
          type: "smoothstep",
          animated: true,
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <Controls />
        <MiniMap
          className="!bg-background !border !border-border"
          nodeColor={(node) => {
            if (node.type === "trigger") return "#6366f1"
            if (node.type === "condition") return "#a855f7"
            return "#3b82f6"
          }}
        />
      </ReactFlow>
    </div>
  )
}

