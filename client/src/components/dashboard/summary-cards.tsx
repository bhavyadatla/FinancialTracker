import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

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

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

  const cards = [
    {
      title: "Total Balance",
      value: formatCurrency(summaryStats.totalBalance),
      icon: "fas fa-wallet",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      change: "+12.5%",
      changeColor: "text-green-500",
      changeIcon: "fas fa-arrow-up",
    },
    {
      title: "Monthly Income",
      value: formatCurrency(summaryStats.monthlyIncome),
      icon: "fas fa-arrow-down",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      change: "+8.2%",
      changeColor: "text-green-500",
      changeIcon: "fas fa-arrow-up",
    },
    {
      title: "Monthly Expenses",
      value: formatCurrency(summaryStats.monthlyExpenses),
      icon: "fas fa-arrow-up",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      change: "+5.4%",
      changeColor: "text-red-500",
      changeIcon: "fas fa-arrow-up",
    },
    {
      title: "Savings Rate",
      value: `${summaryStats.savingsRate.toFixed(1)}%`,
      icon: "fas fa-piggy-bank",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      change: "+2.1%",
      changeColor: "text-green-500",
      changeIcon: "fas fa-arrow-up",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <Card key={index} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{card.title}</p>
                <p className="text-2xl font-bold text-slate-800">{card.value}</p>
              </div>
              <div className={`p-3 ${card.iconBg} rounded-full`}>
                <i className={`${card.icon} ${card.iconColor}`}></i>
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <i className={`${card.changeIcon} ${card.changeColor} mr-1`}></i>
              <span className={`${card.changeColor} font-medium`}>{card.change}</span>
              <span className="text-slate-600 ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
