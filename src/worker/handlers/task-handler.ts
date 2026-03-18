import { Job } from "bullmq";
import { getSupabaseAdmin } from "@/lib/supabase/client";
import { enqueueNotification, enqueueWorkflow } from "@/lib/queue/queues";
import type { Task, TaskLog } from "@/types";

export async function handleTaskExecution(job: Job) {
  const { taskId } = job.data;
  const supabase = getSupabaseAdmin();
  const logs: TaskLog[] = [];

  const addLog = (level: TaskLog["level"], message: string, data?: Record<string, unknown>) => {
    logs.push({ timestamp: new Date().toISOString(), level, message, data });
  };

  // Create a task run record
  const { data: taskRun, error: runError } = await supabase
    .from("task_runs")
    .insert({
      task_id: taskId,
      status: "running",
      started_at: new Date().toISOString(),
      logs: [],
    })
    .select()
    .single();

  if (runError || !taskRun) {
    throw new Error(`Failed to create task run: ${runError?.message}`);
  }

  try {
    // Fetch the task
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", taskId)
      .single();

    if (taskError || !task) {
      throw new Error(`Task not found: ${taskError?.message}`);
    }

    addLog("info", `Starting task: ${task.title}`);

    // Update task status to running
    await supabase.from("tasks").update({ status: "running" }).eq("id", taskId);

    // If task has a workflow, execute it
    if (task.workflow_id) {
      addLog("info", "Executing associated workflow");
      await enqueueWorkflow(task.workflow_id, taskId);
      addLog("info", "Workflow execution queued");
    }

    addLog("info", "Task execution completed successfully");

    // Update task run as completed
    const completedAt = new Date().toISOString();
    const duration = new Date(completedAt).getTime() - new Date(taskRun.started_at).getTime();

    await supabase
      .from("task_runs")
      .update({
        status: "completed",
        completed_at: completedAt,
        duration_ms: duration,
        logs,
        output: { message: "Task completed successfully" },
      })
      .eq("id", taskRun.id);

    // Update task status
    await supabase
      .from("tasks")
      .update({
        status: "completed",
        last_run_at: completedAt,
      })
      .eq("id", taskId);

    // Send notification
    await enqueueNotification(
      task.user_id,
      "Task Completed",
      `Task "${task.title}" completed successfully`,
      "in_app",
      { task_id: taskId, run_id: taskRun.id }
    );

    return { success: true, runId: taskRun.id };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    addLog("error", `Task execution failed: ${errorMessage}`);

    // Update task run as failed
    await supabase
      .from("task_runs")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
        duration_ms: Date.now() - new Date(taskRun.started_at).getTime(),
        logs,
        error: errorMessage,
      })
      .eq("id", taskRun.id);

    // Update task status
    const { data: task } = await supabase.from("tasks").select("user_id, title, retry_count, max_retries").eq("id", taskId).single();

    if (task) {
      const shouldRetry = task.retry_count < task.max_retries;
      await supabase
        .from("tasks")
        .update({
          status: shouldRetry ? "pending" : "failed",
          retry_count: task.retry_count + 1,
          last_run_at: new Date().toISOString(),
        })
        .eq("id", taskId);

      await enqueueNotification(
        task.user_id,
        "Task Failed",
        `Task "${task.title}" failed: ${errorMessage}${shouldRetry ? " (will retry)" : ""}`,
        "in_app",
        { task_id: taskId, run_id: taskRun.id }
      );
    }

    throw error;
  }
}
