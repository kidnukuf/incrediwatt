import { describe, it, expect, beforeAll } from "vitest";
import { verifyCredentials } from "./_core/socialMedia";

describe("Social Media Integration", () => {
  it("should verify Facebook API credentials are configured", async () => {
    const isValid = await verifyCredentials();
    expect(isValid).toBe(true);
  });
});
