'use client';

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface FilterState {
  category: string;
  type: string;
  startDate: string;
  endDate: string;
  minAmount: string;
  maxAmount: string;
}

interface TransactionsTableProps {
  filters: FilterState;
}

export function TransactionsTable({ filters }: TransactionsTableProps) {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['/api/transactions/filter', filters],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.minAmount) queryParams.append('minAmount', filters.minAmount);
      if (filters.maxAmount) queryParams.append('maxAmount', filters.maxAmount);
      
      const response = await fetch(`/api/transactions/filter?${queryParams}`);
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

  const getTypeColor = (type: string) => {
    return type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const totalAmount = transactions?.reduce((sum: number, t: any) => 
    t.type === 'income' ? sum + t.amount : sum - t.amount, 0) || 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-semibold">
            Filtered Transactions
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            {transactions?.length || 0} transactions found
            {totalAmount !== 0 && (
              <span className={`ml-2 font-medium ${totalAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                Net: {formatCurrency(totalAmount)}
              </span>
            )}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        {!transactions || transactions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <i className="fas fa-search text-4xl mb-4"></i>
            <h3 className="text-lg font-semibold mb-2">No transactions found</h3>
            <p className="text-sm">Try adjusting your filters or add some transactions</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="space-y-2">
              {transactions.map((transaction: any) => (
                <div
                  key={transaction._id}
                  className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: transaction.category.color }}
                    ></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {transaction.description}
                        </h3>
                        <Badge 
                          variant="secondary"
                          className={getTypeColor(transaction.type)}
                        >
                          {transaction.type}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                        <span className="flex items-center">
                          <i className={`${transaction.category.icon} mr-1`}></i>
                          {transaction.category.name}
                        </span>
                        <span className="flex items-center">
                          <i className="fas fa-calendar mr-1"></i>
                          {format(new Date(transaction.date), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right flex-shrink-0">
                    <div className={`text-lg font-bold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}