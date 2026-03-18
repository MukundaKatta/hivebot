import { Job } from "bullmq";
import { getSupabaseAdmin } from "@/lib/supabase/client";
import { scrapeUrl, scrapeWithPagination } from "@/lib/integrations/scraper";
import { enqueueNotification } from "@/lib/queue/queues";
import type { ScraperConfig } from "@/types";

export async function handleScraperJob(job: Job) {
  const { taskId, config } = job.data as { taskId: string; config: ScraperConfig };
  const supabase = getSupabaseAdmin();

  // Fetch task to get user_id
  const { data: task } = await supabase.from("tasks").select("user_id, title").eq("id", taskId).single();
  if (!task) throw new Error("Task not found");

  try {
    let results;

    if (config.pagination) {
      results = await scrapeWithPagination(config);
    } else {
      const result = await scrapeUrl(config);
      results = [result];
    }

    const successfulResults = results.filter((r) => r.success);
    const failedResults = results.filter((r) => !r.success);

    // Store scrape results
    for (const result of successfulResults) {
      await supabase.from("scraper_results").insert({
        task_id: taskId,
        url: result.url,
        data: result.data,
        scraped_at: result.timestamp,
      });
    }

    // Notify user
    const message =
      failedResults.length > 0
        ? `Scraped ${successfulResults.length}/${results.length} pages from ${config.url}. ${failedResults.length} failed.`
        : `Successfully scraped ${successfulResults.length} pages from ${config.url}`;

    await enqueueNotification(task.user_id, "Scraper Complete", message, "in_app", {
      task_id: taskId,
      results_count: successfulResults.length,
      failed_count: failedResults.length,
    });

    return {
      success: true,
      scraped: successfulResults.length,
      failed: failedResults.length,
      data: successfulResults.map((r) => r.data),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Scraper error";

    await enqueueNotification(
      task.user_id,
      "Scraper Failed",
      `Failed to scrape ${config.url}: ${errorMessage}`,
      "in_app",
      { task_id: taskId }
    );

    throw error;
  }
}
