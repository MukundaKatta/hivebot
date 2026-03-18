import { Queue } from "bullmq";
import { getRedisConnection } from "./connection";

export const QUEUE_NAMES = {
  TASK_EXECUTION: "task-execution",
  SCRAPER: "scraper",
  EMAIL: "email",
  NOTIFICATION: "notification",
  WORKFLOW: "workflow-execution",
  FILE_ORGANIZER: "file-organizer",
  AGENT: "agent-execution",
  SCHEDULER: "scheduler",
} as const;

type QueueCache = Record<string, Queue>;
const queueCache: QueueCache = {};

function getQueue(name: string): Queue {
  if (!queueCache[name]) {
    queueCache[name] = new Queue(name, {
      connection: getRedisConnection(),
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 1000,
        },
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 5000 },
      },
    });
  }
  return queueCache[name];
}

export const taskQueue = () => getQueue(QUEUE_NAMES.TASK_EXECUTION);
export const scraperQueue = () => getQueue(QUEUE_NAMES.SCRAPER);
export const emailQueue = () => getQueue(QUEUE_NAMES.EMAIL);
export const notificationQueue = () => getQueue(QUEUE_NAMES.NOTIFICATION);
export const workflowQueue = () => getQueue(QUEUE_NAMES.WORKFLOW);
export const fileOrganizerQueue = () => getQueue(QUEUE_NAMES.FILE_ORGANIZER);
export const agentQueue = () => getQueue(QUEUE_NAMES.AGENT);
export const schedulerQueue = () => getQueue(QUEUE_NAMES.SCHEDULER);

// Helper to enqueue a task execution
export async function enqueueTask(taskId: string, data?: Record<string, unknown>) {
  return taskQueue().add("execute", { taskId, ...data }, { jobId: `task-${taskId}-${Date.now()}` });
}

// Helper to enqueue a scraper job
export async function enqueueScraper(taskId: string, config: Record<string, unknown>) {
  return scraperQueue().add("scrape", { taskId, config }, { jobId: `scrape-${taskId}-${Date.now()}` });
}

// Helper to enqueue email
export async function enqueueEmail(to: string[], subject: string, body: string, from?: string) {
  return emailQueue().add("send", { to, subject, body, from });
}

// Helper to enqueue notification
export async function enqueueNotification(
  userId: string,
  title: string,
  message: string,
  channel: "email" | "webhook" | "in_app" = "in_app",
  metadata?: Record<string, unknown>
) {
  return notificationQueue().add("notify", { userId, title, message, channel, metadata });
}

// Helper to enqueue workflow execution
export async function enqueueWorkflow(workflowId: string, triggeredBy?: string) {
  return workflowQueue().add("execute", { workflowId, triggeredBy }, { jobId: `wf-${workflowId}-${Date.now()}` });
}

// Helper to schedule a repeating task
export async function scheduleRepeatingTask(taskId: string, cronExpression: string) {
  return taskQueue().add(
    "execute",
    { taskId },
    {
      jobId: `scheduled-${taskId}`,
      repeat: { pattern: cronExpression },
    }
  );
}

// Remove a scheduled repeating task
export async function removeScheduledTask(taskId: string) {
  const repeatableJobs = await taskQueue().getRepeatableJobs();
  for (const job of repeatableJobs) {
    if (job.id === `scheduled-${taskId}`) {
      await taskQueue().removeRepeatableByKey(job.key);
    }
  }
}
