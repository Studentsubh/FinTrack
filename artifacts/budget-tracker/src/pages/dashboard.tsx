import React, { useMemo } from "react";
import { Link } from "wouter";
import { useData } from "@/lib/data-context";
import { formatCurrency, cn } from "@/lib/utils";
import { Card, Button, Badge, PageTransition } from "@/components/ui-elements";
import { ArrowUpRight, ArrowDownRight, Wallet, Plus, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function Dashboard() {
  const { transactions, settings } = useData();

  const { totalBalance, totalIncome, totalExpenses, expensesByCategory, monthlyTrend } = useMemo(() => {
    let income = 0;
    let expenses = 0;
    const catMap: Record<string, number> = {};
    const trendMap: Record<string, { name: string, income: number, expense: number }> = {};

    transactions.forEach(tx => {
      if (tx.type === "income") income += tx.amount;
      else {
        expenses += tx.amount;
        catMap[tx.category] = (catMap[tx.category] || 0) + tx.amount;
      }

      const month = tx.date.substring(0, 7); // YYYY-MM
      if (!trendMap[month]) {
        const dateObj = new Date(tx.date);
        trendMap[month] = { name: dateObj.toLocaleString('default', { month: 'short' }), income: 0, expense: 0 };
      }
      if (tx.type === "income") trendMap[month].income += tx.amount;
      else trendMap[month].expense += tx.amount;
    });

    const expensesByCategory = Object.keys(catMap).map(key => ({ name: key, value: catMap[key] }));
    
    // Sort trend chronologically and take last 6
    const monthlyTrend = Object.keys(trendMap)
      .sort()
      .slice(-6)
      .map(key => trendMap[key]);

    return { 
      totalBalance: income - expenses, 
      totalIncome: income, 
      totalExpenses: expenses,
      expensesByCategory,
      monthlyTrend
    };
  }, [transactions]);

  const recentTransactions = transactions.slice(0, 5);

  return (
    <PageTransition>
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-none">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-primary-foreground/80 font-medium mb-1">Total Balance</p>
              <h2 className="text-4xl font-bold font-display">{formatCurrency(totalBalance, settings.currency)}</h2>
            </div>
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Wallet className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-6 flex items-center gap-2 text-sm bg-white/10 w-max px-3 py-1.5 rounded-full backdrop-blur-sm">
            <TrendingUp className="w-4 h-4" />
            <span>+2.5% from last month</span>
          </div>
        </Card>

        <Card hoverEffect>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-muted-foreground font-medium mb-1">Total Income</p>
              <h2 className="text-3xl font-bold font-display text-foreground">{formatCurrency(totalIncome, settings.currency)}</h2>
            </div>
            <div className="p-3 bg-success/10 rounded-xl">
              <ArrowUpRight className="w-6 h-6 text-success" />
            </div>
          </div>
        </Card>

        <Card hoverEffect>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-muted-foreground font-medium mb-1">Total Expenses</p>
              <h2 className="text-3xl font-bold font-display text-foreground">{formatCurrency(totalExpenses, settings.currency)}</h2>
            </div>
            <div className="p-3 bg-destructive/10 rounded-xl">
              <ArrowDownRight className="w-6 h-6 text-destructive" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Link href="/add?type=expense">
          <Button variant="danger" className="gap-2">
            <Plus className="w-5 h-5" /> Add Expense
          </Button>
        </Link>
        <Link href="/add?type=income">
          <Button variant="success" className="gap-2">
            <Plus className="w-5 h-5" /> Add Income
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <Card className="lg:col-span-2 flex flex-col">
          <h3 className="text-lg font-bold mb-6">Cash Flow Trend</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: 'hsl(var(--secondary))'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="income" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} maxBarSize={40} name="Income" />
                <Bar dataKey="expense" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} maxBarSize={40} name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Pie Chart */}
        <Card className="flex flex-col">
          <h3 className="text-lg font-bold mb-2">Expenses by Category</h3>
          <div className="flex-1 min-h-[300px] flex items-center justify-center">
            {expensesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {expensesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => formatCurrency(value, settings.currency)}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-muted-foreground text-sm flex flex-col items-center">
                <PieChart className="w-12 h-12 mb-2 opacity-20" />
                No expenses yet
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold">Recent Transactions</h3>
          <Link href="/transactions">
            <Button variant="ghost" size="sm" className="text-primary">View All</Button>
          </Link>
        </div>
        
        {recentTransactions.length > 0 ? (
          <div className="space-y-4">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-secondary/50 transition-colors border border-transparent hover:border-border/50">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    tx.type === "income" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                  )}>
                    {tx.type === "income" ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{tx.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="default" className="text-[10px] py-0">{tx.category}</Badge>
                      <span className="text-xs text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className={cn(
                  "font-bold text-lg",
                  tx.type === "income" ? "text-success" : "text-foreground"
                )}>
                  {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount, settings.currency)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <img src={`${import.meta.env.BASE_URL}images/empty-state.png`} alt="No data" className="w-32 h-32 mx-auto mb-4 opacity-80" />
            <p className="text-muted-foreground">No transactions recorded yet.</p>
          </div>
        )}
      </Card>
    </PageTransition>
  );
}
