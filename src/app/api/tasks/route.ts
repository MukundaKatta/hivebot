import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/client";
import { enqueueTask, scheduleRepeatingTask } from "@/lib/queue/queues";
import { parseNaturalLanguageTask } from "@/lib/ai/task-parser";

// GET /api/tasks - List tasks
export async function GET(request: NextRequest) {
  const supabase = getSupabaseAdmin();
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  let query = supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (status) query = query.eq("status", status);
  if (search) query = query.ilike("title", `%${search}%`);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  const supabase = getSupabaseAdmin();
  const body = await request.json();

  try {
    let taskData = body;

    // If natural language input is provided, parse it with AI
    if (body.natural_language_input && !body.title) {
      const parsed = await parseNaturalLanguageTask(body.natural_language_input);
      taskData = {
        ...body,
        title: parsed.title,
        description: parsed.description,
        schedule_type: parsed.schedule_type,
        schedule_value: parsed.schedule_value,
        cron_expression: parsed.cron_expression,
        tags: parsed.tags,
      };

      // If workflow nodes were generated, create a workflow
      if (parsed.workflow_nodes.length > 0) {
        const { data: workflow } = await supabase
          .from("workflows")
          .insert({
            user_id: body.user_id || "00000000-0000-0000-0000-000000000000",
            name: `Workflow: ${parsed.title}`,
            description: parsed.description,
            nodes: parsed.workflow_nodes,
            edges: parsed.workflow_edges,
          })
          .select()
          .single();

        if (workflow) {
          taskData.workflow_id = workflow.id;
        }
      }
    }

    // Set a default user_id if not provided (demo mode)
    if (!taskData.user_id) {
      taskData.user_id = "00000000-0000-0000-0000-000000000000";
    }

    const { data: task, error } = await supabase
      .from("tasks")
      .insert({
        user_id: taskData.user_id,
        title: taskData.title,
        description: taskData.description || "",
        natural_language_input: taskData.natural_language_input,
        status: "pending",
        schedule_type: taskData.schedule_type,
        schedule_value: taskData.schedule_value,
        cron_expression: taskData.cron_expression,
        workflow_id: taskData.workflow_id,
        tags: taskData.tags || [],
        max_retries: taskData.max_retries || 3,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Schedule the task if it has a cron expression
    if (task.cron_expression) {
      await scheduleRepeatingTask(task.id, task.cron_expression);
    } else if (taskData.run_immediately !== false) {
      // Enqueue for immediate execution
      await enqueueTask(task.id);
    }

    return NextResponse.json({ data: task }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
