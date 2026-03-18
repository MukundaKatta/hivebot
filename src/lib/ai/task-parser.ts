import { chatCompletion } from "./openai";
import type { WorkflowNode, WorkflowEdge, ScheduleType } from "@/types";

export interface ParsedTask {
  title: string;
  description: string;
  schedule_type: ScheduleType | null;
  schedule_value: string | null;
  cron_expression: string | null;
  workflow_nodes: WorkflowNode[];
  workflow_edges: WorkflowEdge[];
  tags: string[];
}

const SYSTEM_PROMPT = `You are HiveBot's task parser. Given a natural language task description, extract structured task information.

Return a JSON object with these fields:
- title: short title for the task (max 80 chars)
- description: detailed description of what the task does
- schedule_type: one of "once", "cron", "interval", "natural_language", or null if no schedule
- schedule_value: the schedule in human-readable form (e.g., "daily at 9am", "every 30 minutes")
- cron_expression: valid cron expression if scheduled (5 fields: minute hour day month weekday), null otherwise
- tags: array of relevant tags
- steps: array of step objects, each with:
  - type: "trigger" | "action" | "condition"
  - integration: "email" | "slack" | "discord" | "google_sheets" | "http" | "scraper" | "file" | "calendar" | null
  - label: human-readable step description
  - config: object with integration-specific config

Examples:
- "Scrape top 10 products from ProductHunt daily and email me" ->
  schedule: daily, steps: [trigger(cron), action(scraper), action(email)]
- "Every Monday at 9am, check my Google Sheet and post a summary to Slack" ->
  schedule: weekly monday 9am, steps: [trigger(cron), action(google_sheets), action(slack)]
- "Watch my Downloads folder and organize files by type" ->
  schedule: null (continuous), steps: [trigger(file watch), action(file organize)]

Always respond with valid JSON only.`;

export async function parseNaturalLanguageTask(input: string): Promise<ParsedTask> {
  const response = await chatCompletion(
    [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: input },
    ],
    { temperature: 0.3, response_format: { type: "json_object" } }
  );

  const parsed = JSON.parse(response);

  // Convert steps to workflow nodes and edges
  const nodes: WorkflowNode[] = [];
  const edges: WorkflowEdge[] = [];

  if (parsed.steps && Array.isArray(parsed.steps)) {
    parsed.steps.forEach((step: Record<string, unknown>, index: number) => {
      const nodeId = `node-${index}`;
      nodes.push({
        id: nodeId,
        type: (step.type as WorkflowNode["type"]) || "action",
        integration: step.integration as WorkflowNode["integration"],
        label: (step.label as string) || `Step ${index + 1}`,
        config: (step.config as Record<string, unknown>) || {},
        position: { x: 250, y: 100 + index * 150 },
      });

      if (index > 0) {
        edges.push({
          id: `edge-${index - 1}-${index}`,
          source: `node-${index - 1}`,
          target: nodeId,
        });
      }
    });
  }

  return {
    title: parsed.title || "Untitled Task",
    description: parsed.description || input,
    schedule_type: parsed.schedule_type || null,
    schedule_value: parsed.schedule_value || null,
    cron_expression: parsed.cron_expression || null,
    workflow_nodes: nodes,
    workflow_edges: edges,
    tags: parsed.tags || [],
  };
}

export async function suggestCronExpression(naturalLanguage: string): Promise<string | null> {
  const response = await chatCompletion(
    [
      {
        role: "system",
        content: "Convert the following natural language schedule description to a cron expression (5 fields: minute hour day-of-month month day-of-week). Return ONLY the cron expression, nothing else. If you cannot parse it, return 'null'.",
      },
      { role: "user", content: naturalLanguage },
    ],
    { temperature: 0, max_tokens: 50 }
  );

  const trimmed = response.trim();
  if (trimmed === "null" || trimmed.split(" ").length !== 5) return null;
  return trimmed;
}
