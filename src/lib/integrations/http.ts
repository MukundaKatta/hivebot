import type { HttpConfig } from "@/types";

export async function executeHttpRequest(config: HttpConfig): Promise<{
  success: boolean;
  status?: number;
  data?: unknown;
  headers?: Record<string, string>;
  error?: string;
}> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.timeout_ms || 30000);

    const fetchOptions: RequestInit = {
      method: config.method,
      headers: config.headers || {},
      signal: controller.signal,
    };

    if (config.body && ["POST", "PUT", "PATCH"].includes(config.method)) {
      fetchOptions.body = config.body;
    }

    const response = await fetch(config.url, fetchOptions);
    clearTimeout(timeout);

    const contentType = response.headers.get("content-type") || "";
    let data: unknown;

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    return {
      success: response.ok,
      status: response.status,
      data,
      headers: responseHeaders,
      error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`,
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return { success: false, error: `Request timed out after ${config.timeout_ms || 30000}ms` };
    }
    const message = error instanceof Error ? error.message : "Unknown HTTP error";
    return { success: false, error: message };
  }
}
