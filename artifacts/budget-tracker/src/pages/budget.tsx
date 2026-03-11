import React, { useState } from "react";
import { useData } from "@/lib/data-context";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { Card, Button, PageTransition, Input } from "@/components/ui-elements";
import { cn } from "@/lib/utils";
import { Target, AlertCircle, CheckCircle2 } from "lucide-react";

export default function BudgetOverview() {
  const { budgets, updateBudget, settings } = useData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const totalBudget = budgets.reduce((acc, curr) => acc + curr.limit, 0);
  const totalSpent = budgets.reduce((acc, curr) => acc + curr.spent, 0);
  const totalRemaining = Math.max(0, totalBudget - totalSpent);
  const overallPercentage = Math.min(100, (totalSpent / totalBudget) * 100);

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-destructive";
    if (percentage >= 75) return "bg-yellow-500";
    return "bg-success";
  };

  const handleSaveBudget = (id: string) => {
    const num = parseFloat(editValue);
    if (!isNaN(num) && num > 0) {
      updateBudget(id, num);
    }
    setEditingId(null);
  };

  return (
    <PageTransition>
      {/* Overall Summary */}
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Target className="w-48 h-48" />
        </div>
        <div className="relative z-10">
          <h2 className="text-xl font-medium text-white/80 mb-6">Monthly Budget Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <p className="text-white/60 text-sm mb-1">Total Budget Limit</p>
              <p className="text-3xl font-bold font-display">{formatCurrency(totalBudget, settings.currency)}</p>
            </div>
            <div>
              <p className="text-white/60 text-sm mb-1">Total Spent</p>
              <p className="text-3xl font-bold font-display">{formatCurrency(totalSpent, settings.currency)}</p>
            </div>
            <div>
              <p className="text-white/60 text-sm mb-1">Remaining</p>
              <p className="text-3xl font-bold font-display text-success-foreground">{formatCurrency(totalRemaining, settings.currency)}</p>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2 text-white/80">
              <span>Overall Usage</span>
              <span>{Math.round(overallPercentage)}%</span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <div 
                className={cn("h-full rounded-full transition-all duration-1000", getProgressColor(overallPercentage))}
                style={{ width: `${overallPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      <h3 className="text-xl font-bold mb-6">Category Budgets</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {budgets.map((budget) => {
          const percentage = Math.min(100, (budget.spent / budget.limit) * 100);
          const isOver = budget.spent > budget.limit;

          return (
            <Card key={budget.id} hoverEffect className="group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-lg font-bold">{budget.category}</h4>
                    {isOver ? (
                      <AlertCircle className="w-4 h-4 text-destructive" />
                    ) : percentage < 75 ? (
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    ) : null}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(budget.spent, settings.currency)} of {formatCurrency(budget.limit, settings.currency)}
                  </p>
                </div>

                {editingId === budget.id ? (
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      className="w-24 h-9 py-1 px-2" 
                      value={editValue} 
                      onChange={e => setEditValue(e.target.value)}
                      autoFocus
                    />
                    <Button size="sm" onClick={() => handleSaveBudget(budget.id)}>Save</Button>
                  </div>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => { setEditingId(budget.id); setEditValue(budget.limit.toString()); }}
                  >
                    Edit Limit
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span className={cn(isOver && "text-destructive")}>
                    {isOver ? "Over budget" : "Remaining: " + formatCurrency(budget.limit - budget.spent, settings.currency)}
                  </span>
                  <span>{Math.round(percentage)}%</span>
                </div>
                <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full transition-all duration-1000", getProgressColor(percentage))}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </PageTransition>
  );
}
