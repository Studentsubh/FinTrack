import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { budgetsTable, transactionsTable } from "@workspace/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { CreateBudgetBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/budgets", async (_req, res) => {
  try {
    const budgets = await db.select().from(budgetsTable);

    const currentMonth = new Date().toISOString().slice(0, 7);
    const spentByCategory = await db
      .select({
        category: transactionsTable.category,
        total: sql<string>`sum(${transactionsTable.amount})`,
      })
      .from(transactionsTable)
      .where(
        and(
          eq(transactionsTable.type, "expense"),
          sql`${transactionsTable.date} like ${currentMonth + "%"}`
        )
      )
      .groupBy(transactionsTable.category);

    const spentMap = new Map(spentByCategory.map((s) => [s.category, parseFloat(s.total || "0")]));

    const result = budgets.map((b) => ({
      id: b.id,
      category: b.category,
      limit: parseFloat(b.limit),
      spent: spentMap.get(b.category) ?? 0,
      month: b.month,
    }));

    res.json(result);
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

router.post("/budgets", async (req, res) => {
  try {
    const body = CreateBudgetBody.parse(req.body);

    const existing = await db
      .select()
      .from(budgetsTable)
      .where(and(eq(budgetsTable.category, body.category), eq(budgetsTable.month, body.month)));

    let budget;
    if (existing.length > 0) {
      const [updated] = await db
        .update(budgetsTable)
        .set({ limit: String(body.limit) })
        .where(eq(budgetsTable.id, existing[0].id))
        .returning();
      budget = updated;
    } else {
      const [created] = await db
        .insert(budgetsTable)
        .values({ category: body.category, limit: String(body.limit), month: body.month })
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
