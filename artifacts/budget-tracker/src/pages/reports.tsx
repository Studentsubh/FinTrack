import React, { useMemo } from "react";
import { useData } from "@/lib/data-context";
import { formatCurrency } from "@/lib/utils";
import { Card, PageTransition } from "@/components/ui-elements";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Calendar, TrendingDown, Activity } from "lucide-react";

export default function Reports() {
  const { transactions, settings } = useData();

  const { dailyTrend, avgDaily, topCategory } = useMemo(() => {
    if (transactions.length === 0) return { dailyTrend: [], avgDaily: 0, topCategory: { name: "N/A", amount: 0 } };

    // Calculate daily expenses for the last 30 days
    const dailyMap: Record<string, number> = {};
    const catMap: Record<string, number> = {};
    let totalExpense = 0;

    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dailyMap[d.toISOString().split('T')[0]] = 0;
    }

    transactions.forEach(tx => {
      if (tx.type === "expense") {
        totalExpense += tx.amount;
        catMap[tx.category] = (catMap[tx.category] || 0) + tx.amount;
        
        const dateStr = tx.date;
        if (dailyMap[dateStr] !== undefined) {
          dailyMap[dateStr] += tx.amount;
        }
      }
    });

    const dailyTrend = Object.keys(dailyMap).map(date => ({
      date: new Date(date).getDate(), // Just day number for x-axis
      fullDate: date,
      amount: dailyMap[date]
    }));

    const topCatName = Object.keys(catMap).sort((a, b) => catMap[b] - catMap[a])[0] || "N/A";

    return {
      dailyTrend,
      avgDaily: totalExpense / 30, // Rough 30 day avg
      topCategory: { name: topCatName, amount: catMap[topCatName] || 0 }
    };
  }, [transactions]);

  return (
    <PageTransition>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="flex items-center gap-4">
          <div className="p-4 bg-primary/10 rounded-2xl text-primary">
            <Activity className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Daily Average</p>
            <p className="text-2xl font-bold font-display">{formatCurrency(avgDaily, settings.currency)}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-4 bg-destructive/10 rounded-2xl text-destructive">
            <TrendingDown className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Highest Spend Category</p>
            <p className="text-2xl font-bold font-display">{topCategory.name}</p>
            <p className="text-xs text-muted-foreground">{formatCurrency(topCategory.amount, settings.currency)} total</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-4 bg-secondary rounded-2xl text-foreground">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Time Period</p>
            <p className="text-xl font-bold font-display">Last 30 Days</p>
          </div>
        </Card>
      </div>

      <Card className="mb-6">
        <h3 className="text-lg font-bold mb-6">Daily Spending (Last 30 Days)</h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} />
              <Tooltip 
                labelFormatter={(label, payload) => payload[0]?.payload.fullDate}
                formatter={(value: number) => [formatCurrency(value, settings.currency), "Spent"]}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="hsl(var(--destructive))" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorAmount)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </PageTransition>
  );
}
