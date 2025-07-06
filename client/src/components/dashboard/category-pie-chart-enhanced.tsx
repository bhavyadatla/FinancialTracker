import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import { TimeFilter, type TimeFilterType, getDateRangeFromFilter } from "@/components/analytics/time-filter";

export function CategoryPieChart() {
  const [timeFilter, setTimeFilter] = useState<TimeFilterType>('1-month');

  const { data: categoryData, isLoading } = useQuery({
    queryKey: ["/api/analytics/category-expenses", timeFilter],
    queryFn: () => {
      const { start, end } = getDateRangeFromFilter(timeFilter);
      return fetch(`/api/analytics/category-expenses?startDate=${start.toISOString()}&endDate=${end.toISOString()}`).then(res => res.json());
    },
  });

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
          <CardHeader>
            <CardTitle className="text-xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Expenses by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse rounded-lg"></div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent
  }: any) => {
    if (percent < 0.05) return null; // Don't show labels for very small slices
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-semibold drop-shadow-lg"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const renderCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800">{data.category}</p>
          <p className="text-sm text-gray-600">
            Amount: <span className="font-medium text-gray-800">{formatCurrency(data.amount)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const totalAmount = categoryData?.reduce((sum: number, item: any) => sum + item.amount, 0) || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Expenses by Category
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Total: {formatCurrency(totalAmount)}
              </p>
            </div>
            <div className="w-48">
              <TimeFilter 
                value={timeFilter} 
                onChange={setTimeFilter}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {!categoryData || categoryData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <i className="fas fa-chart-pie text-4xl mb-4"></i>
                  <h3 className="text-lg font-semibold mb-2">No expense data available</h3>
                  <p className="text-sm">Try selecting a different time range or add some transactions</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    {categoryData.map((entry: any, index: number) => (
                      <linearGradient key={index} id={`gradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="5%" stopColor={entry.color} stopOpacity={0.9}/>
                        <stop offset="95%" stopColor={entry.color} stopOpacity={0.7}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={100}
                    innerRadius={40}
                    fill="#8884d8"
                    dataKey="amount"
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {categoryData.map((entry: any, index: number) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`url(#gradient-${index})`}
                        stroke={entry.color}
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={renderCustomTooltip} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value, entry: any) => (
                      <span className="text-sm text-gray-700 font-medium">
                        {value} - {formatCurrency(entry.payload.amount)}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}