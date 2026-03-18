import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/client";

export async function GET(request: NextRequest) {
  const supabase = getSupabaseAdmin();
  const searchParams = request.nextUrl.searchParams;
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  let query = supabase.from("calendar_events").select("*").order("start_time", { ascending: true });

  if (start) query = query.gte("start_time", start);
  if (end) query = query.lte("end_time", end);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseAdmin();
  const body = await request.json();

  const { data, error } = await supabase
    .from("calendar_events")
    .insert({
      user_id: body.user_id || "00000000-0000-0000-0000-000000000000",
      title: body.title,
      description: body.description,
      start_time: body.start_time,
      end_time: body.end_time,
      all_day: body.all_day || false,
      location: body.location,
      reminder_minutes: body.reminder_minutes,
      color: body.color || "#4870ea",
      recurrence: body.recurrence,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
