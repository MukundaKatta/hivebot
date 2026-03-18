import { Worker } from "bullmq";
import { createNewConnection } from "../lib/queue/connection";
import { QUEUE_NAMES } from "../lib/queue/queues";
import { handleTaskExecution } from "./handlers/task-handler";
import { handleScraperJob } from "./handlers/scraper-handler";
import { handleEmailJob } from "./handlers/email-handler";
import { handleNotificationJob } from "./handlers/notification-handler";
import { handleWorkflowExecution } from "./handlers/workflow-handler";
import { handleAgentExecution } from "./handlers/agent-handler";

console.log("[HiveBot Worker] Starting up...");

const connection = createNewConnection();

// Task execution worker
const taskWorker = new Worker(
  QUEUE_NAMES.TASK_EXECUTION,
  async (job) => {
    console.log(`[Task Worker] Processing job ${job.id}: ${JSON.stringify(job.data)}`);
    return handleTaskExecution(job);
  },
  { connection, concurrency: 5 }
);

// Scraper worker
const scraperWorker = new Worker(
  QUEUE_NAMES.SCRAPER,
  async (job) => {
    console.log(`[Scraper Worker] Processing job ${job.id}`);
    return handleScraperJob(job);
  },
  { connection: createNewConnection(), concurrency: 3 }
);

// Email worker
const emailWorker = new Worker(
  QUEUE_NAMES.EMAIL,
  async (job) => {
    console.log(`[Email Worker] Processing job ${job.id}`);
    return handleEmailJob(job);
  },
  { connection: createNewConnection(), concurrency: 10 }
);

// Notification worker
const notificationWorker = new Worker(
  QUEUE_NAMES.NOTIFICATION,
  async (job) => {
    console.log(`[Notification Worker] Processing job ${job.id}`);
    return handleNotificationJob(job);
  },
  { connection: createNewConnection(), concurrency: 10 }
);

// Workflow worker
const workflowWorker = new Worker(
  QUEUE_NAMES.WORKFLOW,
  async (job) => {
    console.log(`[Workflow Worker] Processing job ${job.id}`);
    return handleWorkflowExecution(job);
  },
  { connection: createNewConnection(), concurrency: 3 }
);

// Agent worker
const agentWorker = new Worker(
  QUEUE_NAMES.AGENT,
  async (job) => {
    console.log(`[Agent Worker] Processing job ${job.id}`);
    return handleAgentExecution(job);
  },
  { connection: createNewConnection(), concurrency: 2 }
);

// Error handlers
const workers = [taskWorker, scraperWorker, emailWorker, notificationWorker, workflowWorker, agentWorker];
const workerNames = ["Task", "Scraper", "Email", "Notification", "Workflow", "Agent"];

workers.forEach((worker, i) => {
  worker.on("completed", (job) => {
    console.log(`[${workerNames[i]} Worker] Job ${job.id} completed`);
  });
  worker.on("failed", (job, err) => {
    console.error(`[${workerNames[i]} Worker] Job ${job?.id} failed:`, err.message);
  });
  worker.on("error", (err) => {
    console.error(`[${workerNames[i]} Worker] Error:`, err.message);
  });
});

// Graceful shutdown
async function shutdown() {
  console.log("[HiveBot Worker] Shutting down gracefully...");
  await Promise.all(workers.map((w) => w.close()));
  await connection.quit();
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

console.log("[HiveBot Worker] All workers started successfully");
console.log(`[HiveBot Worker] Listening on queues: ${Object.values(QUEUE_NAMES).join(", ")}`);
