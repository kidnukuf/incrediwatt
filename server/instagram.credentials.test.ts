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
});
