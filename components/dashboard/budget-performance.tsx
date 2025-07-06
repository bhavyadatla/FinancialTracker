'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";

export function BudgetPerformance() {
  const { data: budgetData, isLoading } = useQuery({
    queryKey: ['/api/analytics/budget-performance'],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!budgetData || budgetData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <i className="fas fa-chart-pie text-4xl mb-4"></i>
            <p>No budget data available for this month</p>
            <p className="text-sm mt-2">Set up budgets to track your spending goals</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Budget Performance Analysis</CardTitle>
        <p className="text-sm text-gray-600">Track your spending against monthly budgets</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {budgetData.map((budget: any) => {
            const isOverBudget = budget.actualAmount > budget.budgetAmount;
            const progressValue = Math.min((budget.actualAmount / budget.budgetAmount) * 100, 100);
            
            return (
              <div key={budget.categoryId} className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{budget.categoryName}</h3>
                    <p className="text-sm text-gray-600">
                      {formatCurrency(budget.actualAmount)} of {formatCurrency(budget.budgetAmount)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-medium ${
                      isOverBudget ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {budget.percentageUsed.toFixed(1)}%
                    </span>
                    {isOverBudget && (
                      <div className="flex items-center text-red-600 text-xs mt-1">
                        <i className="fas fa-exclamation-triangle mr-1"></i>
                        Over budget
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Progress 
                    value={progressValue} 
                    className={`h-2 ${isOverBudget ? 'progress-red' : 'progress-green'}`}
                  />
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>₹0</span>
                    <span>{formatCurrency(budget.budgetAmount)}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className={`font-medium ${
                    budget.variance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {budget.variance >= 0 ? 'Under budget: ' : 'Over budget: '}
                    {formatCurrency(Math.abs(budget.variance))}
                  </span>
                  
                  {budget.variance < 0 && (
                    <span className="text-red-600 text-xs bg-red-50 px-2 py-1 rounded">
                      Alert: Budget exceeded
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 pt-6 border-t">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900">Categories on Track</h4>
              <p className="text-2xl font-bold text-green-700 mt-2">
                {budgetData.filter((b: any) => b.actualAmount <= b.budgetAmount).length}
              </p>
              <p className="text-sm text-green-600 mt-1">
                Out of {budgetData.length} budgets
              </p>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-semibold text-red-900">Over Budget</h4>
              <p className="text-2xl font-bold text-red-700 mt-2">
                {budgetData.filter((b: any) => b.actualAmount > b.budgetAmount).length}
              </p>
              <p className="text-sm text-red-600 mt-1">
                Need attention
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}