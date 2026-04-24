import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { apiFetch } from "@/lib/api";

export type TransactionType = "income" | "expense";

export interface Transaction {
  id: number;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string;
  paymentMethod: string;
  notes?: string;
}

export interface Budget {
  id: number;
  category: string;
  limit: number;
  spent: number;
  month: string;
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
  addTransaction: (tx: Omit<Transaction, "id">) => Promise<void>;
  deleteTransaction: (id: number) => Promise<void>;
  updateBudget: (id: number, limit: number) => Promise<void>;
  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => void;
  isLoading: boolean;
}

interface DataProviderProps {
  children: ReactNode;
  userName?: string;
}

const DEFAULT_SETTINGS: Settings = {
  currency: "USD",
  name: "Alex Carter",
  darkMode: false,
  monthlyBudget: 2500,
};

const SETTINGS_STORAGE_KEY = "finance-dashboard-settings";

const DataContext = createContext<DataContextType | undefined>(undefined);

async function fetchJson<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await apiFetch(input, init);
  if (!response.ok) {
    try {
      const errorBody = (await response.json()) as { error?: string };
      throw new Error(errorBody.error ?? `Request failed with status ${response.status}`);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Request failed with status ${response.status}`);
    }
  }

  return response.json() as Promise<T>;
}

function loadInitialSettings(): Settings {
  if (typeof window === "undefined") {
    return DEFAULT_SETTINGS;
  }

  const stored = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
  if (!stored) {
    return DEFAULT_SETTINGS;
  }

  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function DataProvider({ children, userName }: DataProviderProps) {
  const [settings, setSettings] = useState<Settings>(() => loadInitialSettings());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settings.darkMode]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    }
  }, [settings]);

  useEffect(() => {
    if (userName && userName !== settings.name) {
      setSettings((prev) => ({ ...prev, name: userName }));
    }
  }, [settings.name, userName]);

  const loadFinanceData = async () => {
    setIsLoading(true);
    try {
      const [transactionsData, budgetsData] = await Promise.all([
        fetchJson<Transaction[]>("/api/transactions"),
        fetchJson<Budget[]>("/api/budgets"),
      ]);
      setTransactions(transactionsData.map((tx) => ({ ...tx, notes: tx.notes ?? "" })));
      setBudgets(budgetsData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadFinanceData();
  }, []);

  const addTransaction = async (tx: Omit<Transaction, "id">) => {
    await fetchJson<Transaction>("/api/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: tx.type,
        amount: tx.amount,
        category: tx.category,
        description: tx.description,
        date: tx.date,
        paymentMethod: tx.paymentMethod,
        notes: tx.notes ?? "",
      }),
    });

    await loadFinanceData();
  };

  const deleteTransaction = async (id: number) => {
    const response = await apiFetch(`/api/transactions/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    await loadFinanceData();
  };

  const updateBudget = async (id: number, limit: number) => {
    const budget = budgets.find((item) => item.id === id);
    if (!budget) {
      return;
    }

    await fetchJson<Budget>("/api/budgets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        category: budget.category,
        limit,
        month: budget.month,
      }),
    });

    await loadFinanceData();
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
        isLoading,
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
