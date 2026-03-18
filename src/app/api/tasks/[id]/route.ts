import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/client";
import { removeScheduledTask } from "@/lib/queue/queues";

// GET /api/tasks/:id
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("tasks").select("*").eq("id", params.id).single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ data });
}

// PATCH /api/tasks/:id
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = getSupabaseAdmin();
  const body = await request.json();

  const { data, error } = await supabase
    .from("tasks")
    .update(body)
    .eq("id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// DELETE /api/tasks/:id
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = getSupabaseAdmin();

  // Remove any scheduled jobs
  try {
    await removeScheduledTask(params.id);
  } catch {
    // Ignore if no scheduled task exists
  }

  const { error } = await supabase.from("tasks").delete().eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: "Task deleted" });
}
