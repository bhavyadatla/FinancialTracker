import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AddTransactionModal } from "@/components/transactions/add-transaction-modal";

interface HeaderProps {
  title: string;
  subtitle: string;
  onMobileMenuClick: () => void;
}

export function Header({ title, subtitle, onMobileMenuClick }: HeaderProps) {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-slate-200 px-4 py-4 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden p-2 rounded-md text-slate-600 hover:text-slate-800 hover:bg-slate-100"
              onClick={onMobileMenuClick}
            >
              <i className="fas fa-bars text-xl"></i>
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
              <p className="text-sm text-slate-600">{subtitle}</p>
            </div>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <i className="fas fa-plus text-sm"></i>
            <span>Add Transaction</span>
          </Button>
        </div>
      </header>

      <AddTransactionModal 
        open={showAddModal} 
        onOpenChange={setShowAddModal} 
      />
    </>
  );
}
