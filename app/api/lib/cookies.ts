import type { CookieOptions } from "hono/utils/cookie";

function isLocalhost(headers: Headers): boolean {
  const host = headers.get("host") || "";
  return host.startsWith("localhost:") || host.startsWith("127.0.0.1:");
}

export function getSessionCookieOptions(headers: Headers): CookieOptions {
  const localhost = isLocalhost(headers);

  return {
    httpOnly: true,
    path: "/",
    sameSite: localhost ? "Lax" : "None",
    secure: !localhost,
  };
}

export function serializeCookie(
  name: string,
  value: string,
  options: CookieOptions,
): string {
  let cookie = `${name}=${encodeURIComponent(value)}`;

  if (options.maxAge !== undefined) {
    cookie += `; Max-Age=${options.maxAge}`;
  }
  if (options.httpOnly) {
    cookie += "; HttpOnly";
  }
  if (options.secure) {
    cookie += "; Secure";
  }
  if (options.sameSite) {
    cookie += `; SameSite=${options.sameSite}`;
  }
  if (options.path) {
    cookie += `; Path=${options.path}`;
  }

  return cookie;
}

export function setCookieHeader(
  resHeaders: Headers,
  name: string,
  value: string,
  options: CookieOptions,
): void {
  resHeaders.append("Set-Cookie", serializeCookie(name, value, options));
}
