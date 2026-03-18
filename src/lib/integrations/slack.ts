import type { SlackConfig } from "@/types";

export async function sendSlackMessage(config: SlackConfig): Promise<{ success: boolean; error?: string }> {
  try {
    const webhookUrl = config.webhook_url || process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) {
      return { success: false, error: "No Slack webhook URL configured" };
    }

    const payload: Record<string, unknown> = {
      text: config.message,
    };
    if (config.channel) {
      payload.channel = config.channel;
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return { success: false, error: `Slack API error: ${response.status} ${response.statusText}` };
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Slack error";
    return { success: false, error: message };
  }
}

export async function sendSlackRichMessage(
  webhookUrl: string,
  blocks: Record<string, unknown>[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocks }),
    });

    if (!response.ok) {
      return { success: false, error: `Slack API error: ${response.status}` };
    }
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}
