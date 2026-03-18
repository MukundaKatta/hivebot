import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/client";
import { enqueueScraper, scheduleRepeatingTask } from "@/lib/queue/queues";

export async function POST(request: NextRequest) {
  const supabase = getSupabaseAdmin();

  try {
    const body = await request.json();
    const { url, selectors, pagination, schedule, user_id } = body;

    // Create a task for the scraper
    const { data: task, error } = await supabase
      .from("tasks")
      .insert({
        user_id: user_id || "00000000-0000-0000-0000-000000000000",
        title: `Scrape: ${new URL(url).hostname}`,
        description: `Scraping ${url} with ${selectors.length} selectors`,
        status: "pending",
        schedule_type: schedule ? "cron" : "once",
        cron_expression: schedule || null,
        tags: ["scraper"],
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const scraperConfig = { url, selectors, pagination };

    if (schedule) {
      await scheduleRepeatingTask(task.id, schedule);
    }

    // Execute immediately
    await enqueueScraper(task.id, scraperConfig);

    return NextResponse.json({ data: task }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
