import { db } from "@workspace/db";
import { budgetsTable, categoriesTable } from "@workspace/db/schema";
import { and, eq } from "drizzle-orm";

export async function getCategory(params: {
  name: string;
  type: "income" | "expense";
}) {
  const [existing] = await db
    .select()
    .from(categoriesTable)
    .where(
      and(
        eq(categoriesTable.name, params.name),
        eq(categoriesTable.type, params.type),
      ),
    );

  return existing ?? null;
}

export async function getCategoryOrThrow(params: {
  name: string;
  type: "income" | "expense";
}) {
  const category = await getCategory(params);
  if (!category) {
    throw new Error(`Category "${params.name}" is not available.`);
  }

  return category;
}

export async function ensureDefaultBudgetsForUser(userId: number, month: string) {
  const expenseCategories = await db
    .select()
    .from(categoriesTable)
    .where(eq(categoriesTable.type, "expense"));

  const existingBudgets = await db
    .select()
    .from(budgetsTable)
    .where(and(eq(budgetsTable.userId, userId), eq(budgetsTable.month, month)));

  const existingCategoryIds = new Set(existingBudgets.map((budget) => budget.categoryId));
  const missingBudgetRows = expenseCategories
    .filter((category) => !existingCategoryIds.has(category.id))
    .map((category) => ({
      userId,
      categoryId: category.id,
      category: category.name,
      limit: "0",
      month,
    }));

  if (missingBudgetRows.length > 0) {
    await db.insert(budgetsTable).values(missingBudgetRows);
  }
}
