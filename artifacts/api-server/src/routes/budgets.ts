import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { budgetsTable, transactionsTable } from "@workspace/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { CreateBudgetBody } from "@workspace/api-zod";
import { getAuthenticatedUser } from "../lib/auth";
import { ensureDefaultBudgetsForUser, getCategoryOrThrow } from "../lib/categories";

const router: IRouter = Router();

router.get("/budgets", async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const currentMonth = new Date().toISOString().slice(0, 7);
    await ensureDefaultBudgetsForUser(user.id, currentMonth);

    const budgets = await db
      .select()
      .from(budgetsTable)
      .where(eq(budgetsTable.userId, user.id));

    const spentByCategory = await db
      .select({
        categoryId: transactionsTable.categoryId,
        total: sql<string>`sum(${transactionsTable.amount})`,
      })
      .from(transactionsTable)
      .where(
        and(
          eq(transactionsTable.userId, user.id),
          eq(transactionsTable.type, "expense"),
          sql`${transactionsTable.date} like ${currentMonth + "%"}`
        )
      )
      .groupBy(transactionsTable.categoryId);

    const spentMap = new Map(spentByCategory.map((s) => [s.categoryId, parseFloat(s.total || "0")]));

    const result = budgets.map((b) => ({
      id: b.id,
      category: b.category,
      limit: parseFloat(b.limit),
      spent: spentMap.get(b.categoryId) ?? 0,
      month: b.month,
    }));

    res.json(result);
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

router.post("/budgets", async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const body = CreateBudgetBody.parse(req.body);
    const category = await getCategoryOrThrow({
      name: body.category,
      type: "expense",
    });

    const existing = await db
      .select()
      .from(budgetsTable)
      .where(
        and(
          eq(budgetsTable.userId, user.id),
          eq(budgetsTable.categoryId, category.id),
          eq(budgetsTable.month, body.month),
        ),
      );

    let budget;
    if (existing.length > 0) {
      const [updated] = await db
        .update(budgetsTable)
        .set({ limit: String(body.limit) })
        .where(and(eq(budgetsTable.id, existing[0].id), eq(budgetsTable.userId, user.id)))
        .returning();
      budget = updated;
    } else {
      const [created] = await db
        .insert(budgetsTable)
        .values({
          userId: user.id,
          categoryId: category.id,
          category: body.category,
          limit: String(body.limit),
          month: body.month,
        })
        .returning();
      budget = created;
    }

    res.status(201).json({
      id: budget.id,
      category: budget.category,
      limit: parseFloat(budget.limit),
      spent: 0,
      month: budget.month,
    });
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

export default router;
