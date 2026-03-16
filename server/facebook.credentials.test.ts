import { describe, it, expect } from "vitest";

/**
 * Facebook Credentials Validation Test
 * Verifies that the correct Sopris Restaurant page credentials are configured
 */
describe("Facebook Credentials", () => {
  const PAGE_ID = process.env.FACEBOOK_PAGE_ID ?? "";
  const TOKEN = process.env.FACEBOOK_API_TOKEN ?? "";

  it("should have FACEBOOK_PAGE_ID set to Sopris Restaurant page", () => {
    expect(PAGE_ID).toBeTruthy();
    expect(PAGE_ID).toBe("1099719276547374");
  });

  it("should have FACEBOOK_API_TOKEN configured", () => {
    expect(TOKEN).toBeTruthy();
    expect(TOKEN.length).toBeGreaterThan(50);
  });

  it("should be able to access Sopris Restaurant page via Graph API", async () => {
    if (!PAGE_ID || !TOKEN) {
      console.warn("Skipping API test — credentials not set");
      return;
    }

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${PAGE_ID}?fields=name,id&access_token=${TOKEN}`
    );

    expect(response.ok).toBe(true);

    const data = await response.json();
    expect(data.id).toBe("1099719276547374");
    expect(data.name).toContain("Sopris");
  });
});
