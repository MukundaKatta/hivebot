// ==================== Core Types ====================

export type TaskStatus = "pending" | "running" | "completed" | "failed" | "paused" | "cancelled";
export type WorkflowNodeType = "trigger" | "action" | "condition" | "delay";
export type IntegrationType = "email" | "slack" | "discord" | "google_sheets" | "http" | "scraper" | "file" | "calendar";
export type NotificationChannel = "email" | "webhook" | "in_app";
export type ScheduleType = "once" | "cron" | "interval" | "natural_language";

// ==================== Task ====================

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string;
  natural_language_input?: string;
  status: TaskStatus;
  schedule_type: ScheduleType | null;
  schedule_value: string | null;
  cron_expression: string | null;
  next_run_at: string | null;
  last_run_at: string | null;
  workflow_id: string | null;
  retry_count: number;
  max_retries: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface TaskRun {
  id: string;
  task_id: string;
  status: TaskStatus;
  started_at: string;
  completed_at: string | null;
  duration_ms: number | null;
  logs: TaskLog[];
  error: string | null;
  output: Record<string, unknown> | null;
  retry_of: string | null;
  created_at: string;
}

export interface TaskLog {
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  message: string;
  data?: Record<string, unknown>;
}

// ==================== Workflow ====================

export interface Workflow {
  id: string;
  user_id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  integration?: IntegrationType;
  label: string;
  config: Record<string, unknown>;
  position: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: {
    field: string;
    operator: "eq" | "neq" | "gt" | "lt" | "contains" | "not_contains";
    value: string;
  };
}

// ==================== Integrations ====================

export interface Integration {
  id: string;
  user_id: string;
  type: IntegrationType;
  name: string;
  config: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  to: string[];
  subject: string;
  body: string;
}

export interface SlackConfig {
  webhook_url: string;
  channel?: string;
  message: string;
}

export interface DiscordConfig {
  webhook_url: string;
  message: string;
  embed?: {
    title: string;
    description: string;
    color?: number;
  };
}

export interface HttpConfig {
  url: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers: Record<string, string>;
  body?: string;
  timeout_ms: number;
}

export interface ScraperConfig {
  url: string;
  selectors: ScraperSelector[];
  pagination?: {
    next_selector: string;
    max_pages: number;
  };
  schedule?: string;
  headers?: Record<string, string>;
}

export interface ScraperSelector {
  name: string;
  selector: string;
  attribute?: string; // e.g., "href", "src", defaults to textContent
  multiple: boolean;
}

export interface GoogleSheetsConfig {
  spreadsheet_id: string;
  sheet_name: string;
  range: string;
  action: "read" | "write" | "append";
  data?: string[][];
}

// ==================== Calendar ====================

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  all_day: boolean;
  location?: string;
  reminder_minutes?: number;
  color?: string;
  recurrence?: string;
  created_at: string;
  updated_at: string;
}

// ==================== File Organizer ====================

export interface FileRule {
  id: string;
  user_id: string;
  name: string;
  watch_path: string;
  conditions: FileCondition[];
  actions: FileAction[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FileCondition {
  type: "extension" | "name_contains" | "name_regex" | "size_gt" | "size_lt" | "created_after";
  value: string;
}

export interface FileAction {
  type: "move" | "rename" | "copy" | "tag" | "ai_categorize";
  destination?: string;
  pattern?: string;
}

// ==================== Notifications ====================

export interface Notification {
  id: string;
  user_id: string;
  task_id?: string;
  title: string;
  message: string;
  channel: NotificationChannel;
  is_read: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
}

// ==================== Agent Mode ====================

export interface AgentGoal {
  id: string;
  user_id: string;
  goal: string;
  status: "planning" | "executing" | "completed" | "failed";
  steps: AgentStep[];
  result?: string;
  created_at: string;
  updated_at: string;
}

export interface AgentStep {
  id: string;
  description: string;
  type: "think" | "action" | "observe" | "decide";
  status: TaskStatus;
  action_type?: IntegrationType | "workflow";
  action_config?: Record<string, unknown>;
  result?: string;
  started_at?: string;
  completed_at?: string;
}

// ==================== API Responses ====================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  has_more: boolean;
}

// ==================== Dashboard Stats ====================

export interface DashboardStats {
  total_tasks: number;
  active_tasks: number;
  completed_today: number;
  failed_today: number;
  success_rate: number;
  upcoming_runs: Task[];
  recent_runs: TaskRun[];
  active_workflows: number;
  unread_notifications: number;
}
