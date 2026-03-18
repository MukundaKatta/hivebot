import type { DiscordConfig } from "@/types";

export async function sendDiscordMessage(config: DiscordConfig): Promise<{ success: boolean; error?: string }> {
  try {
    const webhookUrl = config.webhook_url || process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
      return { success: false, error: "No Discord webhook URL configured" };
    }

    const payload: Record<string, unknown> = {
      content: config.message,
    };

    if (config.embed) {
      payload.embeds = [
        {
          title: config.embed.title,
          description: config.embed.description,
          color: config.embed.color || 0x4870ea,
          timestamp: new Date().toISOString(),
          footer: { text: "HiveBot" },
        },
      ];
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      return { success: false, error: `Discord API error: ${response.status} - ${text}` };
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Discord error";
    return { success: false, error: message };
  }
}
