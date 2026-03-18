import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function parseCronExpression(expression: string): string {
  const parts = expression.split(" ");
  if (parts.length !== 5) return expression;

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
  const descriptions: string[] = [];

  if (minute === "0" && hour === "*") descriptions.push("Every hour");
  else if (minute === "*/5") descriptions.push("Every 5 minutes");
  else if (minute === "*/15") descriptions.push("Every 15 minutes");
  else if (minute === "*/30") descriptions.push("Every 30 minutes");
  else if (hour !== "*" && minute !== "*") {
    descriptions.push(`At ${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`);
  }

  if (dayOfWeek === "1-5") descriptions.push("weekdays");
  else if (dayOfWeek === "0,6") descriptions.push("weekends");
  else if (dayOfMonth !== "*") descriptions.push(`on day ${dayOfMonth}`);

  return descriptions.join(", ") || expression;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "completed":
    case "success":
      return "text-green-500";
    case "failed":
    case "error":
      return "text-red-500";
    case "running":
    case "active":
      return "text-blue-500";
    case "pending":
    case "waiting":
      return "text-yellow-500";
    case "paused":
      return "text-gray-500";
    default:
      return "text-muted-foreground";
  }
}

export function getStatusBg(status: string): string {
  switch (status) {
    case "completed":
    case "success":
      return "bg-green-500/10 text-green-500 border-green-500/20";
    case "failed":
    case "error":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    case "running":
    case "active":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "pending":
    case "waiting":
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    case "paused":
      return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}
