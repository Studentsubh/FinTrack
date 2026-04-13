import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { transactionsTable } from "@workspace/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { getAuthenticatedUser } from "../lib/auth";

const router: IRouter = Router();

router.get("/summary", async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const totals = await db
      .select({
        type: transactionsTable.type,
        total: sql<string>`sum(${transactionsTable.amount})`,
      })
      .from(transactionsTable)
      .where(eq(transactionsTable.userId, user.id))
      .groupBy(transactionsTable.type);

    let totalIncome = 0;
    let totalExpenses = 0;
    for (const t of totals) {
      if (t.type === "income") totalIncome = parseFloat(t.total || "0");
      if (t.type === "expense") totalExpenses = parseFloat(t.total || "0");
    }

    const categoryBreakdown = await db
      .select({
        category: transactionsTable.category,
        amount: sql<string>`sum(${transactionsTable.amount})`,
      })
      .from(transactionsTable)
      .where(and(eq(transactionsTable.userId, user.id), eq(transactionsTable.type, "expense")))
      .groupBy(transactionsTable.category)
      .orderBy(sql`sum(${transactionsTable.amount}) desc`);

    const monthlyTrend = await db
      .select({
        month: sql<string>`to_char(${transactionsTable.createdAt}, 'Mon')`,
        monthNum: sql<string>`to_char(${transactionsTable.createdAt}, 'YYYY-MM')`,
        type: transactionsTable.type,
        total: sql<string>`sum(${transactionsTable.amount})`,
      })
      .from(transactionsTable)
      .where(eq(transactionsTable.userId, user.id))
      .groupBy(sql`to_char(${transactionsTable.createdAt}, 'Mon')`, sql`to_char(${transactionsTable.createdAt}, 'YYYY-MM')`, transactionsTable.type)
      .orderBy(sql`to_char(${transactionsTable.createdAt}, 'YYYY-MM')`);

    const monthMap = new Map<string, { month: string; income: number; expenses: number }>();
    for (const row of monthlyTrend) {
      if (!monthMap.has(row.monthNum)) {
        monthMap.set(row.monthNum, { month: row.month, income: 0, expenses: 0 });
      }
      const entry = monthMap.get(row.monthNum)!;
      if (row.type === "income") entry.income = parseFloat(row.total || "0");
      if (row.type === "expense") entry.expenses = parseFloat(row.total || "0");
    }

    res.json({
      totalBalance: totalIncome - totalExpenses,
      totalIncome,
      totalExpenses,
      categoryBreakdown: categoryBreakdown.map((c) => ({
        category: c.category,
        amount: parseFloat(c.amount || "0"),
      })),
      monthlyTrend: Array.from(monthMap.values()),
    });
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

export default router;
