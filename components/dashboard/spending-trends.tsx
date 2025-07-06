'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import { useState } from 'react';
import { formatCurrency } from "@/lib/currency";
import { motion } from "framer-motion";

export function SpendingTrends() {
  const [timeRange, setTimeRange] = useState('12');
  
  const { data: trendsData, isLoading } = useQuery({
    queryKey: ['/api/analytics/trends', timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/trends?months=${timeRange}`);
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Spending Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] bg-gray-100 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="col-span-full"
    >
      <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-slate-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <i className="fas fa-chart-line text-indigo-600"></i>
            Spending Trends Analysis
          </CardTitle>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6">6 Months</SelectItem>
              <SelectItem value="12">12 Months</SelectItem>
              <SelectItem value="24">24 Months</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={formatCurrency}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [formatCurrency(value), name]}
                labelStyle={{ color: '#1e293b', fontWeight: 600 }}
                contentStyle={{ 
                  backgroundColor: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 8, fill: '#10b981' }}
                name="Income"
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="#ef4444" 
                strokeWidth={3}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 8, fill: '#ef4444' }}
                name="Expenses"
              />
              <Line 
                type="monotone" 
                dataKey="savings" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 8, fill: '#8b5cf6' }}
                name="Savings"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200 shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded-full mr-3 shadow-sm"></div>
              <h3 className="font-semibold text-green-900">Average Income</h3>
            </div>
            <p className="text-2xl font-bold text-green-700 mt-2">
              {trendsData && formatCurrency(trendsData.reduce((sum: number, item: any) => sum + item.income, 0) / trendsData.length)}
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="bg-gradient-to-br from-red-50 to-rose-50 p-4 rounded-lg border border-red-200 shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded-full mr-3 shadow-sm"></div>
              <h3 className="font-semibold text-red-900">Average Expenses</h3>
            </div>
            <p className="text-2xl font-bold text-red-700 mt-2">
              {trendsData && formatCurrency(trendsData.reduce((sum: number, item: any) => sum + item.expenses, 0) / trendsData.length)}
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-200 shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div className="flex items-center">
              <div className="w-4 h-4 bg-purple-500 rounded-full mr-3 shadow-sm"></div>
              <h3 className="font-semibold text-purple-900">Average Savings</h3>
            </div>
            <p className="text-2xl font-bold text-purple-700 mt-2">
              {trendsData && formatCurrency(trendsData.reduce((sum: number, item: any) => sum + item.savings, 0) / trendsData.length)}
            </p>
          </motion.div>
        </div>
      </CardContent>
    </Card>
    </motion.div>
  );
}