"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { WorkflowEditor } from "@/components/workflows/workflow-editor";
import { NodePalette } from "@/components/workflows/node-palette";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useWorkflowStore } from "@/stores/workflow-store";
import { Plus, Play, Trash2, Save, GitBranch } from "lucide-react";
import type { Workflow, WorkflowNode } from "@/types";

export default function WorkflowsPage() {
  const {
    workflows,
    currentWorkflow,
    editorNodes,
    editorEdges,
    fetchWorkflows,
    createWorkflow,
    deleteWorkflow,
    setCurrentWorkflow,
    addNode,
    saveCurrentWorkflow,
  } = useWorkflowStore();

  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  const handleCreateWorkflow = async () => {
    if (!newName) return;
    const workflow = await createWorkflow({ name: newName, description: "" });
    setCurrentWorkflow(workflow);
    setShowNewDialog(false);
    setNewName("");
  };

  const handleAddNode = useCallback(
    (item: { type: string; integration?: string; label: string }) => {
      const newNode: WorkflowNode = {
        id: `node-${Date.now()}`,
        type: item.type as WorkflowNode["type"],
        integration: item.integration as WorkflowNode["integration"],
        label: item.label,
        config: {},
        position: {
          x: 250 + Math.random() * 200,
          y: 100 + editorNodes.length * 100,
        },
      };
      addNode(newNode);
    },
    [addNode, editorNodes.length]
  );

  const handleExecuteWorkflow = async (workflowId: string) => {
    await fetch(`/api/workflows/${workflowId}/execute`, { method: "POST" });
  };

  return (
    <div>
      <Header
        title="Workflows"
        description="Visual workflow builder"
        actions={
          <Button variant="hive" onClick={() => setShowNewDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Workflow
          </Button>
        }
      />
      <div className="p-6">
        {currentWorkflow ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{currentWorkflow.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {editorNodes.length} nodes, {editorEdges.length} connections
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setCurrentWorkflow(null)}>
                  Back to List
                </Button>
                <Button variant="outline" onClick={saveCurrentWorkflow} className="gap-2">
                  <Save className="h-4 w-4" />
                  Save
                </Button>
                <Button
                  variant="hive"
                  onClick={() => handleExecuteWorkflow(currentWorkflow.id)}
                  className="gap-2"
                >
                  <Play className="h-4 w-4" />
                  Run
                </Button>
              </div>
            </div>
            <div className="flex gap-4">
              <NodePalette onAddNode={handleAddNode} />
              <div className="flex-1">
                <WorkflowEditor initialNodes={editorNodes} initialEdges={editorEdges} />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {workflows.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center py-16 text-center">
                  <GitBranch className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">No workflows yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Create your first workflow with the visual builder
                  </p>
                  <Button variant="hive" onClick={() => setShowNewDialog(true)} className="mt-4 gap-2">
                    <Plus className="h-4 w-4" />
                    Create Workflow
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {workflows.map((workflow) => (
                  <Card
                    key={workflow.id}
                    className="cursor-pointer transition-colors hover:bg-accent/50"
                    onClick={() => setCurrentWorkflow(workflow)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{workflow.name}</CardTitle>
                        <Badge variant={workflow.is_active ? "success" : "secondary"}>
                          {workflow.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {(workflow.nodes as WorkflowNode[]).length} nodes
                      </p>
                      <div className="mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExecuteWorkflow(workflow.id)}
                          className="gap-1"
                        >
                          <Play className="h-3.5 w-3.5" />
                          Run
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteWorkflow(workflow.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* New Workflow Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Workflow</DialogTitle>
          </DialogHeader>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Workflow name"
            onKeyDown={(e) => e.key === "Enter" && handleCreateWorkflow()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Cancel</Button>
            <Button variant="hive" onClick={handleCreateWorkflow} disabled={!newName}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
