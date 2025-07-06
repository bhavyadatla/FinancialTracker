import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, AlertTriangle, Target, Calendar, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { motion } from "framer-motion";

interface SpendingInsight {
  title: string;
  value: string | number;
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
  description: string;
  severity: 'success' | 'warning' | 'danger' | 'info';
}

export function SpendingInsights() {
  const { data: summaryStats } = useQuery({
    queryKey: ["/api/analytics/summary"],
  });

  const { data: budgetPerformance = [] } = useQuery({
    queryKey: ["/api/analytics/budget-performance"],
  });

  const { data: spendingTrends = [] } = useQuery({
    queryKey: ["/api/analytics/spending-trends", 6],
  });

  // Calculate insights
  const insights: SpendingInsight[] = [];

  if (summaryStats) {
    // Savings Rate Insight
    insights.push({
      title: "Savings Rate",
      value: `${summaryStats.savingsRate.toFixed(1)}%`,
      trend: summaryStats.savingsRate > 20 ? 'up' : summaryStats.savingsRate > 10 ? 'neutral' : 'down',
      trendValue: summaryStats.savingsRate > 20 ? "Excellent" : summaryStats.savingsRate > 10 ? "Good" : "Needs Improvement",
      description: summaryStats.savingsRate > 20 ? "You're saving more than 20% of your income!" : "Consider reducing expenses to improve savings.",
      severity: summaryStats.savingsRate > 20 ? 'success' : summaryStats.savingsRate > 10 ? 'info' : 'warning'
    });

    // Monthly Spending vs Income
    const spendingRatio = summaryStats.monthlyIncome > 0 ? (summaryStats.monthlyExpenses / summaryStats.monthlyIncome) * 100 : 0;
    insights.push({
      title: "Spending Ratio",
      value: `${spendingRatio.toFixed(1)}%`,
      trend: spendingRatio < 80 ? 'up' : spendingRatio < 90 ? 'neutral' : 'down',
      trendValue: `${formatCurrency(summaryStats.monthlyExpenses)} of ${formatCurrency(summaryStats.monthlyIncome)}`,
      description: spendingRatio < 80 ? "Healthy spending habits" : "Consider monitoring expenses more closely",
      severity: spendingRatio < 80 ? 'success' : spendingRatio < 90 ? 'info' : 'warning'
    });
  }

  // Budget Performance Insights
  if (budgetPerformance.length > 0) {
    const overBudgetCategories = budgetPerformance.filter(b => b.percentageUsed > 100);
    const underBudgetCategories = budgetPerformance.filter(b => b.percentageUsed < 50);

    if (overBudgetCategories.length > 0) {
      insights.push({
        title: "Over Budget",
        value: overBudgetCategories.length,
        trend: 'down',
        trendValue: `${overBudgetCategories.length} categories`,
        description: `You've exceeded budget in ${overBudgetCategories.map(c => c.categoryName).join(', ')}`,
        severity: 'danger'
      });
    }

    if (underBudgetCategories.length > 0) {
      insights.push({
        title: "Under Budget",
        value: underBudgetCategories.length,
        trend: 'up',
        trendValue: `${underBudgetCategories.length} categories`,
        description: "Great job staying under budget in multiple categories!",
        severity: 'success'
      });
    }
  }

  // Spending Trends
  if (spendingTrends.length >= 2) {
    const currentMonth = spendingTrends[spendingTrends.length - 1];
    const previousMonth = spendingTrends[spendingTrends.length - 2];
    const expenseChange = ((currentMonth.expenses - previousMonth.expenses) / previousMonth.expenses) * 100;

    insights.push({
      title: "Monthly Trend",
      value: `${Math.abs(expenseChange).toFixed(1)}%`,
      trend: expenseChange < 0 ? 'up' : 'down',
      trendValue: expenseChange < 0 ? "Decrease" : "Increase",
      description: `Your expenses ${expenseChange < 0 ? 'decreased' : 'increased'} compared to last month`,
      severity: expenseChange < 0 ? 'success' : expenseChange > 20 ? 'danger' : 'warning'
    });
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'success': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'danger': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Target className="h-4 w-4 text-blue-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'danger': return 'bg-red-50 border-red-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Spending Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Add more transactions to see insights</p>
            </div>
          ) : (
            insights.map((insight, index) => (
              <motion.div
                key={insight.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${getSeverityColor(insight.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getSeverityIcon(insight.severity)}
                    <div>
                      <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                      <p className="text-sm text-gray-600">{insight.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{insight.value}</div>
                    <Badge variant={insight.trend === 'up' ? 'default' : insight.trend === 'down' ? 'destructive' : 'secondary'}>
                      {insight.trendValue}
                    </Badge>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}