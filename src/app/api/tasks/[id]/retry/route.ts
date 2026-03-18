import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/client";
import { enqueueTask } from "@/lib/queue/queues";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = getSupabaseAdmin();

  // Reset task status and re-enqueue
  const { error } = await supabase
    .from("tasks")
    .update({ status: "pending" })
    .eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await enqueueTask(params.id, { retry: true });

  return NextResponse.json({ message: "Task retry queued" });
}
