import { Job } from "bullmq";
import { getSupabaseAdmin } from "@/lib/supabase/client";
import { sendEmail } from "@/lib/integrations/email";
import { sendSlackMessage } from "@/lib/integrations/slack";
import { sendDiscordMessage } from "@/lib/integrations/discord";
import { executeHttpRequest } from "@/lib/integrations/http";
import { scrapeUrl } from "@/lib/integrations/scraper";
import { executeGoogleSheets } from "@/lib/integrations/google-sheets";
import { enqueueNotification } from "@/lib/queue/queues";
import type { Workflow, WorkflowNode, WorkflowEdge } from "@/types";

export async function handleWorkflowExecution(job: Job) {
  const { workflowId, triggeredBy } = job.data;
  const supabase = getSupabaseAdmin();

  // Fetch workflow
  const { data: workflow, error } = await supabase
    .from("workflows")
    .select("*")
    .eq("id", workflowId)
    .single();

  if (error || !workflow) {
    throw new Error(`Workflow not found: ${error?.message}`);
  }

  const nodes: WorkflowNode[] = workflow.nodes || [];
  const edges: WorkflowEdge[] = workflow.edges || [];

  if (nodes.length === 0) {
    throw new Error("Workflow has no nodes");
  }

  // Build execution order (topological sort)
  const executionOrder = getExecutionOrder(nodes, edges);
  const context: Record<string, unknown> = {
    triggeredBy,
    workflowId,
    timestamp: new Date().toISOString(),
  };

  // Execute nodes in order
  for (const nodeId of executionOrder) {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) continue;

    try {
      const result = await executeNode(node, context);
      context[`result_${node.id}`] = result;
      context[`status_${node.id}`] = "completed";
    } catch (err) {
      context[`status_${node.id}`] = "failed";
      context[`error_${node.id}`] = err instanceof Error ? err.message : "Unknown error";

      // Check if there's a condition node that handles failure
      const hasFailureHandler = edges.some(
        (e) => e.source === node.id && e.condition?.field === "status" && e.condition?.value === "failed"
      );

      if (!hasFailureHandler) {
        throw err;
      }
    }
  }

  // Notify completion
  await enqueueNotification(
    workflow.user_id,
    "Workflow Completed",
    `Workflow "${workflow.name}" executed successfully`,
    "in_app",
    { workflow_id: workflowId }
  );

  return { success: true, context };
}

function getExecutionOrder(nodes: WorkflowNode[], edges: WorkflowEdge[]): string[] {
  const inDegree: Record<string, number> = {};
  const adjacency: Record<string, string[]> = {};

  nodes.forEach((node) => {
    inDegree[node.id] = 0;
    adjacency[node.id] = [];
  });

  edges.forEach((edge) => {
    adjacency[edge.source]?.push(edge.target);
    if (inDegree[edge.target] !== undefined) {
      inDegree[edge.target]++;
    }
  });

  // Kahn's algorithm
  const queue = Object.entries(inDegree)
    .filter(([, degree]) => degree === 0)
    .map(([id]) => id);

  const order: string[] = [];
  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    order.push(nodeId);
    for (const neighbor of adjacency[nodeId] || []) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor);
      }
    }
  }

  return order;
}

async function executeNode(node: WorkflowNode, context: Record<string, unknown>): Promise<unknown> {
  const config = resolveConfig(node.config, context);

  switch (node.type) {
    case "trigger":
      // Triggers are starting points, just pass through
      return { triggered: true, type: node.integration };

    case "condition": {
      const field = config.field as string;
      const operator = config.operator as string;
      const value = config.value as string;
      const actual = String(context[field] ?? "");
      return evaluateCondition(actual, operator, value);
    }

    case "delay": {
      const delayMs = Number(config.delay_ms) || 1000;
      await new Promise((resolve) => setTimeout(resolve, Math.min(delayMs, 60000)));
      return { delayed: true, ms: delayMs };
    }

    case "action":
      return executeAction(node, config);

    default:
      throw new Error(`Unknown node type: ${node.type}`);
  }
}

async function executeAction(node: WorkflowNode, config: Record<string, unknown>): Promise<unknown> {
  switch (node.integration) {
    case "email":
      return sendEmail({
        to: Array.isArray(config.to) ? config.to : [config.to as string],
        subject: config.subject as string,
        body: config.body as string,
      });

    case "slack":
      return sendSlackMessage({
        webhook_url: config.webhook_url as string,
        message: config.message as string,
        channel: config.channel as string,
      });

    case "discord":
      return sendDiscordMessage({
        webhook_url: config.webhook_url as string,
        message: config.message as string,
      });

    case "http":
      return executeHttpRequest({
        url: config.url as string,
        method: (config.method as "GET" | "POST" | "PUT" | "PATCH" | "DELETE") || "GET",
        headers: (config.headers as Record<string, string>) || {},
        body: config.body as string,
        timeout_ms: (config.timeout_ms as number) || 30000,
      });

    case "scraper":
      return scrapeUrl({
        url: config.url as string,
        selectors: (config.selectors as Array<{ name: string; selector: string; attribute?: string; multiple: boolean }>) || [],
      });

    case "google_sheets":
      return executeGoogleSheets({
        spreadsheet_id: config.spreadsheet_id as string,
        sheet_name: config.sheet_name as string,
        range: config.range as string,
        action: config.action as "read" | "write" | "append",
        data: config.data as string[][],
      });

    default:
      throw new Error(`Unknown integration: ${node.integration}`);
  }
}

function evaluateCondition(actual: string, operator: string, expected: string): boolean {
  switch (operator) {
    case "eq":
      return actual === expected;
    case "neq":
      return actual !== expected;
    case "gt":
      return Number(actual) > Number(expected);
    case "lt":
      return Number(actual) < Number(expected);
    case "contains":
      return actual.includes(expected);
    case "not_contains":
      return !actual.includes(expected);
    default:
      return false;
  }
}

function resolveConfig(config: Record<string, unknown>, context: Record<string, unknown>): Record<string, unknown> {
  const resolved: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(config)) {
    if (typeof value === "string") {
      resolved[key] = value.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (_, path) => {
        const parts = path.split(".");
        let current: unknown = context;
        for (const part of parts) {
          if (current && typeof current === "object" && part in current) {
            current = (current as Record<string, unknown>)[part];
          } else {
            return `{{${path}}}`;
          }
        }
        return String(current ?? "");
      });
    } else {
      resolved[key] = value;
    }
  }
  return resolved;
}
