"use client";

import React, { useCallback, useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
  type NodeTypes,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { useWorkflowStore } from "@/stores/workflow-store";
import { TriggerNode } from "./nodes/trigger-node";
import { ActionNode } from "./nodes/action-node";
import { ConditionNode } from "./nodes/condition-node";
import { DelayNode } from "./nodes/delay-node";
import type { WorkflowNode, WorkflowEdge } from "@/types";

const nodeTypes: NodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
  delay: DelayNode,
};

interface WorkflowEditorProps {
  initialNodes?: WorkflowNode[];
  initialEdges?: WorkflowEdge[];
  onSave?: (nodes: WorkflowNode[], edges: WorkflowEdge[]) => void;
}

export function WorkflowEditor({ initialNodes = [], initialEdges = [], onSave }: WorkflowEditorProps) {
  const rfNodes: Node[] = useMemo(
    () =>
      initialNodes.map((n) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: {
          label: n.label,
          integration: n.integration,
          config: n.config,
        },
      })),
    [initialNodes]
  );

  const rfEdges: Edge[] = useMemo(
    () =>
      initialEdges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: "#4870ea" },
      })),
    [initialEdges]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(rfNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rfEdges);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { stroke: "#4870ea" },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  return (
    <div className="h-[600px] w-full rounded-lg border bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-dot-pattern"
        defaultEdgeOptions={{
          animated: true,
          markerEnd: { type: MarkerType.ArrowClosed },
        }}
      >
        <Background color="#e2e8f0" gap={20} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            switch (node.type) {
              case "trigger":
                return "#f98e07";
              case "action":
                return "#4870ea";
              case "condition":
                return "#10b981";
              case "delay":
                return "#8b5cf6";
              default:
                return "#6b7280";
            }
          }}
        />
      </ReactFlow>
    </div>
  );
}
