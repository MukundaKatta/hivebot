import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/client";

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("notifications").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: "Notification deleted" });
}
