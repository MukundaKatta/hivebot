import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/client";

export async function POST() {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("is_read", false);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: "All notifications marked as read" });
}
