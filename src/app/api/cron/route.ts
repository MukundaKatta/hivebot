import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/client";
import { enqueueTask } from "@/lib/queue/queues";

// This endpoint is called by an external cron service (e.g., Vercel Cron, GitHub Actions)
// to check for tasks that need to be executed
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();

  // Find tasks that are due to run
  const { data: dueTasks, error } = await supabase
    .from("tasks")
    .select("*")
    .lte("next_run_at", now)
    .in("status", ["pending", "completed"])
    .not("cron_expression", "is", null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results = [];
  for (const task of dueTasks || []) {
    try {
      await enqueueTask(task.id);
      results.push({ id: task.id, status: "queued" });
    } catch (err) {
      results.push({ id: task.id, status: "error", error: (err as Error).message });
    }
  }

  return NextResponse.json({
    data: {
      checked_at: now,
      tasks_found: dueTasks?.length || 0,
      results,
    },
  });
}
