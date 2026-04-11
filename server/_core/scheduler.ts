/**
 * Auto-publish scheduler
 * Runs every 5 minutes and publishes any scheduled posts that are due.
 * Integrated into the server startup via startScheduler().
 */

import { getScheduledPosts, updatePost } from "../db";
import { postToSocialMedia } from "./socialMedia";

let schedulerInterval: ReturnType<typeof setInterval> | null = null;

async function processScheduledPosts(): Promise<void> {
  try {
    const now = Date.now();
    const scheduled = await getScheduledPosts();
    const due = scheduled.filter((p) => p.scheduledAt && p.scheduledAt <= now);

    if (due.length === 0) return;

    console.log(`[Scheduler] Processing ${due.length} due scheduled post(s)...`);

    for (const post of due) {
      try {
        const caption = post.captionEs
          ? `${post.captionEn}\n\n🇲🇽 ${post.captionEs}`
          : post.captionEn;

        // Detect video URLs by extension and route to videoUrl param
        const rawUrl = post.imageUrl ?? undefined;
        const isVideo = rawUrl && /\.(mp4|mov|webm|avi|m4v)(\?|$)/i.test(rawUrl);

        const result = await postToSocialMedia({
          caption,
          imageUrl: isVideo ? undefined : rawUrl,
          videoUrl: isVideo ? rawUrl : undefined,
          hashtags: post.hashtags ?? undefined,
          platform: post.platform,
        });

        if (result.success) {
          await updatePost(post.id, { status: "published", publishedAt: Date.now() });
          console.log(
            `[Scheduler] ✅ Post #${post.id} published.` +
              (result.facebookPostId ? ` FB: ${result.facebookPostId}` : "") +
              (result.instagramPostId ? ` IG: ${result.instagramPostId}` : "")
          );
        } else {
          // Mark as failed so it is not retried on every scheduler tick
          await updatePost(post.id, { status: "failed" });
          console.error(`[Scheduler] ❌ Post #${post.id} marked as failed: ${result.error}`);
        }
      } catch (err) {
        console.error(`[Scheduler] ❌ Error processing post #${post.id}:`, err);
      }
    }
  } catch (err) {
    console.error("[Scheduler] Error fetching scheduled posts:", err);
  }
}

export function startScheduler(): void {
  if (schedulerInterval) return; // Already running

  // Run immediately on startup to catch any missed posts
  processScheduledPosts();

  // Then run every 5 minutes
  schedulerInterval = setInterval(processScheduledPosts, 5 * 60 * 1000);

  console.log("[Scheduler] Auto-publish scheduler started (every 5 minutes)");
}

export function stopScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log("[Scheduler] Stopped");
  }
}
