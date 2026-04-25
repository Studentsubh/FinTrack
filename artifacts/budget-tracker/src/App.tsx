import { Suspense, lazy, useEffect, useState } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { apiFetch } from "@/lib/api";
import { DataProvider } from "@/lib/data-context";
import { Layout } from "@/components/layout";
import Login from "@/pages/login";

const NotFound = lazy(() => import("@/pages/not-found"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const AddTransaction = lazy(() => import("@/pages/add-transaction"));
const TransactionsHistory = lazy(() => import("@/pages/transactions"));
const BudgetOverview = lazy(() => import("@/pages/budget"));
const Reports = lazy(() => import("@/pages/reports"));
const Settings = lazy(() => import("@/pages/settings"));

const queryClient = new QueryClient();
type AuthUser = { id: number; name: string; email: string };

function Router({ onLogout }: { onLogout: () => void }) {
  return (
    <Layout onLogout={onLogout}>
      <Suspense fallback={<RouteFallback />}>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/add" component={AddTransaction} />
          <Route path="/transactions" component={TransactionsHistory} />
          <Route path="/budget" component={BudgetOverview} />
          <Route path="/reports" component={Reports} />
          <Route path="/settings">
            <Settings onLogout={onLogout} />
          </Route>
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </Layout>
  );
}

function RouteFallback() {
  return <div className="min-h-[50vh]" aria-busy="true" />;
}

function App() {
  const [authState, setAuthState] = useState<"loading" | "authenticated" | "guest">("loading");
  const [user, setUser] = useState<AuthUser | null>(null);

  const handleLogout = async () => {
    await apiFetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setAuthState("guest");
  };

  useEffect(() => {
    void apiFetch("/api/auth/me")
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("No active session");
        }
        return response.json() as Promise<AuthUser>;
      })
      .then((authUser) => {
        setUser(authUser);
        setAuthState("authenticated");
      })
      .catch(() => {
        setAuthState("guest");
      });
  }, []);

  if (authState === "loading") {
    return null;
  }

  if (authState !== "authenticated" || !user) {
    return (
      <>
        <Login
          onLogin={(authUser) => {
            setUser(authUser);
            setAuthState("authenticated");
          }}
        />
        <Toaster />
      </>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <DataProvider userName={user.name}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router onLogout={handleLogout} />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </DataProvider>
    </QueryClientProvider>
  );
}

export default App;
