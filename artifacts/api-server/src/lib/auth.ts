import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const AUTH_COOKIE_NAME = "finance_user_id";

function hashPassword(password: string, salt = randomBytes(16).toString("hex")) {
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, passwordHash: string) {
  const [salt, storedHash] = passwordHash.split(":");
  const derivedHash = scryptSync(password, salt, 64);
  const storedBuffer = Buffer.from(storedHash, "hex");

  return (
    storedBuffer.length === derivedHash.length &&
    timingSafeEqual(storedBuffer, derivedHash)
  );
}

function setAuthCookie(res: Response, userId: number) {
  res.cookie(AUTH_COOKIE_NAME, String(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 1000 * 60 * 60 * 24 * 30,
  });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(AUTH_COOKIE_NAME);
}

export function createPasswordHash(password: string) {
  return hashPassword(password);
}

export function passwordMatches(password: string, passwordHash: string) {
  return verifyPassword(password, passwordHash);
}

export function signInUser(res: Response, userId: number) {
  setAuthCookie(res, userId);
}

export async function getAuthenticatedUser(req: Request) {
  const rawUserId = req.cookies?.[AUTH_COOKIE_NAME];
  const userId = Number(rawUserId);
  if (!rawUserId || Number.isNaN(userId) || userId <= 0) {
    return null;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  return user ?? null;
}
