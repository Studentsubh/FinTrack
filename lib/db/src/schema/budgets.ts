import { pgTable, serial, text, numeric, integer, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { categoriesTable } from "./categories";

export const budgetsTable = pgTable(
  "budgets",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
    categoryId: integer("category_id")
      .references(() => categoriesTable.id, { onDelete: "restrict" })
      .notNull(),
    category: text("category").notNull(),
    limit: numeric("budget_limit", { precision: 12, scale: 2 }).notNull(),
    month: text("month").notNull(),
  },
  (table) => ({
    userBudgetUnique: unique("budgets_user_id_category_id_month_unique").on(
      table.userId,
      table.categoryId,
      table.month,
    ),
  }),
);

export const insertBudgetSchema = createInsertSchema(budgetsTable).omit({ id: true });
export type InsertBudget = z.infer<typeof insertBudgetSchema>;
export type Budget = typeof budgetsTable.$inferSelect;
