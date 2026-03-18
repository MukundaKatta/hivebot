import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/client";
import { agentQueue } from "@/lib/queue/queues";

export async function GET() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("agent_goals")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseAdmin();
  const { goal, user_id } = await request.json();

  if (!goal) {
    return NextResponse.json({ error: "Goal is required" }, { status: 400 });
  }

  const userId = user_id || "00000000-0000-0000-0000-000000000000";

  const { data, error } = await supabase
    .from("agent_goals")
    .insert({
      user_id: userId,
      goal,
      status: "planning",
      steps: [],
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Enqueue agent execution
  await agentQueue().add("execute", {
    goalId: data.id,
    goal,
    userId,
  });

  return NextResponse.json({ data }, { status: 201 });
}
