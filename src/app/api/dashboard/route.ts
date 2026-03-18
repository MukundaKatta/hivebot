import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/client";
import type { DashboardStats } from "@/types";

export async function GET() {
  const supabase = getSupabaseAdmin();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  try {
    const [
      { count: totalTasks },
      { count: activeTasks },
      { count: completedToday },
      { count: failedToday },
      { data: upcomingTasks },
      { data: recentRuns },
      { count: activeWorkflows },
      { count: unreadNotifications },
    ] = await Promise.all([
      supabase.from("tasks").select("*", { count: "exact", head: true }),
      supabase.from("tasks").select("*", { count: "exact", head: true }).in("status", ["running", "pending"]),
      supabase.from("task_runs").select("*", { count: "exact", head: true }).eq("status", "completed").gte("created_at", todayISO),
      supabase.from("task_runs").select("*", { count: "exact", head: true }).eq("status", "failed").gte("created_at", todayISO),
      supabase.from("tasks").select("*").not("next_run_at", "is", null).order("next_run_at", { ascending: true }).limit(5),
      supabase.from("task_runs").select("*").order("created_at", { ascending: false }).limit(10),
      supabase.from("workflows").select("*", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("notifications").select("*", { count: "exact", head: true }).eq("is_read", false),
    ]);

    const total = (completedToday || 0) + (failedToday || 0);
    const successRate = total > 0 ? Math.round(((completedToday || 0) / total) * 100) : 100;

    const stats: DashboardStats = {
      total_tasks: totalTasks || 0,
      active_tasks: activeTasks || 0,
      completed_today: completedToday || 0,
      failed_today: failedToday || 0,
      success_rate: successRate,
      upcoming_runs: upcomingTasks || [],
      recent_runs: recentRuns || [],
      active_workflows: activeWorkflows || 0,
      unread_notifications: unreadNotifications || 0,
    };

    return NextResponse.json({ data: stats });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
