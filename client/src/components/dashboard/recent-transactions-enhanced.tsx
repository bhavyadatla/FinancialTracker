import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";

export function RecentTransactions() {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ["/api/transactions"],
  });

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
  };

  const recentTransactions = transactions?.slice(0, 8) || [];

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
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse rounded"></div>
                    <div className="h-3 bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse rounded w-1/2"></div>
                  </div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse rounded w-20"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
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
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Recent Transactions
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">Your latest financial activity</p>
          </div>
          <Link href="/transactions">
            <Button 
              variant="outline" 
              size="sm"
              className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-indigo-100"
            >
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <i className="fas fa-receipt text-4xl mb-4 text-gray-300"></i>
              <h3 className="text-lg font-semibold mb-2">No transactions yet</h3>
              <p className="text-sm mb-4">Start by adding your first transaction</p>
              <Link href="/transactions">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  Add Transaction
                </Button>
              </Link>
            </div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-3"
            >
              {recentTransactions.map((transaction: any, index: number) => (
                <motion.div
                  key={transaction._id}
                  variants={itemVariants}
                  className="group flex items-center justify-between p-3 rounded-lg hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-200 cursor-pointer border border-transparent hover:border-blue-100"
                >
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md group-hover:shadow-lg transition-shadow"
                      style={{ 
                        background: transaction.category?.color 
                          ? `linear-gradient(135deg, ${transaction.category.color}, ${transaction.category.color}dd)` 
                          : 'linear-gradient(135deg, #64748b, #475569)'
                      }}
                    >
                      <i className={`${transaction.category?.icon || 'fas fa-circle'} text-sm`}></i>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-800 group-hover:text-gray-900 transition-colors truncate">
                        {transaction.description}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>{transaction.category?.name || 'Uncategorized'}</span>
                        <span>•</span>
                        <span>{formatDate(transaction.date)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div 
                      className={`font-bold text-lg ${
                        transaction.type === 'income' 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </div>
                    <div className={`text-xs ${
                      transaction.type === 'income' 
                        ? 'text-green-500' 
                        : 'text-red-500'
                    }`}>
                      {transaction.type === 'income' ? 'Income' : 'Expense'}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}