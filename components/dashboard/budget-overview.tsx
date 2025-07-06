import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/currency";
import { motion } from "framer-motion";

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

  // If no budgets exist, show sample budget data with INR amounts
  const sampleBudgets = [
    { category: { name: "Food & Dining", color: "#f97316" }, amount: "15000", spent: expenseMap.get("Food & Dining") || 12500 },
    { category: { name: "Transportation", color: "#eab308" }, amount: "8000", spent: expenseMap.get("Transportation") || 6200 },
    { category: { name: "Entertainment", color: "#3b82f6" }, amount: "5000", spent: expenseMap.get("Entertainment") || 3200 },
    { category: { name: "Shopping", color: "#ef4444" }, amount: "10000", spent: expenseMap.get("Shopping") || 11500 },
  ];

  // Map budget data with actual spending
  const budgetData = budgets && budgets.length > 0 
    ? budgets.map((budget: any) => ({
        ...budget,
        spent: expenseMap.get(budget.category?.name) || 0
      }))
    : sampleBudgets;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      <Card className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-slate-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <i className="fas fa-bullseye text-orange-600"></i>
            Budget Overview
          </CardTitle>
          <p className="text-sm text-slate-600 mt-1">Your spending vs budget for this month</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {budgetData.map((budget: any, index: number) => {
            const budgetAmount = typeof budget.amount === 'number' ? budget.amount : parseFloat(budget.amount || '0');
            const spentAmount = budget.spent || 0;
            const percentage = budgetAmount > 0 ? Math.min((spentAmount / budgetAmount) * 100, 100) : 0;
            const isOverBudget = spentAmount > budgetAmount;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.7 + (index * 0.1) }}
                className="space-y-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full shadow-sm" 
                      style={{ backgroundColor: budget.category.color }}
                    ></div>
                    <span className="text-sm font-medium text-slate-800">
                      {budget.category.name}
                    </span>
                    {isOverBudget && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                        <i className="fas fa-exclamation-triangle mr-1"></i>
                        Over Budget
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${isOverBudget ? 'text-red-600' : 'text-slate-800'}`}>
                      {formatCurrency(spentAmount)}
                    </div>
                    <div className="text-xs text-slate-500">
                      of {formatCurrency(budgetAmount)}
                    </div>
                  </div>
                </div>
                <Progress 
                  value={percentage} 
                  className="w-full h-3"
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
        })}
      </CardContent>
    </Card>
  );
}
