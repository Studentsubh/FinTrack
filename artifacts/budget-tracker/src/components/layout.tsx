import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
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

const SWIPE_THRESHOLD = 40; // px

interface LayoutProps {
  children: React.ReactNode;
  onLogout?: () => void;
}

export function Layout({ children, onLogout }: LayoutProps) {
  const [location] = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const profileRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);
  const { settings, updateSettings } = useData();

  const pageTitle =
    PAGE_TITLES[location] ??
    location.split("/")[1]?.replace(/-/g, " ") ??
    "Page";

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // ── Swipe handlers ──
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartY.current === null) return;
      const delta = touchStartY.current - e.changedTouches[0].clientY;
      if (delta > SWIPE_THRESHOLD) setNavVisible(true);   // swipe UP → show
      if (delta < -SWIPE_THRESHOLD) setNavVisible(false); // swipe DOWN → hide
      touchStartY.current = null;
    },
    []
  );

  // Also allow swiping anywhere on the main content to reveal nav (swipe up)
  const onContentTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const onContentTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const delta = touchStartY.current - e.changedTouches[0].clientY;
    if (delta > SWIPE_THRESHOLD) setNavVisible(true);
    if (delta < -SWIPE_THRESHOLD) setNavVisible(false);
    touchStartY.current = null;
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
          <span className="text-lg font-bold text-foreground tracking-tight hidden sm:block">
            FinTrack
          </span>
        </div>

        {/* Page title — centered */}
        <h1 className="absolute left-1/2 -translate-x-1/2 text-base font-semibold text-foreground hidden md:block pointer-events-none">
          {pageTitle}
        </h1>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex text-xs font-semibold px-2.5 py-1 bg-secondary rounded-full text-secondary-foreground border border-border">
            {settings.currency}
          </span>

          <button
            onClick={() => updateSettings({ darkMode: !settings.darkMode })}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            aria-label="Toggle dark mode"
          >
            {settings.darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Profile dropdown */}
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
              <span className="text-sm font-medium text-foreground hidden sm:block">
                {settings.name}
              </span>
              <ChevronDown
                className={cn(
                  "w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 hidden sm:block",
                  profileOpen && "rotate-180"
                )}
              />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-2xl shadow-lg shadow-black/10 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-border/60">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {settings.name}
                  </p>
                  <p className="text-xs text-muted-foreground">Pro Member</p>
                </div>
                {onLogout && (
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      onLogout();
                    }}
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
      <main
        className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden pb-36"
        onTouchStart={onContentTouchStart}
        onTouchEnd={onContentTouchEnd}
      >
        {children}
      </main>

      {/* ── Island Bottom Nav + Drag Handle ── */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-[540px] px-4 flex flex-col items-center"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Drag handle pill — always visible, acts as the toggle anchor */}
        <button
          onClick={() => setNavVisible((v) => !v)}
          aria-label={navVisible ? "Hide navigation" : "Show navigation"}
          className={cn(
            "flex items-center justify-center transition-all duration-300 focus:outline-none",
            navVisible
              ? "mb-2 opacity-50 hover:opacity-100"
              : "mb-3 opacity-100"
          )}
        >
          <div
            className={cn(
              "rounded-full bg-foreground/20 backdrop-blur-sm transition-all duration-300",
              navVisible ? "w-10 h-1.5" : "w-24 h-6 flex items-center justify-center gap-1.5 shadow-lg bg-card border border-border/60"
            )}
          >
            {!navVisible && (
              <>
                <div className="w-1 h-1 rounded-full bg-muted-foreground" />
                <div className="w-1 h-1 rounded-full bg-muted-foreground" />
                <div className="w-1 h-1 rounded-full bg-muted-foreground" />
              </>
            )}
          </div>
        </button>

        {/* Nav bar — slides in/out */}
        <nav
          className={cn(
            "w-full flex items-center justify-around",
            "bg-card/90 backdrop-blur-xl",
            "border border-border/60",
            "rounded-[28px] px-3 py-3",
            "shadow-xl shadow-black/10",
            "transition-all duration-300 ease-in-out",
            navVisible
              ? "translate-y-0 opacity-100 mb-5 pointer-events-auto"
              : "translate-y-full opacity-0 mb-0 pointer-events-none"
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
                      "text-[10px] font-semibold leading-none tracking-wide whitespace-nowrap",
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
