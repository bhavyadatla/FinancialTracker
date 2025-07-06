import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useState } from "react";
import Dashboard from "@/pages/dashboard";
import Transactions from "@/pages/transactions";
import NotFound from "@/pages/not-found";

function Router() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      
      <div className="flex-1 lg:ml-64">
        <Switch>
          <Route path="/">
            <Header 
              title="Dashboard" 
              subtitle="Welcome back! Here's your financial overview."
              onMobileMenuClick={() => setMobileNavOpen(true)}
            />
            <Dashboard />
          </Route>
          <Route path="/transactions">
            <Header 
              title="Transactions" 
              subtitle="Manage all your income and expenses."
              onMobileMenuClick={() => setMobileNavOpen(true)}
            />
            <Transactions />
          </Route>
          <Route path="/categories">
            <Header 
              title="Categories" 
              subtitle="Organize your transactions by category."
              onMobileMenuClick={() => setMobileNavOpen(true)}
            />
            <div className="p-4 lg:p-8">
              <div className="text-center text-gray-500">Categories page coming soon...</div>
            </div>
          </Route>
          <Route path="/budget">
            <Header 
              title="Budget" 
              subtitle="Set and track your spending budgets."
              onMobileMenuClick={() => setMobileNavOpen(true)}
            />
            <div className="p-4 lg:p-8">
              <div className="text-center text-gray-500">Budget page coming soon...</div>
            </div>
          </Route>
          <Route path="/reports">
            <Header 
              title="Reports" 
              subtitle="Detailed insights into your financial data."
              onMobileMenuClick={() => setMobileNavOpen(true)}
            />
            <div className="p-4 lg:p-8">
              <div className="text-center text-gray-500">Reports page coming soon...</div>
            </div>
          </Route>
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
