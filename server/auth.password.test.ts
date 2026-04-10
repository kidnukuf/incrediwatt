import { createHmac } from "crypto";
import { describe, expect, it } from "vitest";

// Validate that the stored credentials match the expected login
describe("Password Login Gate", () => {
  const expectedUsername = process.env.APP_LOGIN_USERNAME ?? "";
  const expectedHash = process.env.APP_LOGIN_PASSWORD_HASH ?? "";
  const salt = process.env.APP_LOGIN_SALT ?? "";

  it("should have APP_LOGIN_USERNAME set", () => {
    expect(expectedUsername).toBeTruthy();
    expect(expectedUsername.length).toBeGreaterThan(0);
  });

  it("should have APP_LOGIN_PASSWORD_HASH set", () => {
    expect(expectedHash).toBeTruthy();
    expect(expectedHash.length).toBe(64); // SHA-256 hex = 64 chars
  });

  it("should have APP_LOGIN_SALT set", () => {
    expect(salt).toBeTruthy();
    expect(salt.length).toBeGreaterThan(0);
  });

  it("should accept correct credentials (Sopristv / Sophie&Iris)", () => {
    const password = "Sophie&Iris";
    const hash = createHmac("sha256", salt).update(password).digest("hex");
    const usernameMatch = "Sopristv".toLowerCase() === expectedUsername.toLowerCase();
    const passwordMatch = hash === expectedHash;
    expect(usernameMatch).toBe(true);
    expect(passwordMatch).toBe(true);
  });

  it("should reject wrong password", () => {
    const wrongHash = createHmac("sha256", salt).update("wrongpassword").digest("hex");
    expect(wrongHash).not.toBe(expectedHash);
  });

  it("should reject wrong username", () => {
    const usernameMatch = "wronguser".toLowerCase() === expectedUsername.toLowerCase();
    expect(usernameMatch).toBe(false);
  });

  it("should be case-insensitive for username", () => {
    const lowerMatch = "sopristv".toLowerCase() === expectedUsername.toLowerCase();
    const upperMatch = "SOPRISTV".toLowerCase() === expectedUsername.toLowerCase();
    expect(lowerMatch).toBe(true);
    expect(upperMatch).toBe(true);
  });
});
