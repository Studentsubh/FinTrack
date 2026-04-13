import { Router, type IRouter } from "express";
import { z } from "zod";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import {
  clearAuthCookie,
  createPasswordHash,
  getAuthenticatedUser,
  passwordMatches,
  signInUser,
} from "../lib/auth";
import { ensureDefaultBudgetsForUser } from "../lib/categories";

const router: IRouter = Router();

const authBodySchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email(),
  password: z.string().min(6),
});

router.post("/auth/signup", async (req, res) => {
  try {
    const body = authBodySchema.extend({ name: z.string().min(1) }).parse(req.body);

    const [existingUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, body.email));

    if (existingUser) {
      return res.status(409).json({ error: "An account with that email already exists." });
    }

    const [user] = await db
      .insert(usersTable)
      .values({
        name: body.name,
        email: body.email,
        passwordHash: createPasswordHash(body.password),
      })
      .returning();

    await ensureDefaultBudgetsForUser(user.id, new Date().toISOString().slice(0, 7));

    signInUser(res, user.id);

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const body = authBodySchema.parse(req.body);

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, body.email));

    if (!user || !passwordMatches(body.password, user.passwordHash)) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    signInUser(res, user.id);

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

router.post("/auth/logout", (_req, res) => {
  clearAuthCookie(res);
  res.status(204).send();
});

router.get("/auth/me", async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: "Not authenticated." });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

export default router;
