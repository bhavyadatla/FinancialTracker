import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/currency";
import { motion } from "framer-motion";

export function SummaryCards() {
  const { data: summaryStats, isLoading } = useQuery({
    queryKey: ["/api/analytics/summary"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!summaryStats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            No data available
          </CardContent>
        </Card>
      </div>
    );
  }

  const cards = [
    {
      title: "Total Balance",
      value: formatCurrency(summaryStats.totalBalance),
      icon: "fas fa-wallet",
      iconBg: "bg-gradient-to-r from-green-100 to-emerald-100",
      iconColor: "text-green-600",
      change: "+12.5%",
      changeColor: "text-green-500",
      changeIcon: "fas fa-arrow-up",
      bgGradient: "bg-gradient-to-br from-green-50 to-emerald-50",
    },
    {
      title: "Monthly Income",
      value: formatCurrency(summaryStats.monthlyIncome),
      icon: "fas fa-arrow-down",
      iconBg: "bg-gradient-to-r from-blue-100 to-indigo-100",
      iconColor: "text-blue-600",
      change: "+8.2%",
      changeColor: "text-green-500",
      changeIcon: "fas fa-arrow-up",
      bgGradient: "bg-gradient-to-br from-blue-50 to-indigo-50",
    },
    {
      title: "Monthly Expenses",
      value: formatCurrency(summaryStats.monthlyExpenses),
      icon: "fas fa-arrow-up",
      iconBg: "bg-gradient-to-r from-red-100 to-rose-100",
      iconColor: "text-red-600",
      change: "+5.4%",
      changeColor: "text-red-500",
      changeIcon: "fas fa-arrow-up",
      bgGradient: "bg-gradient-to-br from-red-50 to-rose-50",
    },
    {
      title: "Savings Rate",
      value: `${summaryStats.savingsRate.toFixed(1)}%`,
      icon: "fas fa-piggy-bank",
      iconBg: "bg-gradient-to-r from-purple-100 to-violet-100",
      iconColor: "text-purple-600",
      change: "+2.1%",
      changeColor: "text-green-500",
      changeIcon: "fas fa-arrow-up",
      bgGradient: "bg-gradient-to-br from-purple-50 to-violet-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          whileHover={{ scale: 1.02 }}
          className="cursor-pointer"
        >
          <Card className={`${card.bgGradient} p-6 rounded-xl border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300`}>
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{card.title}</p>
                  <p className="text-2xl font-bold text-slate-800">{card.value}</p>
                </div>
                <div className={`p-3 ${card.iconBg} rounded-full shadow-md`}>
                  <i className={`${card.icon} ${card.iconColor} text-lg`}></i>
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <i className={`${card.changeIcon} ${card.changeColor} mr-1`}></i>
                <span className={`${card.changeColor} font-medium`}>{card.change}</span>
                <span className="text-slate-600 ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
