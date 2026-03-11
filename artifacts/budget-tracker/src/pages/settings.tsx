import React, { useState } from "react";
import { useData } from "@/lib/data-context";
import { Card, Button, Input, Select, PageTransition } from "@/components/ui-elements";
import { Download, User, Moon, Globe, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
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
    const csv = transactions.map(t => 
      `${t.id},${t.date},${t.type},${t.category},${t.amount},"${t.description}",${t.paymentMethod}`
    ).join("\n");
    
    const blob = new Blob([headers + csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fintrack-export-${new Date().toISOString().split('T')[0]}.csv`;
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
        <Card className="flex flex-col sm:flex-row items-center gap-8">
          <div className="relative">
            <img 
              src={`${import.meta.env.BASE_URL}images/avatar.png`} 
              alt="Profile" 
              className="w-24 h-24 rounded-full object-cover border-4 border-background shadow-lg"
            />
            <button className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full shadow-md hover:bg-primary/90">
              <PlusCircle className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 w-full space-y-4">
            <Input 
              label="Display Name" 
              value={name} 
              onChange={e => setName(e.target.value)} 
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select 
              label="Currency"
              value={currency}
              onChange={e => setCurrency(e.target.value)}
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

          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-muted-foreground">Adjust the appearance of the app.</p>
              </div>
              <div className="w-12 h-6 bg-secondary rounded-full relative cursor-pointer border border-border">
                <div className="absolute left-1 top-1 w-4 h-4 bg-background rounded-full shadow-sm" />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-muted-foreground">Get alerted when nearing budget limits.</p>
              </div>
              <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
              </div>
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

      <div className="flex justify-end pt-4">
        <Button size="lg" onClick={handleSave}>Save Changes</Button>
      </div>

    </PageTransition>
  );
}

// Small helper since it's used inline above
function PlusCircle(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>;
}
