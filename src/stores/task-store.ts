import { create } from "zustand";
import type { Task, TaskRun, PaginatedResponse } from "@/types";

interface TaskState {
  tasks: Task[];
  currentTask: Task | null;
  taskRuns: TaskRun[];
  isLoading: boolean;
  error: string | null;
  filters: {
    status: string | null;
    search: string;
    tags: string[];
  };

  setTasks: (tasks: Task[]) => void;
  setCurrentTask: (task: Task | null) => void;
  setTaskRuns: (runs: TaskRun[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<TaskState["filters"]>) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;

  fetchTasks: () => Promise<void>;
  fetchTaskRuns: (taskId: string) => Promise<void>;
  createTask: (data: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  retryTask: (taskId: string, runId: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  currentTask: null,
  taskRuns: [],
  isLoading: false,
  error: null,
  filters: { status: null, search: "", tags: [] },

  setTasks: (tasks) => set({ tasks }),
  setCurrentTask: (currentTask) => set({ currentTask }),
  setTaskRuns: (taskRuns) => set({ taskRuns }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),

  addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      currentTask: state.currentTask?.id === id ? { ...state.currentTask, ...updates } : state.currentTask,
    })),
  removeTask: (id) => set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),

  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const { filters } = get();
      const params = new URLSearchParams();
      if (filters.status) params.set("status", filters.status);
      if (filters.search) params.set("search", filters.search);
      if (filters.tags.length) params.set("tags", filters.tags.join(","));

      const res = await fetch(`/api/tasks?${params}`);
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Failed to fetch tasks");
      set({ tasks: json.data || [], isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unknown error", isLoading: false });
    }
  },

  fetchTaskRuns: async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/runs`);
      const json = await res.json();
      if (res.ok) set({ taskRuns: json.data || [] });
    } catch {
      // Silently fail for runs
    }
  },

  createTask: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create task");

      const task = json.data;
      set((state) => ({ tasks: [task, ...state.tasks], isLoading: false }));
      return task;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unknown error", isLoading: false });
      throw error;
    }
  },

  deleteTask: async (id) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to delete task");
      }
      set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unknown error" });
      throw error;
    }
  },

  retryTask: async (taskId, runId) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/retry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ run_id: runId }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to retry task");
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unknown error" });
      throw error;
    }
  },
}));
