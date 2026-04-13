import React, { useState } from "react";
import { useData } from "@/lib/data-context";
import { formatCurrency } from "@/lib/utils";
import { Card, Button, PageTransition, Input } from "@/components/ui-elements";
import { cn } from "@/lib/utils";
import { Target, AlertCircle, CheckCircle2, Pencil, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function BudgetOverview() {
  const { budgets, updateBudget, settings, updateSettings } = useData();
  const { toast } = useToast();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editingMonthly, setEditingMonthly] = useState(false);
  const [monthlyValue, setMonthlyValue] = useState(settings.monthlyBudget.toString());

  const totalSpent = budgets.reduce((acc, curr) => acc + curr.spent, 0);
  const monthlyBudget = settings.monthlyBudget;
  const monthlyRemaining = Math.max(0, monthlyBudget - totalSpent);
  const monthlyPercentage = Math.min(100, (totalSpent / monthlyBudget) * 100);

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-destructive";
    if (percentage >= 75) return "bg-yellow-500";
    return "bg-emerald-500";
  };

  const handleSaveMonthly = () => {
    const num = parseFloat(monthlyValue);
    if (!isNaN(num) && num > 0) {
      updateSettings({ monthlyBudget: num });
      toast({ title: "Monthly budget updated", description: `Set to ${formatCurrency(num, settings.currency)}` });
    }
    setEditingMonthly(false);
  };

  const handleCancelMonthly = () => {
    setMonthlyValue(settings.monthlyBudget.toString());
    setEditingMonthly(false);
  };

  const handleSaveBudget = async (id: number) => {
    const num = parseFloat(editValue);
    if (!isNaN(num) && num > 0) {
      await updateBudget(id, num);
      toast({ title: "Category budget updated" });
    }
    setEditingId(null);
  };

  const handleCancelBudget = () => {
    setEditingId(null);
  };

  return (
    <PageTransition>

      {/* ── Monthly Budget Card ── */}
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Target className="w-48 h-48" />
        </div>

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-white/60 text-sm font-medium mb-1">Monthly Budget</p>
              {editingMonthly ? (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-white/60 text-2xl font-bold">
                    {settings.currency === "USD" ? "$" : settings.currency === "EUR" ? "€" : settings.currency === "GBP" ? "£" : "₹"}
                  </span>
                  <input
                    type="number"
                    className="w-36 bg-white/10 text-white text-2xl font-bold rounded-xl px-3 py-1 border border-white/20 focus:outline-none focus:border-white/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={monthlyValue}
                    onChange={(e) => setMonthlyValue(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => { if (e.key === "Enter") handleSaveMonthly(); if (e.key === "Escape") handleCancelMonthly(); }}
                  />
                  <button onClick={handleSaveMonthly} className="w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={handleCancelMonthly} className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <p className="text-4xl font-bold font-display">
                  {formatCurrency(monthlyBudget, settings.currency)}
                </p>
              )}
            </div>

            {!editingMonthly && (
              <button
                onClick={() => { setMonthlyValue(monthlyBudget.toString()); setEditingMonthly(true); }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white/80 hover:text-white"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-white/60 text-sm mb-1">Spent This Month</p>
              <p className="text-2xl font-bold">{formatCurrency(totalSpent, settings.currency)}</p>
            </div>
            <div>
              <p className="text-white/60 text-sm mb-1">Remaining</p>
              <p className={cn("text-2xl font-bold", totalSpent > monthlyBudget ? "text-red-400" : "text-emerald-400")}>
                {totalSpent > monthlyBudget
                  ? `−${formatCurrency(totalSpent - monthlyBudget, settings.currency)}`
                  : formatCurrency(monthlyRemaining, settings.currency)}
              </p>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2 text-white/70">
              <span>Overall Usage</span>
              <span className={cn(monthlyPercentage >= 90 && "text-red-400", monthlyPercentage >= 75 && monthlyPercentage < 90 && "text-yellow-400")}>
                {Math.round(monthlyPercentage)}%
              </span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-1000", getProgressColor(monthlyPercentage))}
                style={{ width: `${monthlyPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* ── Category Budgets ── */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">Category Budgets</h3>
        <p className="text-sm text-muted-foreground">Click a category to edit its limit</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgets.map((budget) => {
          const percentage = Math.min(100, (budget.spent / budget.limit) * 100);
          const isOver = budget.spent > budget.limit;
          const isEditing = editingId === budget.id;

          return (
            <Card key={budget.id} className={cn("transition-all duration-200", isEditing && "ring-2 ring-primary/40")}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold">{budget.category}</h4>
                  {isOver ? (
                    <AlertCircle className="w-4 h-4 text-destructive" />
                  ) : percentage < 75 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : null}
                </div>

                {isEditing ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      className="w-24 h-8 px-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      autoFocus
                      onKeyDown={(e) => { if (e.key === "Enter") handleSaveBudget(budget.id); if (e.key === "Escape") handleCancelBudget(); }}
                    />
                    <button
                      onClick={() => handleSaveBudget(budget.id)}
                      className="w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleCancelBudget}
                      className="w-8 h-8 flex items-center justify-center bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setEditingId(budget.id); setEditValue(budget.limit.toString()); }}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                  >
                    <Pencil className="w-3 h-3" />
                    {formatCurrency(budget.limit, settings.currency)}
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Spent: <span className={cn("font-semibold", isOver ? "text-destructive" : "text-foreground")}>{formatCurrency(budget.spent, settings.currency)}</span>
                  </span>
                  <span className={cn("font-medium", isOver ? "text-destructive" : "text-muted-foreground")}>
                    {isOver ? `Over by ${formatCurrency(budget.spent - budget.limit, settings.currency)}` : `${Math.round(percentage)}%`}
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-1000", getProgressColor(percentage))}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {isOver
                    ? `Budget exceeded`
                    : `${formatCurrency(budget.limit - budget.spent, settings.currency)} remaining`}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

    </PageTransition>
  );
}
