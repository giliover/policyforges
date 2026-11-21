/** Client-readable session cookies for use with an Authorization: Bearer header.
 * JavaScript cannot set HttpOnly cookies. For stronger protection, have the
 * authentication backend issue HttpOnly cookies and validate them server-side.
 */
const TOKEN_COOKIE = "policyforges_token";
const ROLES_COOKIE = "policyforges_roles";

function hasDocument(): boolean {
  return typeof document !== "undefined";
}

function cookieOptions(): string {
  // Secure on HTTPS; allow localhost HTTP during development.
  const secure = typeof location !== "undefined" && location.protocol === "https:";
  return `; Path=/; SameSite=Strict${secure ? "; Secure" : ""}`;
}

function readCookie(name: string): string | null {
  if (!hasDocument()) return null;
  const item = document.cookie.split(";").map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  if (!item) return null;
  try {
    return decodeURIComponent(item.substring(name.length + 1));
  } catch {
    return null;
  }
}

function writeCookie(name: string, value: string): void {
  if (!hasDocument()) return;
  document.cookie = `${name}=${encodeURIComponent(value)}${cookieOptions()}`;
}

function clearCookie(name: string): void {
  if (!hasDocument()) return;
  document.cookie = `${name}=; Max-Age=0${cookieOptions()}`;
}

export const authCookies = {
  getToken: () => readCookie(TOKEN_COOKIE),
  getRoles: (): string[] => {
    const saved = readCookie(ROLES_COOKIE);
    if (!saved) return [];
    try {
      const parsed: unknown = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.every((item) => typeof item === "string")
        ? parsed : [];
    } catch {
      return [];
    }
  },
  setSession: (token: string, roles: string[]) => {
    writeCookie(TOKEN_COOKIE, token);
    writeCookie(ROLES_COOKIE, JSON.stringify(roles));
  },
  clearSession: () => {
    clearCookie(TOKEN_COOKIE);
    clearCookie(ROLES_COOKIE);
  },
};
