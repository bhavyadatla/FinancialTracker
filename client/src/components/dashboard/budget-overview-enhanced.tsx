import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

export function BudgetOverview() {
  const { data: budgets, isLoading: budgetsLoading } = useQuery({
    queryKey: ["/api/budgets"],
  });

  const { data: categoryExpenses, isLoading: expensesLoading } = useQuery({
    queryKey: ["/api/analytics/category-expenses"],
  });

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

  if (budgetsLoading || expensesLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
          <CardHeader>
            <CardTitle className="text-xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Budget Overview
            </CardTitle>
            <p className="text-sm text-gray-600">Your spending vs budget for this month</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse rounded-lg"></div>
                  <div className="h-2 bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse rounded-full"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Create a map of category expenses for quick lookup
  const expenseMap = new Map();
  if (categoryExpenses) {
    categoryExpenses.forEach((expense: any) => {
      expenseMap.set(expense.category, expense.amount);
    });
  }

  // Enhanced budget data with INR amounts
  const sampleBudgets = [
    { 
      category: { name: "Food & Dining", color: "#f97316", icon: "fas fa-utensils" }, 
      amount: 15000, 
      spent: expenseMap.get("Food & Dining") || 12500 
    },
    { 
      category: { name: "Transportation", color: "#eab308", icon: "fas fa-car" }, 
      amount: 8000, 
      spent: expenseMap.get("Transportation") || 6200 
    },
    { 
      category: { name: "Entertainment", color: "#3b82f6", icon: "fas fa-gamepad" }, 
      amount: 5000, 
      spent: expenseMap.get("Entertainment") || 3200 
    },
    { 
      category: { name: "Shopping", color: "#ef4444", icon: "fas fa-shopping-bag" }, 
      amount: 10000, 
      spent: expenseMap.get("Shopping") || 11500 
    },
    { 
      category: { name: "Healthcare", color: "#06b6d4", icon: "fas fa-heartbeat" }, 
      amount: 5000, 
      spent: expenseMap.get("Healthcare") || 2800 
    },
    { 
      category: { name: "Housing", color: "#8b5cf6", icon: "fas fa-home" }, 
      amount: 25000, 
      spent: expenseMap.get("Housing") || 23500 
    },
  ];

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Budget Overview
          </CardTitle>
          <p className="text-sm text-gray-600">Your spending vs budget for this month</p>
        </CardHeader>
        <CardContent>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {budgetData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No budgets set for this month.</p>
                <p className="text-sm mt-2">Create budgets to track your spending goals.</p>
              </div>
            ) : budgetData.map((budget: any, index: number) => {
              const budgetAmount = typeof budget.amount === 'number' ? budget.amount : parseFloat(budget.amount || '0');
              const spentAmount = typeof budget.spent === 'number' ? budget.spent : parseFloat(budget.spent || '0');
              const percentage = budgetAmount > 0 ? Math.min((spentAmount / budgetAmount) * 100, 100) : 0;
              const isOverBudget = spentAmount > budgetAmount;
              const remaining = budgetAmount - spentAmount;

              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md"
                        style={{ 
                          background: `linear-gradient(135deg, ${budget.category?.color || '#6b7280'}, ${budget.category?.color || '#6b7280'}dd)` 
                        }}
                      >
                        <i className={`${budget.category?.icon || 'fas fa-circle'} text-sm`}></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">
                          {budget.category.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {formatCurrency(spentAmount)} of {formatCurrency(budgetAmount)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                        {isOverBudget ? '+' : ''}{formatCurrency(Math.abs(remaining))}
                      </div>
                      <div className="text-xs text-gray-500">
                        {isOverBudget ? 'over budget' : 'remaining'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{percentage.toFixed(1)}% used</span>
                      {isOverBudget && (
                        <span className="text-red-500 font-medium flex items-center">
                          <i className="fas fa-exclamation-triangle mr-1"></i>
                          Over Budget
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Progress 
                        value={Math.min(percentage, 100)} 
                        className="h-3 bg-gray-100"
                      />
                      {isOverBudget && (
                        <div 
                          className="absolute top-0 left-0 h-3 bg-red-500 rounded-full opacity-80"
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
          
          {/* Summary Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.3 }}
            className="mt-6 pt-6 border-t border-gray-200"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                <div className="text-sm text-gray-600">Total Budget</div>
                <div className="text-lg font-bold text-green-700">
                  {formatCurrency(budgetData.reduce((sum: number, budget: any) => {
                    const amount = typeof budget.amount === 'number' ? budget.amount : parseFloat(budget.amount || '0');
                    return sum + (isNaN(amount) ? 0 : amount);
                  }, 0))}
                </div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                <div className="text-sm text-gray-600">Total Spent</div>
                <div className="text-lg font-bold text-blue-700">
                  {formatCurrency(budgetData.reduce((sum: number, budget: any) => {
                    const spent = typeof budget.spent === 'number' ? budget.spent : parseFloat(budget.spent || '0');
                    return sum + (isNaN(spent) ? 0 : spent);
                  }, 0))}
                </div>
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}