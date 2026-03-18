import { NextRequest, NextResponse } from "next/server";
import { enqueueWorkflow } from "@/lib/queue/queues";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await enqueueWorkflow(params.id, "manual");
    return NextResponse.json({ message: "Workflow execution queued" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
