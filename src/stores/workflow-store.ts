import { create } from "zustand";
import type { Workflow, WorkflowNode, WorkflowEdge } from "@/types";

interface WorkflowState {
  workflows: Workflow[];
  currentWorkflow: Workflow | null;
  isLoading: boolean;
  error: string | null;
  editorNodes: WorkflowNode[];
  editorEdges: WorkflowEdge[];
  selectedNodeId: string | null;

  setWorkflows: (workflows: Workflow[]) => void;
  setCurrentWorkflow: (workflow: Workflow | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setEditorNodes: (nodes: WorkflowNode[]) => void;
  setEditorEdges: (edges: WorkflowEdge[]) => void;
  setSelectedNodeId: (id: string | null) => void;

  addNode: (node: WorkflowNode) => void;
  updateNode: (id: string, updates: Partial<WorkflowNode>) => void;
  removeNode: (id: string) => void;
  addEdge: (edge: WorkflowEdge) => void;
  removeEdge: (id: string) => void;

  fetchWorkflows: () => Promise<void>;
  createWorkflow: (data: Partial<Workflow>) => Promise<Workflow>;
  updateWorkflow: (id: string, data: Partial<Workflow>) => Promise<void>;
  deleteWorkflow: (id: string) => Promise<void>;
  saveCurrentWorkflow: () => Promise<void>;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  workflows: [],
  currentWorkflow: null,
  isLoading: false,
  error: null,
  editorNodes: [],
  editorEdges: [],
  selectedNodeId: null,

  setWorkflows: (workflows) => set({ workflows }),
  setCurrentWorkflow: (workflow) =>
    set({
      currentWorkflow: workflow,
      editorNodes: workflow?.nodes || [],
      editorEdges: workflow?.edges || [],
    }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setEditorNodes: (editorNodes) => set({ editorNodes }),
  setEditorEdges: (editorEdges) => set({ editorEdges }),
  setSelectedNodeId: (selectedNodeId) => set({ selectedNodeId }),

  addNode: (node) => set((state) => ({ editorNodes: [...state.editorNodes, node] })),
  updateNode: (id, updates) =>
    set((state) => ({
      editorNodes: state.editorNodes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
    })),
  removeNode: (id) =>
    set((state) => ({
      editorNodes: state.editorNodes.filter((n) => n.id !== id),
      editorEdges: state.editorEdges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
    })),
  addEdge: (edge) => set((state) => ({ editorEdges: [...state.editorEdges, edge] })),
  removeEdge: (id) => set((state) => ({ editorEdges: state.editorEdges.filter((e) => e.id !== id) })),

  fetchWorkflows: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/workflows");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      set({ workflows: json.data || [], isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unknown error", isLoading: false });
    }
  },

  createWorkflow: async (data) => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      const workflow = json.data;
      set((state) => ({ workflows: [workflow, ...state.workflows], isLoading: false }));
      return workflow;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unknown error", isLoading: false });
      throw error;
    }
  },

  updateWorkflow: async (id, data) => {
    try {
      const res = await fetch(`/api/workflows/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      set((state) => ({
        workflows: state.workflows.map((w) => (w.id === id ? { ...w, ...data } : w)),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unknown error" });
      throw error;
    }
  },

  deleteWorkflow: async (id) => {
    try {
      const res = await fetch(`/api/workflows/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error);
      }
      set((state) => ({ workflows: state.workflows.filter((w) => w.id !== id) }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unknown error" });
      throw error;
    }
  },

  saveCurrentWorkflow: async () => {
    const { currentWorkflow, editorNodes, editorEdges } = get();
    if (!currentWorkflow) return;

    await get().updateWorkflow(currentWorkflow.id, {
      nodes: editorNodes,
      edges: editorEdges,
    });
  },
}));
