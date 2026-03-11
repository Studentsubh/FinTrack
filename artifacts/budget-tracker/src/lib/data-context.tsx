import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string;
  paymentMethod: string;
  notes?: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
}

export interface Settings {
  currency: string;
  name: string;
  darkMode: boolean;
  monthlyBudget: number;
}

interface DataContextType {
  transactions: Transaction[];
  budgets: Budget[];
  addTransaction: (tx: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
  updateBudget: (id: string, limit: number) => void;
  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => void;
}

const generateMockData = () => {
  const categories = ["Food", "Transport", "Shopping", "Bills", "Entertainment"];
  const txs: Transaction[] = [];
  const today = new Date();

  for (let i = 0; i < 25; i++) {
    const isExpense = Math.random() > 0.2;
    const date = new Date(today);
    date.setDate(date.getDate() - Math.floor(Math.random() * 60));

    txs.push({
      id: `tx-${Math.random().toString(36).substr(2, 9)}`,
      type: isExpense ? "expense" : "income",
      amount: isExpense
        ? Math.floor(Math.random() * 150) + 10
        : Math.floor(Math.random() * 2000) + 500,
      category: isExpense
        ? categories[Math.floor(Math.random() * categories.length)]
        : "Salary",
      description: isExpense
        ? `Purchase at ${["Walmart", "Uber", "Amazon", "Netflix", "Starbucks"][Math.floor(Math.random() * 5)]}`
        : "Direct Deposit",
      date: date.toISOString().split("T")[0],
      paymentMethod: ["Card", "Cash", "Bank Transfer"][Math.floor(Math.random() * 3)],
    });
  }

  return txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const initialTransactions = generateMockData();

const initialBudgets: Budget[] = [
  { id: "b1", category: "Food", limit: 600, spent: 0 },
  { id: "b2", category: "Transport", limit: 200, spent: 0 },
  { id: "b3", category: "Shopping", limit: 300, spent: 0 },
  { id: "b4", category: "Bills", limit: 800, spent: 0 },
  { id: "b5", category: "Entertainment", limit: 150, spent: 0 },
];

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets);
  const [settings, setSettings] = useState<Settings>({
    currency: "USD",
    name: "Alex Carter",
    darkMode: false,
    monthlyBudget: 2500,
  });

  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settings.darkMode]);

  useEffect(() => {
    const currentMonth = new Date().toISOString().substring(0, 7);
    const newBudgets = budgets.map((budget) => {
      const spent = transactions
        .filter(
          (t) =>
            t.type === "expense" &&
            t.category === budget.category &&
            t.date.startsWith(currentMonth)
        )
        .reduce((sum, t) => sum + t.amount, 0);
      return { ...budget, spent };
    });
    setBudgets(newBudgets);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions]);

  const addTransaction = (tx: Omit<Transaction, "id">) => {
    const newTx = { ...tx, id: `tx-${Math.random().toString(36).substr(2, 9)}` };
    setTransactions((prev) =>
      [newTx, ...prev].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const updateBudget = (id: string, limit: number) => {
    setBudgets((prev) => prev.map((b) => (b.id === id ? { ...b, limit } : b)));
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <DataContext.Provider
      value={{
        transactions,
        budgets,
        addTransaction,
        deleteTransaction,
        updateBudget,
        settings,
        updateSettings,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
