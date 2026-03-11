import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { transactionsTable } from "@workspace/db/schema";
import { eq, desc, ilike, and, SQL } from "drizzle-orm";
import {
  CreateTransactionBody,
  UpdateTransactionBody,
  UpdateTransactionParams,
  DeleteTransactionParams,
  ListTransactionsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/transactions", async (req, res) => {
  try {
    const query = ListTransactionsQueryParams.parse(req.query);
    const conditions: SQL[] = [];

    if (query.type && query.type !== "all") {
      conditions.push(eq(transactionsTable.type, query.type));
    }
    if (query.category) {
      conditions.push(eq(transactionsTable.category, query.category));
    }
    if (query.search) {
      conditions.push(ilike(transactionsTable.description, `%${query.search}%`));
    }

    const transactions = await db
      .select()
      .from(transactionsTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(transactionsTable.createdAt));

    const result = transactions.map((t) => ({
      id: t.id,
      type: t.type,
      amount: parseFloat(t.amount),
      category: t.category,
      description: t.description,
      date: t.date,
      paymentMethod: t.paymentMethod,
      notes: t.notes ?? "",
      createdAt: t.createdAt.toISOString(),
    }));
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

router.post("/transactions", async (req, res) => {
  try {
    const body = CreateTransactionBody.parse(req.body);
    const [tx] = await db
      .insert(transactionsTable)
      .values({
        type: body.type,
        amount: String(body.amount),
        category: body.category,
        description: body.description,
        date: body.date,
        paymentMethod: body.paymentMethod,
        notes: body.notes ?? "",
      })
      .returning();

    res.status(201).json({
      id: tx.id,
      type: tx.type,
      amount: parseFloat(tx.amount),
      category: tx.category,
      description: tx.description,
      date: tx.date,
      paymentMethod: tx.paymentMethod,
      notes: tx.notes ?? "",
      createdAt: tx.createdAt.toISOString(),
    });
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

router.put("/transactions/:id", async (req, res) => {
  try {
    const { id } = UpdateTransactionParams.parse({ id: parseInt(req.params.id) });
    const body = UpdateTransactionBody.parse(req.body);
    const [tx] = await db
      .update(transactionsTable)
      .set({
        type: body.type,
        amount: String(body.amount),
        category: body.category,
        description: body.description,
        date: body.date,
        paymentMethod: body.paymentMethod,
        notes: body.notes ?? "",
      })
      .where(eq(transactionsTable.id, id))
      .returning();

    if (!tx) return res.status(404).json({ error: "Not found" });
    res.json({
      id: tx.id,
      type: tx.type,
      amount: parseFloat(tx.amount),
      category: tx.category,
      description: tx.description,
      date: tx.date,
      paymentMethod: tx.paymentMethod,
      notes: tx.notes ?? "",
      createdAt: tx.createdAt.toISOString(),
    });
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

router.delete("/transactions/:id", async (req, res) => {
  try {
    const { id } = DeleteTransactionParams.parse({ id: parseInt(req.params.id) });
    await db.delete(transactionsTable).where(eq(transactionsTable.id, id));
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

export default router;
