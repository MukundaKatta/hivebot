import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/client";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = getSupabaseAdmin();
  const body = await request.json();
  const { data, error } = await supabase.from("calendar_events").update(body).eq("id", params.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("calendar_events").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: "Event deleted" });
}
