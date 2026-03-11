import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  PlusCircle,
  List,
  PieChart,
  BarChart2,
  Settings,
  Menu,
  X,
  Wallet,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import { useData } from "@/lib/data-context";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/add", label: "Add Transaction", icon: PlusCircle },
  { href: "/transactions", label: "Transactions", icon: List },
  { href: "/budget", label: "Budget Overview", icon: PieChart },
  { href: "/reports", label: "Reports", icon: BarChart2 },
  { href: "/settings", label: "Settings", icon: Settings },
];

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/add": "Add Transaction",
  "/transactions": "Transactions",
  "/budget": "Budget Overview",
  "/reports": "Reports",
  "/settings": "Settings",
};

interface LayoutProps {
  children: React.ReactNode;
  onLogout?: () => void;
}

export function Layout({ children, onLogout }: LayoutProps) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { settings, updateSettings } = useData();

  const pageTitle = PAGE_TITLES[location] ?? location.split("/")[1]?.replace(/-/g, " ") ?? "Page";

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-7 mb-2">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
          <Wallet className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-bold text-foreground tracking-tight">FinTrack</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group cursor-pointer",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 flex-shrink-0",
                    isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"
                  )}
                />
                <span className="truncate">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer actions */}
      <div className="p-4 space-y-2 border-t border-border/50 mt-2">
        {/* Dark mode toggle */}
        <button
          onClick={() => updateSettings({ darkMode: !settings.darkMode })}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200 group"
        >
          {settings.darkMode ? (
            <Sun className="w-5 h-5 flex-shrink-0 group-hover:text-primary" />
          ) : (
            <Moon className="w-5 h-5 flex-shrink-0 group-hover:text-primary" />
          )}
          <span className="text-sm font-medium">{settings.darkMode ? "Light Mode" : "Dark Mode"}</span>
        </button>

        {/* Logout */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200 group"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        )}

        {/* Profile */}
        <div className="flex items-center gap-3 bg-secondary/50 p-3 rounded-2xl border border-border/50 mt-2">
          <img
            src={`${import.meta.env.BASE_URL}images/avatar.png`}
            alt="Profile"
            className="w-9 h-9 rounded-full object-cover bg-background border border-border flex-shrink-0"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-foreground truncate">{settings.name}</span>
            <span className="text-xs text-muted-foreground">Pro Member</span>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 xl:w-72 flex-col fixed inset-y-0 left-0 bg-card border-r border-border/50 z-50">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 w-72 bg-card border-r border-border/50 z-50 transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:pl-64 xl:pl-72 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 bg-card/90 backdrop-blur-md border-b border-border">
          <div className="flex items-center gap-2">
            <Wallet className="w-6 h-6 text-primary" />
            <span className="text-lg font-bold">FinTrack</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => updateSettings({ darkMode: !settings.darkMode })}
              className="p-2 text-muted-foreground hover:bg-secondary rounded-lg transition-colors"
            >
              {settings.darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-muted-foreground hover:bg-secondary rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:flex sticky top-0 z-30 h-16 items-center justify-between px-8 bg-background/80 backdrop-blur-md border-b border-border/30">
          <h1 className="text-xl font-bold text-foreground">{pageTitle}</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium px-3 py-1.5 bg-secondary rounded-full text-secondary-foreground border border-border">
              {settings.currency}
            </span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
