import OpenAI from "openai";

let openaiClient: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

export async function chatCompletion(
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  options?: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    response_format?: { type: "json_object" | "text" };
  }
): Promise<string> {
  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: options?.model || "gpt-4-turbo-preview",
    messages,
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.max_tokens ?? 2048,
    response_format: options?.response_format,
  });

  return response.choices[0]?.message?.content || "";
}
