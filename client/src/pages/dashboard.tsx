import { SummaryCards } from "@/components/dashboard/summary-cards";
import { MonthlyExpensesChart } from "@/components/dashboard/monthly-expenses-chart";
import { CategoryPieChart } from "@/components/dashboard/category-pie-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { BudgetOverview } from "@/components/dashboard/budget-overview";

export default function Dashboard() {
  return (
    <main className="p-4 lg:p-8 space-y-6">
      <SummaryCards />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyExpensesChart />
        <CategoryPieChart />
      </div>

      <RecentTransactions />
      
      <BudgetOverview />
    </main>
  );
}
