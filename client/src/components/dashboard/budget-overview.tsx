import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/currency";

export function BudgetOverview() {
  const { data: budgets, isLoading: budgetsLoading } = useQuery({
    queryKey: ["/api/budgets"],
  });

  const { data: categoryExpenses, isLoading: expensesLoading } = useQuery({
    queryKey: ["/api/analytics/category-expenses"],
  });

  if (budgetsLoading || expensesLoading) {
    return (
      <Card className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Budget Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                <div className="h-2 bg-gray-200 animate-pulse rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Create a map of category expenses for quick lookup
  const expenseMap = new Map();
  if (categoryExpenses) {
    categoryExpenses.forEach((expense: any) => {
      expenseMap.set(expense.category, expense.amount);
    });
  }

  // Map budget data with actual spending from category expenses
  const budgetData = budgets && budgets.length > 0 
    ? budgets.map((budget: any) => {
        const categoryName = budget.category?.name;
        const spentAmount = expenseMap.get(categoryName) || 0;
        return {
          ...budget,
          spent: spentAmount
        };
      })
    : [];

  // Calculate totals for the summary
  const totalBudget = budgetData.reduce((sum, budget) => sum + (typeof budget.amount === 'number' ? budget.amount : parseFloat(budget.amount || '0')), 0);
  const totalSpent = budgetData.reduce((sum, budget) => sum + (budget.spent || 0), 0);

  return (
    <Card className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-800">Budget Overview</CardTitle>
        <p className="text-sm text-slate-600 mt-1">Your spending vs budget for this month</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {budgetData.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p>No budgets set for this month.</p>
            <p className="text-sm mt-2">Create budgets to track your spending goals.</p>
          </div>
        ) : (
          budgetData.map((budget: any, index: number) => {
          const budgetAmount = typeof budget.amount === 'number' ? budget.amount : parseFloat(budget.amount || '0');
          const spentAmount = budget.spent || 0;
          const percentage = budgetAmount > 0 ? Math.min((spentAmount / budgetAmount) * 100, 100) : 0;
          const isOverBudget = spentAmount > budgetAmount;

          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: budget.category.color }}
                  ></div>
                  <span className="text-sm font-medium text-slate-800">
                    {budget.category.name}
                  </span>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${isOverBudget ? 'text-red-600' : 'text-slate-800'}`}>
                    {formatCurrency(spentAmount)}
                  </div>
                  <div className="text-xs text-slate-500">
                    of {formatCurrency(budgetAmount)}
                  </div>
                </div>
              </div>
              <Progress 
                value={percentage} 
                className="w-full h-2"
                style={{ 
                  backgroundColor: '#e2e8f0',
                }}
              />
              {isOverBudget && (
                <p className="text-xs text-red-600">
                  Over budget by {formatCurrency(spentAmount - budgetAmount)}
                </p>
              )}
            </div>
          );
        }))}
        
        {budgetData.length > 0 && (
          <div className="pt-4 border-t border-slate-200">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-slate-700">Total Budget</span>
              <span className="font-medium text-slate-800">{formatCurrency(totalBudget)}</span>
            </div>
            <div className="flex justify-between items-center text-sm mt-1">
              <span className="font-medium text-slate-700">Total Spent</span>
              <span className="font-medium text-slate-800">{formatCurrency(totalSpent)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
