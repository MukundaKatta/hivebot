import { Job } from "bullmq";
import { getSupabaseAdmin } from "@/lib/supabase/client";
import { sendEmail } from "@/lib/integrations/email";

export async function handleNotificationJob(job: Job) {
  const { userId, title, message, channel, metadata } = job.data;
  const supabase = getSupabaseAdmin();

  // Always store in-app notification
  await supabase.from("notifications").insert({
    user_id: userId,
    title,
    message,
    channel: channel || "in_app",
    metadata,
  });

  // If channel is email, also send email
  if (channel === "email") {
    const { data: profile } = await supabase.from("profiles").select("email").eq("id", userId).single();

    if (profile?.email) {
      await sendEmail({
        to: [profile.email],
        subject: `[HiveBot] ${title}`,
        body: `<h2>${title}</h2><p>${message}</p>`,
      });
    }
  }

  // If channel is webhook, send to configured webhook
  if (channel === "webhook") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("notification_preferences")
      .eq("id", userId)
      .single();

    const webhookUrl = profile?.notification_preferences?.webhook_url;
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, message, metadata, timestamp: new Date().toISOString() }),
      });
    }
  }

  return { success: true };
}
