"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { TaskInput } from "@/components/tasks/task-input";
import { TaskList } from "@/components/tasks/task-list";
import { TaskDetail } from "@/components/tasks/task-detail";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTaskStore } from "@/stores/task-store";
import { Search, Filter } from "lucide-react";
import type { Task, TaskRun } from "@/types";

export default function TasksPage() {
  const { tasks, isLoading, filters, fetchTasks, setFilters, deleteTask } = useTaskStore();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskRuns, setTaskRuns] = useState<TaskRun[]>([]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleSelectTask = async (task: Task) => {
    setSelectedTask(task);
    try {
      const res = await fetch(`/api/tasks/${task.id}/runs`);
      const json = await res.json();
      if (json.data) setTaskRuns(json.data);
    } catch {
      setTaskRuns([]);
    }
  };

  const handleCreateTask = async (input: string) => {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ natural_language_input: input }),
    });
    if (!res.ok) throw new Error("Failed to create task");
    fetchTasks();
  };

  const handleRetry = async (taskId: string, runId: string) => {
    await fetch(`/api/tasks/${taskId}/retry`, { method: "POST" });
    fetchTasks();
    if (selectedTask?.id === taskId) handleSelectTask(selectedTask);
  };

  const handleDelete = async (taskId: string) => {
    await deleteTask(taskId);
    if (selectedTask?.id === taskId) setSelectedTask(null);
  };

  return (
    <div>
      <Header title="Tasks" description="Manage your automated tasks" />
      <div className="space-y-6 p-6">
        <TaskInput onSubmit={handleCreateTask} />

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filters.search}
              onChange={(e) => {
                setFilters({ search: e.target.value });
                fetchTasks();
              }}
              placeholder="Search tasks..."
              className="pl-9"
            />
          </div>
          <Select
            value={filters.status || "all"}
            onValueChange={(v) => {
              setFilters({ status: v === "all" ? null : v });
              fetchTasks();
            }}
          >
            <SelectTrigger className="w-40">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TaskList
          tasks={tasks}
          onSelect={handleSelectTask}
          onDelete={handleDelete}
          onRetry={(id) => handleRetry(id, "")}
        />

        {/* Task Detail Dialog */}
        <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Task Details</DialogTitle>
            </DialogHeader>
            {selectedTask && (
              <TaskDetail task={selectedTask} runs={taskRuns} onRetry={handleRetry} />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
