import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { EditTransactionModal } from "@/components/transactions/edit-transaction-modal";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { TransactionWithCategory } from "@shared/schema";

export function RecentTransactions() {
  const [editingTransaction, setEditingTransaction] = useState<TransactionWithCategory | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["/api/transactions"],
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/transactions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/summary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/monthly-expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/category-expenses"] });
      toast({
        title: "Success",
        description: "Transaction deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete transaction",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      deleteTransactionMutation.mutate(id);
    }
  };

  const getCategoryIcon = (categoryName: string) => {
    const iconMap: { [key: string]: string } = {
      "Food & Dining": "fas fa-utensils",
      "Transportation": "fas fa-car",
      "Housing": "fas fa-home",
      "Entertainment": "fas fa-gamepad",
      "Shopping": "fas fa-shopping-bag",
      "Income": "fas fa-money-bill",
      "Healthcare": "fas fa-heartbeat",
      "Other": "fas fa-ellipsis-h",
    };
    return iconMap[categoryName] || "fas fa-ellipsis-h";
  };

  const getCategoryColor = (categoryName: string) => {
    const colorMap: { [key: string]: string } = {
      "Food & Dining": "bg-orange-100 text-orange-800",
      "Transportation": "bg-yellow-100 text-yellow-800",
      "Housing": "bg-purple-100 text-purple-800",
      "Entertainment": "bg-blue-100 text-blue-800",
      "Shopping": "bg-red-100 text-red-800",
      "Income": "bg-green-100 text-green-800",
      "Healthcare": "bg-cyan-100 text-cyan-800",
      "Other": "bg-gray-100 text-gray-800",
    };
    return colorMap[categoryName] || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <Card className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 animate-pulse rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentTransactions = Array.isArray(transactions) ? transactions.slice(0, 5) : [];

  return (
    <>
      <Card className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-slate-800">Recent Transactions</CardTitle>
            <a href="/transactions" className="text-primary font-medium text-sm hover:text-blue-700">
              View all
            </a>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {recentTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {recentTransactions.map((transaction) => (
                    <tr key={transaction._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <i className={`${getCategoryIcon(transaction.category.name)} text-blue-600 text-xs`}></i>
                          </div>
                          <span className="text-sm font-medium text-slate-800">
                            {transaction.description}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(transaction.category.name)}`}>
                          {transaction.category.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {new Date(transaction.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                          {transaction.type === 'income' ? '+' : '-'}${parseFloat(transaction.amount).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-400 hover:text-slate-600 mr-2"
                          onClick={() => setEditingTransaction(transaction)}
                        >
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-400 hover:text-red-600"
                          onClick={() => handleDelete(transaction._id)}
                          disabled={deleteTransactionMutation.isPending}
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              No transactions found. Add your first transaction to get started!
            </div>
          )}
        </CardContent>
      </Card>

      {editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          open={!!editingTransaction}
          onOpenChange={(open) => !open && setEditingTransaction(null)}
        />
      )}
    </>
  );
}
