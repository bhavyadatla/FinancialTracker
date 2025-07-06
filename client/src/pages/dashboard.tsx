import { SummaryCards } from "@/components/dashboard/summary-cards";
import { MonthlyExpensesChart } from "@/components/dashboard/monthly-expenses-chart";
import { CategoryPieChart } from "@/components/dashboard/category-pie-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { BudgetOverview } from "@/components/dashboard/budget-overview";

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Financial Dashboard</h1>
          <p className="text-slate-600">Track your finances and manage your budget effectively</p>
        </div>

        {/* Summary Cards */}
        <SummaryCards />
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <MonthlyExpensesChart />
          <CategoryPieChart />
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <RecentTransactions />
          <BudgetOverview />
        </div>
      </div>
    </main>
  );
}
