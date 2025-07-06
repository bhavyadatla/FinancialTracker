'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { MobileNav } from '@/components/layout/mobile-nav';
import { AdvancedFilters } from '@/components/dashboard/advanced-filters';
import { TransactionsTable } from '@/components/transactions/transactions-table';
import { AddTransactionDialog } from '@/components/transactions/add-transaction-dialog';
import { Button } from '@/components/ui/button';

export default function TransactionsPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    type: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
  });

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      queryParams.append('format', format);
      
      const response = await fetch(`/api/export/transactions?${queryParams}`);
      
      if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      
      <div className="flex-1 lg:ml-64">
        <Header 
          title="Transactions" 
          subtitle="Manage and analyze your financial transactions"
          onMobileMenuClick={() => setMobileNavOpen(true)}
          rightContent={<AddTransactionDialog />}
        />
        
        <main className="p-4 lg:p-8 space-y-6">
          <AdvancedFilters 
            onFilterChange={setFilters}
            onExport={handleExport}
          />
          
          <TransactionsTable filters={filters} />
        </main>
      </div>
    </div>
  );
}