import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: "fas fa-tachometer-alt" },
    { href: "/transactions", label: "Transactions", icon: "fas fa-exchange-alt" },
    { href: "/categories", label: "Categories", icon: "fas fa-tags" },
    { href: "/budget", label: "Budget", icon: "fas fa-wallet" },
    { href: "/reports", label: "Reports", icon: "fas fa-chart-pie" },
  ];

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-slate-200">
      <div className="flex items-center h-16 px-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <i className="fas fa-chart-line text-primary-foreground text-sm"></i>
          </div>
          <h1 className="text-xl font-bold text-slate-800">FinanceTracker</h1>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <a
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                location === item.href
                  ? "text-primary bg-blue-50"
                  : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"
              )}
            >
              <i className={`${item.icon} w-5 h-5 mr-3`}></i>
              {item.label}
            </a>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
