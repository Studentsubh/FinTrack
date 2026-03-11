import React, { useState } from "react";
import { useData } from "@/lib/data-context";
import { Card, Button, Input, Select, PageTransition } from "@/components/ui-elements";
import { Download, User, Moon, Globe, Bell, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

function PlusCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10"/>
      <path d="M8 12h8"/>
      <path d="M12 8v8"/>
    </svg>
  );
}

interface SettingsProps {
  onLogout?: () => void;
}

export default function Settings({ onLogout }: SettingsProps) {
  const { settings, updateSettings, transactions } = useData();
  const { toast } = useToast();

  const [name, setName] = useState(settings.name);
  const [currency, setCurrency] = useState(settings.currency);

  const handleSave = () => {
    updateSettings({ name, currency });
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  const handleExport = () => {
    if (transactions.length === 0) {
      toast({ title: "No data", description: "There are no transactions to export.", variant: "destructive" });
      return;
    }

    const headers = "ID,Date,Type,Category,Amount,Description,Payment Method\n";
    const csv = transactions
      .map((t) => `${t.id},${t.date},${t.type},${t.category},${t.amount},"${t.description}",${t.paymentMethod}`)
      .join("\n");

    const blob = new Blob([headers + csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fintrack-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();

    toast({ title: "Export Successful", description: "Your data has been downloaded." });
  };

  return (
    <PageTransition className="max-w-3xl mx-auto space-y-8">

      {/* Profile Section */}
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-primary" /> Profile
        </h2>
        <Card className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
          <div className="relative flex-shrink-0">
            <img
              src={`${import.meta.env.BASE_URL}images/avatar.png`}
              alt="Profile"
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-background shadow-lg"
            />
            <button className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full shadow-md hover:bg-primary/90">
              <PlusCircleIcon className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 w-full space-y-4">
            <Input
              label="Display Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="Email Address"
              value="alex@example.com"
              disabled
              className="bg-secondary/50"
            />
          </div>
        </Card>
      </section>

      {/* Preferences Section */}
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" /> Preferences
        </h2>
        <Card className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Select
              label="Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              options={[
                { label: "US Dollar (USD, $)", value: "USD" },
                { label: "Euro (EUR, €)", value: "EUR" },
                { label: "British Pound (GBP, £)", value: "GBP" },
                { label: "Indian Rupee (INR, ₹)", value: "INR" },
              ]}
            />
            <Select
              label="Date Format"
              defaultValue="us"
              options={[
                { label: "MM/DD/YYYY (US)", value: "us" },
                { label: "DD/MM/YYYY (UK)", value: "uk" },
                { label: "YYYY-MM-DD (ISO)", value: "iso" },
              ]}
            />
          </div>

          <div className="pt-4 border-t border-border space-y-4">
            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">Switch between light and dark themes.</p>
                </div>
              </div>
              <button
                onClick={() => updateSettings({ darkMode: !settings.darkMode })}
                className={cn(
                  "relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                  settings.darkMode ? "bg-primary" : "bg-secondary border border-border"
                )}
                role="switch"
                aria-checked={settings.darkMode}
              >
                <span
                  className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300",
                    settings.darkMode ? "translate-x-7" : "translate-x-1"
                  )}
                />
              </button>
            </div>

            {/* Notifications Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">Get alerted when nearing budget limits.</p>
                </div>
              </div>
              <button
                className="relative w-12 h-6 bg-primary rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                role="switch"
                aria-checked={true}
              >
                <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
              </button>
            </div>
          </div>
        </Card>
      </section>

      {/* Data Section */}
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Download className="w-5 h-5 text-primary" /> Data Management
        </h2>
        <Card className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-medium">Export Transactions</p>
            <p className="text-sm text-muted-foreground">Download all your financial data as a CSV file.</p>
          </div>
          <Button variant="outline" className="w-full sm:w-auto gap-2" onClick={handleExport}>
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </Card>
      </section>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
        {onLogout && (
          <Button variant="outline" className="w-full sm:w-auto gap-2 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={onLogout}>
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        )}
        <Button size="lg" className="w-full sm:w-auto" onClick={handleSave}>Save Changes</Button>
      </div>

    </PageTransition>
  );
}
