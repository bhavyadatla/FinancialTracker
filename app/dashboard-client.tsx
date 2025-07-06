'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { MobileNav } from '@/components/layout/mobile-nav';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { MonthlyExpensesChart } from '@/components/dashboard/monthly-expenses-chart';
import { CategoryPieChart } from '@/components/dashboard/category-pie-chart';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { BudgetOverview } from '@/components/dashboard/budget-overview';
import { SpendingTrends } from '@/components/dashboard/spending-trends';
import { SpendingForecast } from '@/components/dashboard/spending-forecast';
import { BudgetPerformance } from '@/components/dashboard/budget-performance';

export function DashboardClient() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      
      <div className="flex-1 lg:ml-64">
        <Header 
          title="Dashboard" 
          subtitle="Welcome back! Here's your financial overview."
          onMobileMenuClick={() => setMobileNavOpen(true)}
        />
        
        <main className="p-4 lg:p-8 space-y-6">
          <SummaryCards />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MonthlyExpensesChart />
            <CategoryPieChart />
          </div>

          <SpendingTrends />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SpendingForecast />
            <BudgetPerformance />
          </div>

          <RecentTransactions />
          
          <BudgetOverview />
        </main>
      </div>
    </div>
  );
}