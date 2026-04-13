import React, { useState } from "react";
import { useLocation } from "wouter";
import { useData, TransactionType } from "@/lib/data-context";
import { Card, Button, Input, Select, PageTransition } from "@/components/ui-elements";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const EXPENSE_CATEGORIES = ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Health", "Other"];
const INCOME_CATEGORIES = ["Salary", "Freelance", "Investment", "Gift", "Other"];
const PAYMENT_METHODS = ["Card", "Cash", "Bank Transfer", "UPI"];

export default function AddTransaction() {
  const [, setLocation] = useLocation();
  const { addTransaction } = useData();
  const { toast } = useToast();
  
  const searchParams = new URLSearchParams(window.location.search);
  const initialType = (searchParams.get("type") as TransactionType) || "expense";

  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [notes, setNotes] = useState("");

  const categories = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !category) return;

    try {
      await addTransaction({
        type,
        amount: parseFloat(amount),
        description,
        category,
        date,
        paymentMethod,
        notes
      });

      toast({
        title: "Transaction saved",
        description: "Your transaction was added successfully.",
      });
      setLocation("/transactions");
    } catch (error) {
      toast({
        title: "Could not save transaction",
        description: error instanceof Error ? error.message : "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  return (
    <PageTransition className="max-w-2xl mx-auto">
      <Card className="border-t-4" style={{ borderTopColor: type === 'income' ? 'hsl(var(--success))' : 'hsl(var(--destructive))' }}>
        <div className="mb-8">
          <h2 className="text-2xl font-bold font-display mb-2">Record Transaction</h2>
          <p className="text-muted-foreground">Add a new income or expense to your tracker.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type Toggle */}
          <div className="flex p-1 bg-secondary rounded-xl">
            <button
              type="button"
              onClick={() => { setType("expense"); setCategory(""); }}
              className={cn(
                "flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all",
                type === "expense" ? "bg-white text-destructive shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => { setType("income"); setCategory(""); }}
              className={cn(
                "flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all",
                type === "income" ? "bg-white text-success shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Income
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium mb-2">Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-muted-foreground font-display">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={cn(
                    "w-full pl-10 pr-4 py-4 text-3xl font-bold font-display rounded-xl border-2 bg-transparent transition-colors",
                    type === "income" ? "focus:border-success focus:ring-success/10 border-input" : "focus:border-destructive focus:ring-destructive/10 border-input"
                  )}
                  placeholder="0.00"
                />
              </div>
            </div>

            <Input
              label="Description"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Groceries at Trader Joe's"
            />

            <Select
              label="Category"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={categories.map(c => ({ label: c, value: c }))}
            />

            <Input
              type="date"
              label="Date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            <Select
              label="Payment Method"
              required
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              options={PAYMENT_METHODS.map(c => ({ label: c, value: c }))}
            />

            <div className="col-span-1 md:col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-foreground">Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="flex min-h-[100px] w-full rounded-xl border-2 border-input bg-transparent px-4 py-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10"
                placeholder="Add any extra details here..."
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-4">
            <Button type="button" variant="ghost" onClick={() => setLocation("/")}>
              Cancel
            </Button>
            <Button type="submit" variant={type === "income" ? "success" : "primary"} size="lg">
              Save Transaction
            </Button>
          </div>
        </form>
      </Card>
    </PageTransition>
  );
}
