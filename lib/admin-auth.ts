import { createHash, createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

/**
 * The gate on /admin. One password, held in ADMIN_PASSWORD, and a signed
 * cookie once it has been given. There is exactly one user, so there are no
 * accounts, sessions or tokens beyond that.
 *
 * The cookie is `<expiry>.<hmac>`, keyed from the password itself, so
 * changing the password signs everyone out, and nothing secret is stored
 * anywhere but the environment. Unset ADMIN_PASSWORD and the admin is off.
 */

const COOKIE = "admin-session";
const SESSION_DAYS = 30;

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

function sha256(text: string): Buffer {
  return createHash("sha256").update(text).digest();
}

function signingKey(): Buffer {
  return sha256(`admin-session:${process.env.ADMIN_PASSWORD ?? ""}`);
}

function sign(expiry: string): string {
  return createHmac("sha256", signingKey()).update(expiry).digest("hex");
}

/** Constant-time comparison of two strings of possibly different length. */
function same(a: string, b: string): boolean {
  const ha = sha256(a);
  const hb = sha256(b);
  return timingSafeEqual(ha, hb);
}

export function checkPassword(given: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return same(given, expected);
}

function verify(value: string | undefined): boolean {
  if (!value || !isAdminConfigured()) return false;
  const dot = value.indexOf(".");
  if (dot < 1) return false;
  const expiry = value.slice(0, dot);
  const mac = value.slice(dot + 1);
  const exp = Number(expiry);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;
  return same(mac, sign(expiry));
}

export async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  return verify(jar.get(COOKIE)?.value);
}

/** For server actions and route handlers: throws unless signed in. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) throw new Error("Not signed in.");
}

export async function startSession(): Promise<void> {
  const expiry = String(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const jar = await cookies();
  jar.set(COOKIE, `${expiry}.${sign(expiry)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function endSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}
