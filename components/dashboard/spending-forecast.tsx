'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState } from 'react';

export function SpendingForecast() {
  const [forecastPeriod, setForecastPeriod] = useState('3');
  
  const { data: forecastData, isLoading } = useQuery({
    queryKey: ['/api/analytics/forecast', forecastPeriod],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/forecast?months=${forecastPeriod}`);
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] bg-gray-100 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-semibold">Spending Forecast</CardTitle>
          <p className="text-sm text-gray-600 mt-1">AI-powered expense predictions</p>
        </div>
        <Select value={forecastPeriod} onValueChange={setForecastPeriod}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">3 Months</SelectItem>
            <SelectItem value="6">6 Months</SelectItem>
            <SelectItem value="12">12 Months</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecastData}>
              <defs>
                <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                stroke="#64748b"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#64748b"
                tickFormatter={formatCurrency}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  formatCurrency(value), 
                  name === 'predicted' ? 'Predicted Expenses' : name
                ]}
                labelStyle={{ color: '#1e293b' }}
                contentStyle={{ 
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="predicted" 
                stroke="#3b82f6" 
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#forecastGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900">Next Month Prediction</h3>
            <p className="text-2xl font-bold text-blue-700 mt-2">
              {forecastData && forecastData[0] && formatCurrency(forecastData[0].predicted)}
            </p>
            <p className="text-sm text-blue-600 mt-1">
              Confidence: {forecastData && forecastData[0] && (forecastData[0].confidence * 100).toFixed(0)}%
            </p>
          </div>
          
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="font-semibold text-indigo-900">Average Monthly Prediction</h3>
            <p className="text-2xl font-bold text-indigo-700 mt-2">
              {forecastData && formatCurrency(forecastData.reduce((sum: number, item: any) => sum + item.predicted, 0) / forecastData.length)}
            </p>
            <p className="text-sm text-indigo-600 mt-1">
              Based on historical patterns
            </p>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-center">
            <i className="fas fa-info-circle text-amber-600 mr-2"></i>
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> Forecasts are based on historical spending patterns and may not account for unexpected expenses or income changes.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}