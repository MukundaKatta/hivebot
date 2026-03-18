import { Job } from "bullmq";
import { sendEmail } from "@/lib/integrations/email";

export async function handleEmailJob(job: Job) {
  const { to, subject, body, from } = job.data;

  const result = await sendEmail({ to, subject, body, from });

  if (!result.success) {
    throw new Error(result.error || "Failed to send email");
  }

  return { success: true, messageId: result.messageId };
}
