import { describe, it, expect } from "vitest";
import { ENV } from "./_core/env";

describe("Instagram API credentials", () => {
  it("should have INSTAGRAM_APP_ID set", () => {
    expect(ENV.instagramAppId).toBeTruthy();
    expect(ENV.instagramAppId.length).toBeGreaterThan(0);
  });

  it("should have INSTAGRAM_APP_SECRET set", () => {
    expect(ENV.instagramAppSecret).toBeTruthy();
    expect(ENV.instagramAppSecret.length).toBeGreaterThan(0);
  });

  it("should have a numeric-looking App ID", () => {
    expect(/^\d+$/.test(ENV.instagramAppId)).toBe(true);
  });

  it("should have a 32-character hex App Secret", () => {
    expect(/^[a-f0-9]{32}$/.test(ENV.instagramAppSecret)).toBe(true);
  });

  it("should have INSTAGRAM_BUSINESS_ACCOUNT_ID set to correct @soprisrestaurant account", () => {
    expect(ENV.instagramBusinessAccountId).toBeTruthy();
    expect(ENV.instagramBusinessAccountId).toBe("17841445981820762");
  });

  it("should be able to access @soprisrestaurant account via Graph API", async () => {
    const token = ENV.facebookApiToken;
    const igId = ENV.instagramBusinessAccountId;
    if (!token || !igId) return;
    const res = await fetch(
      `https://graph.facebook.com/v18.0/${igId}?fields=id,username&access_token=${token}`
    );
    const data = await res.json();
    expect(res.ok).toBe(true);
    expect(data.id).toBe("17841445981820762");
    expect(data.username).toBe("soprisrestaurant");
  });
});
