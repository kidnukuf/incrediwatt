import { ENV } from "./env";

/**
 * Social Media Posting Module
 * Handles posting to Facebook and Instagram via Meta Graph API
 *
 * Facebook Page ID: 1099719276547374 (Sopris Restaurant)
 * Uses /photos endpoint for image posts, /feed for text-only posts
 */

interface PostParams {
  caption: string;
  imageUrl?: string;
  videoUrl?: string;
  hashtags?: string;
  platform: "facebook" | "instagram" | "both";
}

interface PostResult {
  success: boolean;
  facebookPostId?: string;
  instagramPostId?: string;
  error?: string;
}

/**
 * Post to Facebook Page
 * Uses /photos endpoint for image posts (required to attach image properly)
 * Uses /feed endpoint for text-only posts
 */
async function postToFacebook(params: PostParams): Promise<string | null> {
  try {
    const { caption, imageUrl, videoUrl, hashtags } = params;
    const fullCaption = hashtags ? `${caption}\n\n${hashtags}` : caption;

    const pageId = ENV.facebookPageId;
    const token = ENV.facebookApiToken;

    if (!pageId || !token) {
      throw new Error("Facebook credentials not configured");
    }

    let endpoint: string;
    let payload: Record<string, string>;

    if (imageUrl) {
      // Use /photos endpoint to attach image directly — avoids showing raw CDN URL as visible link
      endpoint = `https://graph.facebook.com/v18.0/${pageId}/photos`;
      payload = {
        caption: fullCaption,
        url: imageUrl,
        access_token: token,
      };
    } else if (videoUrl) {
      // Use /videos endpoint for video posts
      endpoint = `https://graph.facebook.com/v18.0/${pageId}/videos`;
      payload = {
        file_url: videoUrl,
        description: fullCaption,
        access_token: token,
      };
    } else {
      // Text-only post uses /feed
      endpoint = `https://graph.facebook.com/v18.0/${pageId}/feed`;
      payload = {
        message: fullCaption,
        access_token: token,
      };
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(payload),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(`Facebook API error: ${data.error?.message || response.statusText}`);
    }

    // /photos returns { id, post_id } — return post_id for the feed post ID
    return data.post_id || data.id;
  } catch (error) {
    console.error("Facebook posting error:", error);
    return null;
  }
}

/**
 * Post to Instagram Business Account
 * Uses two-step process: create container, then publish
 */
async function postToInstagram(params: PostParams): Promise<string | null> {
  try {
    const { caption, imageUrl, videoUrl, hashtags } = params;
    const fullCaption = hashtags ? `${caption}\n\n${hashtags}` : caption;

    // Instagram Business Account ID from environment (17841445981820762 = @soprisrestaurant)
    const instagramId = ENV.instagramBusinessAccountId;
    const token = ENV.facebookApiToken;

    if (!instagramId || !token) {
      throw new Error("Instagram credentials not configured");
    }

    // For Instagram, we need to create a media container first
    // Skip text-only posts — Instagram requires photo or video
    if (!imageUrl && !videoUrl) {
      console.log("[Instagram] Skipping text-only post — Instagram requires photo or video");
      return null;
    }

    let mediaType = "IMAGE";
    let mediaUrl = imageUrl;

    if (videoUrl) {
      mediaType = "REELS";
      mediaUrl = videoUrl;
    }

    // Step 1: Create media container
    const containerEndpoint = `https://graph.facebook.com/v18.0/${instagramId}/media`;
    const containerPayload: Record<string, string> = {
      media_type: mediaType,
      caption: fullCaption,
      access_token: token,
    };

    if (mediaUrl) {
      containerPayload[mediaType === "REELS" ? "video_url" : "image_url"] = mediaUrl;
    }

    const containerResponse = await fetch(containerEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(containerPayload),
    });

    const containerData = await containerResponse.json();

    if (!containerResponse.ok || containerData.error) {
      throw new Error(`Instagram container error: ${containerData.error?.message || containerResponse.statusText}`);
    }

    const containerId = containerData.id;

    // Step 2: Poll container status until FINISHED (up to 30 seconds)
    let ready = false;
    for (let i = 0; i < 10; i++) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      const statusRes = await fetch(
        `https://graph.facebook.com/v18.0/${containerId}?fields=status_code&access_token=${token}`
      );
      const statusData = await statusRes.json();
      if (statusData.status_code === 'FINISHED') {
        ready = true;
        break;
      }
      if (statusData.status_code === 'ERROR') {
        throw new Error(`Instagram container processing failed: ${statusData.status}`);
      }
    }
    if (!ready) {
      throw new Error('Instagram container timed out waiting for processing');
    }

    const publishEndpoint = `https://graph.facebook.com/v18.0/${instagramId}/media_publish`;
    const publishPayload: Record<string, string> = {
      creation_id: containerId,
      access_token: token,
    };

    const publishResponse = await fetch(publishEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(publishPayload),
    });

    const publishData = await publishResponse.json();

    if (!publishResponse.ok || publishData.error) {
      throw new Error(`Instagram publish error: ${publishData.error?.message || publishResponse.statusText}`);
    }

    return publishData.id;
  } catch (error) {
    console.error("Instagram posting error:", error);
    return null;
  }
}

/**
 * Post to both Facebook and Instagram
 */
export async function postToSocialMedia(params: PostParams): Promise<PostResult> {
  const { platform } = params;

  const result: PostResult = {
    success: false,
  };

  try {
    if (platform === "facebook" || platform === "both") {
      const facebookId = await postToFacebook(params);
      if (facebookId) {
        result.facebookPostId = facebookId;
      }
    }

    if (platform === "instagram" || platform === "both") {
      const instagramId = await postToInstagram(params);
      if (instagramId) {
        result.instagramPostId = instagramId;
      }
    }

    result.success = !!(result.facebookPostId || result.instagramPostId);
  } catch (error) {
    result.error = error instanceof Error ? error.message : "Unknown error";
  }

  return result;
}

/**
 * Verify API credentials are valid by checking page access
 */
export async function verifyCredentials(): Promise<boolean> {
  try {
    const pageId = ENV.facebookPageId;
    const token = ENV.facebookApiToken;

    if (!pageId || !token) {
      return false;
    }

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}?fields=name,id&access_token=${token}`
    );

    const data = await response.json();
    return response.ok && !!data.id;
  } catch (error) {
    console.error("Credential verification error:", error);
    return false;
  }
}
