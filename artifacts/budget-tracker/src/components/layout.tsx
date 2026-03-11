import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  PlusCircle,
  List,
  PieChart,
  BarChart2,
  Settings,
  Wallet,
  LogOut,
  Moon,
  Sun,
  ChevronDown,
} from "lucide-react";
import { useData } from "@/lib/data-context";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/add", label: "Add", icon: PlusCircle },
  { href: "/transactions", label: "Transactions", icon: List },
  { href: "/budget", label: "Budget", icon: PieChart },
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
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { settings, updateSettings } = useData();

  const pageTitle = PAGE_TITLES[location] ?? location.split("/")[1]?.replace(/-/g, " ") ?? "Page";

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Top Header ── */}
      <header className="sticky top-0 z-40 h-16 flex items-center justify-between px-4 sm:px-8 bg-background/80 backdrop-blur-md border-b border-border/40">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/30">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-foreground tracking-tight hidden sm:block">FinTrack</span>
        </div>

        {/* Page title — centered on desktop */}
        <h1 className="absolute left-1/2 -translate-x-1/2 text-base font-semibold text-foreground hidden md:block">
          {pageTitle}
        </h1>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Currency badge */}
          <span className="hidden sm:inline-flex text-xs font-semibold px-2.5 py-1 bg-secondary rounded-full text-secondary-foreground border border-border">
            {settings.currency}
          </span>

          {/* Dark mode toggle */}
          <button
            onClick={() => updateSettings({ darkMode: !settings.darkMode })}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            aria-label="Toggle dark mode"
          >
            {settings.darkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </button>

          {/* Profile / Logout dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((v) => !v)}
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl hover:bg-secondary transition-colors border border-transparent hover:border-border"
            >
              <img
                src={`${import.meta.env.BASE_URL}images/avatar.png`}
                alt="Profile"
                className="w-7 h-7 rounded-full object-cover border border-border bg-secondary"
              />
              <span className="text-sm font-medium text-foreground hidden sm:block">{settings.name}</span>
              <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 hidden sm:block", profileOpen && "rotate-180")} />
            </button>

            {/* Dropdown */}
            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-2xl shadow-lg shadow-black/10 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-border/60">
                  <p className="text-sm font-semibold text-foreground truncate">{settings.name}</p>
                  <p className="text-xs text-muted-foreground">Pro Member</p>
                </div>
                {onLogout && (
                  <button
                    onClick={() => { setProfileOpen(false); onLogout(); }}
                    className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden pb-32">
        {children}
      </main>

      {/* ── Island Bottom Nav ── */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-[520px]">
        <nav
          className={cn(
            "flex items-center justify-around",
            "bg-card/90 backdrop-blur-xl",
            "border border-border/60",
            "rounded-[28px] px-3 py-3",
            "shadow-xl shadow-black/10",
          )}
        >
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex flex-col items-center gap-1 cursor-pointer select-none",
                    "px-3 py-2 rounded-2xl transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5 flex-shrink-0 transition-transform duration-200",
                      isActive && "scale-110"
                    )}
                  />
                  <span
                    className={cn(
                      "text-[10px] font-semibold leading-none tracking-wide whitespace-nowrap transition-all duration-200",
                      isActive ? "opacity-100" : "opacity-70"
                    )}
                  >
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
