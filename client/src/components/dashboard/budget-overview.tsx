import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";

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

  // If no budgets exist, show sample budget data
  const sampleBudgets = [
    { category: { name: "Food & Dining", color: "#f97316" }, amount: "500", spent: expenseMap.get("Food & Dining") || 420 },
    { category: { name: "Transportation", color: "#eab308" }, amount: "250", spent: expenseMap.get("Transportation") || 180 },
    { category: { name: "Entertainment", color: "#3b82f6" }, amount: "200", spent: expenseMap.get("Entertainment") || 95 },
    { category: { name: "Shopping", color: "#ef4444" }, amount: "300", spent: expenseMap.get("Shopping") || 350 },
  ];

  const budgetData = budgets && budgets.length > 0 ? budgets : sampleBudgets;

  return (
    <Card className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-800">Budget Overview</CardTitle>
        <p className="text-sm text-slate-600 mt-1">Your spending vs budget for this month</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {budgetData.map((budget: any, index: number) => {
          const budgetAmount = parseFloat(budget.amount);
          const spentAmount = budget.spent || 0;
          const percentage = Math.min((spentAmount / budgetAmount) * 100, 100);
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
                    ${spentAmount.toFixed(0)}
                  </div>
                  <div className="text-xs text-slate-500">
                    of ${budgetAmount.toFixed(0)}
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
                  Over budget by ${(spentAmount - budgetAmount).toFixed(0)}
                </p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
