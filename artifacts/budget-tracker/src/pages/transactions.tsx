import React, { useState } from "react";
import { useData } from "@/lib/data-context";
import { formatCurrency } from "@/lib/utils";
import { Card, Input, Select, Badge, Button, PageTransition } from "@/components/ui-elements";
import { Search, Trash2, ArrowUpRight, ArrowDownRight, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TransactionsHistory() {
  const { transactions, deleteTransaction, settings } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  const allCategories = Array.from(new Set(transactions.map(t => t.category)));

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tx.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || tx.type === filterType;
    const matchesCategory = filterCategory === "all" || tx.category === filterCategory;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  return (
    <PageTransition>
      <Card className="mb-6 bg-secondary/30 border-none">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <Input 
              icon={<Search className="w-4 h-4" />}
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-card"
            />
          </div>
          <div className="w-full md:w-48">
            <Select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              options={[
                { label: "All Types", value: "all" },
                { label: "Income", value: "income" },
                { label: "Expense", value: "expense" }
              ]}
              className="bg-card"
            />
          </div>
          <div className="w-full md:w-48">
            <Select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              options={[
                { label: "All Categories", value: "all" },
                ...allCategories.map(c => ({ label: c, value: c }))
              ]}
              className="bg-card"
            />
          </div>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold">Transaction</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold text-right">Amount</th>
                <th className="px-6 py-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                          tx.type === "income" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                        )}>
                          {tx.type === "income" ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{tx.description}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{tx.paymentMethod}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={tx.type === "income" ? "success" : "default"}>{tx.category}</Badge>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                      {new Date(tx.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={cn(
                        "font-bold text-base",
                        tx.type === "income" ? "text-success" : "text-foreground"
                      )}>
                        {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount, settings.currency)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            if(confirm("Are you sure you want to delete this transaction?")) {
                              deleteTransaction(tx.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <Filter className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    No transactions found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </PageTransition>
  );
}
