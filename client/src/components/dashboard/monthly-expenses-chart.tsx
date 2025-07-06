import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export function MonthlyExpensesChart() {
  const [months, setMonths] = useState("6");

  const { data: monthlyData, isLoading } = useQuery({
    queryKey: ["/api/analytics/monthly-expenses", months],
    queryFn: () => fetch(`/api/analytics/monthly-expenses?months=${months}`).then(res => res.json()),
  });

  if (isLoading) {
    return (
      <Card className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Monthly Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-200 animate-pulse rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-800">Monthly Expenses</CardTitle>
          <Select value={months} onValueChange={setMonths}>
            <SelectTrigger className="w-auto text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6">Last 6 months</SelectItem>
              <SelectItem value="12">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {monthlyData && monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Bar 
                  dataKey="amount" 
                  fill="hsl(207, 90%, 54%)" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              No expense data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
