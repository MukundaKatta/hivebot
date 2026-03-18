import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/client";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("task_runs")
    .select("*")
    .eq("task_id", params.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
