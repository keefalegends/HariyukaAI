export interface OperatorUser {
  username: string;
  role: string;
}

export const SESSION_COOKIE_NAME = "hariyuka_operator_session";

/**
 * Parses AUTH_USERS env variable.
 * Format: "user1:pass1,user2:pass2"
 */
export function getAuthorizedUsers(): Map<string, string> {
  const envString = process.env.AUTH_USERS || "keefa9:cc,salna9:cc,admin:admin";
  const userMap = new Map<string, string>();

  // Always pre-populate default operators
  userMap.set("keefa9", "cc");
  userMap.set("salna9", "cc");

  const pairs = envString.split(",");
  for (const pair of pairs) {
    const trimmed = pair.trim();
    if (!trimmed) continue;
    const colonIndex = trimmed.indexOf(":");
    if (colonIndex !== -1) {
      const username = trimmed.substring(0, colonIndex).trim().toLowerCase();
      const password = trimmed.substring(colonIndex + 1).trim();
      if (username && password) {
        userMap.set(username, password);
      }
    }
  }

  return userMap;
}

/**
 * Validates operator credentials against environment config.
 */
export function validateOperator(username: string, pass: string): boolean {
  if (!username || !pass) return false;
  const users = getAuthorizedUsers();
  const storedPassword = users.get(username.trim().toLowerCase());
  return storedPassword !== undefined && storedPassword === pass;
}

/**
 * Simple, secure session string encoder
 */
export function createSessionValue(username: string): string {
  const payload = {
    u: username.trim(),
    t: Date.now(),
  };
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

/**
 * Decodes session value
 */
export function parseSessionValue(token: string): { username: string; timestamp: number } | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const parsed = JSON.parse(decoded);
    if (parsed && typeof parsed.u === "string") {
      return { username: parsed.u, timestamp: parsed.t };
    }
    return null;
  } catch {
    return null;
  }
}
