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
import { getAuthenticatedUser } from "../lib/auth";
import { getCategoryOrThrow } from "../lib/categories";

const router: IRouter = Router();

router.get("/transactions", async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const query = ListTransactionsQueryParams.parse(req.query);
    const conditions: SQL[] = [eq(transactionsTable.userId, user.id)];

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
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const body = CreateTransactionBody.parse(req.body);
    const category = await getCategoryOrThrow({
      name: body.category,
      type: body.type,
    });
    const [tx] = await db
      .insert(transactionsTable)
      .values({
        userId: user.id,
        categoryId: category.id,
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
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { id } = UpdateTransactionParams.parse({ id: parseInt(req.params.id) });
    const body = UpdateTransactionBody.parse(req.body);
    const category = await getCategoryOrThrow({
      name: body.category,
      type: body.type,
    });
    const [tx] = await db
      .update(transactionsTable)
      .set({
        categoryId: category.id,
        type: body.type,
        amount: String(body.amount),
        category: body.category,
        description: body.description,
        date: body.date,
        paymentMethod: body.paymentMethod,
        notes: body.notes ?? "",
      })
      .where(and(eq(transactionsTable.id, id), eq(transactionsTable.userId, user.id)))
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
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { id } = DeleteTransactionParams.parse({ id: parseInt(req.params.id) });
    await db
      .delete(transactionsTable)
      .where(and(eq(transactionsTable.id, id), eq(transactionsTable.userId, user.id)));
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

export default router;
