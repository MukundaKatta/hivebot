import { chatCompletion } from "./openai";
import type { AgentStep, IntegrationType } from "@/types";
import { sendEmail } from "../integrations/email";
import { sendSlackMessage } from "../integrations/slack";
import { sendDiscordMessage } from "../integrations/discord";
import { executeHttpRequest } from "../integrations/http";
import { scrapeUrl } from "../integrations/scraper";

const AGENT_SYSTEM_PROMPT = `You are HiveBot Agent, an AI assistant that breaks down goals into executable steps and carries them out.

When given a goal, you should:
1. Think about what needs to be done (type: "think")
2. Plan concrete actions (type: "action")
3. Observe the results (type: "observe")
4. Decide what to do next (type: "decide")

Available action types:
- email: Send emails (config: { to, subject, body })
- slack: Send Slack messages (config: { webhook_url, message })
- discord: Send Discord messages (config: { webhook_url, message })
- http: Make HTTP requests (config: { url, method, headers, body })
- scraper: Scrape web pages (config: { url, selectors })
- file: File operations (config: { action, path })
- calendar: Calendar operations (config: { action, event })

Return a JSON object with:
- steps: array of step objects with { description, type, action_type, action_config }
- reasoning: brief explanation of your plan

Always respond with valid JSON.`;

export interface AgentExecutionResult {
  steps: AgentStep[];
  result: string;
  success: boolean;
}

export async function planAgentSteps(goal: string): Promise<AgentStep[]> {
  const response = await chatCompletion(
    [
      { role: "system", content: AGENT_SYSTEM_PROMPT },
      { role: "user", content: `Goal: ${goal}\n\nPlan the steps needed to accomplish this goal.` },
    ],
    { temperature: 0.5, response_format: { type: "json_object" } }
  );

  const parsed = JSON.parse(response);
  const steps: AgentStep[] = (parsed.steps || []).map((step: Record<string, unknown>, index: number) => ({
    id: `step-${index}`,
    description: step.description || `Step ${index + 1}`,
    type: step.type || "action",
    status: "pending" as const,
    action_type: step.action_type as IntegrationType | undefined,
    action_config: step.action_config as Record<string, unknown> | undefined,
  }));

  return steps;
}

export async function executeAgentStep(step: AgentStep): Promise<{ success: boolean; result: string }> {
  if (step.type === "think" || step.type === "observe" || step.type === "decide") {
    return { success: true, result: step.description };
  }

  if (!step.action_type || !step.action_config) {
    return { success: false, result: "No action configured for this step" };
  }

  try {
    switch (step.action_type) {
      case "email": {
        const config = step.action_config as { to: string[]; subject: string; body: string };
        const result = await sendEmail({ to: config.to, subject: config.subject, body: config.body });
        return { success: result.success, result: result.success ? "Email sent" : result.error || "Failed" };
      }
      case "slack": {
        const config = step.action_config as { webhook_url: string; message: string };
        const result = await sendSlackMessage(config);
        return { success: result.success, result: result.success ? "Slack message sent" : result.error || "Failed" };
      }
      case "discord": {
        const config = step.action_config as { webhook_url: string; message: string };
        const result = await sendDiscordMessage(config);
        return { success: result.success, result: result.success ? "Discord message sent" : result.error || "Failed" };
      }
      case "http": {
        const config = step.action_config as { url: string; method: string; headers?: Record<string, string>; body?: string };
        const result = await executeHttpRequest({
          url: config.url,
          method: (config.method || "GET") as "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
          headers: config.headers || {},
          body: config.body,
          timeout_ms: 30000,
        });
        return {
          success: result.success,
          result: result.success ? JSON.stringify(result.data).slice(0, 500) : result.error || "Failed",
        };
      }
      case "scraper": {
        const config = step.action_config as { url: string; selectors: Array<{ name: string; selector: string; multiple?: boolean }> };
        const result = await scrapeUrl({
          url: config.url,
          selectors: (config.selectors || []).map((s) => ({ ...s, multiple: s.multiple ?? true })),
        });
        return {
          success: result.success,
          result: result.success ? JSON.stringify(result.data).slice(0, 1000) : result.error || "Failed",
        };
      }
      default:
        return { success: false, result: `Unknown action type: ${step.action_type}` };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, result: message };
  }
}

export async function executeAgentGoal(goal: string): Promise<AgentExecutionResult> {
  const steps = await planAgentSteps(goal);
  const executedSteps: AgentStep[] = [];
  let overallSuccess = true;

  for (const step of steps) {
    const updatedStep = { ...step, status: "running" as const, started_at: new Date().toISOString() };

    const result = await executeAgentStep(updatedStep);

    updatedStep.status = result.success ? "completed" : "failed";
    updatedStep.result = result.result;
    updatedStep.completed_at = new Date().toISOString();

    executedSteps.push(updatedStep);

    if (!result.success && step.type === "action") {
      overallSuccess = false;
      // Continue executing remaining steps unless it's critical
    }
  }

  const summaryResponse = await chatCompletion(
    [
      {
        role: "system",
        content: "Summarize the results of these agent steps in 1-2 sentences. Be concise.",
      },
      {
        role: "user",
        content: `Goal: ${goal}\n\nSteps completed:\n${executedSteps.map((s) => `- ${s.description}: ${s.status} ${s.result ? `(${s.result})` : ""}`).join("\n")}`,
      },
    ],
    { temperature: 0.3, max_tokens: 200 }
  );

  return {
    steps: executedSteps,
    result: summaryResponse,
    success: overallSuccess,
  };
}
