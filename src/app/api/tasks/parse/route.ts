import { NextRequest, NextResponse } from "next/server";
import { parseNaturalLanguageTask } from "@/lib/ai/task-parser";

export async function POST(request: NextRequest) {
  try {
    const { input } = await request.json();

    if (!input) {
      return NextResponse.json({ error: "Input is required" }, { status: 400 });
    }

    const parsed = await parseNaturalLanguageTask(input);
    return NextResponse.json({ data: parsed });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Parse error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
