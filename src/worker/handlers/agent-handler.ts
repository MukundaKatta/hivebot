import { Job } from "bullmq";
import { getSupabaseAdmin } from "@/lib/supabase/client";
import { executeAgentGoal } from "@/lib/ai/agent";
import { enqueueNotification } from "@/lib/queue/queues";

export async function handleAgentExecution(job: Job) {
  const { goalId, goal, userId } = job.data;
  const supabase = getSupabaseAdmin();

  try {
    // Update goal status to executing
    await supabase
      .from("agent_goals")
      .update({ status: "executing" })
      .eq("id", goalId);

    // Execute the agent goal
    const result = await executeAgentGoal(goal);

    // Update goal with results
    await supabase
      .from("agent_goals")
      .update({
        status: result.success ? "completed" : "failed",
        steps: result.steps,
        result: result.result,
      })
      .eq("id", goalId);

    // Notify user
    await enqueueNotification(
      userId,
      result.success ? "Agent Goal Completed" : "Agent Goal Failed",
      result.result,
      "in_app",
      { goal_id: goalId }
    );

    return { success: result.success, result: result.result };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    await supabase
      .from("agent_goals")
      .update({
        status: "failed",
        result: `Agent execution failed: ${errorMessage}`,
      })
      .eq("id", goalId);

    await enqueueNotification(
      userId,
      "Agent Goal Failed",
      `Failed to complete goal: ${errorMessage}`,
      "in_app",
      { goal_id: goalId }
    );

    throw error;
  }
}
