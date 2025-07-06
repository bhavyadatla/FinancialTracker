import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: "fas fa-tachometer-alt" },
    { href: "/transactions", label: "Transactions", icon: "fas fa-exchange-alt" },
    { href: "/categories", label: "Categories", icon: "fas fa-tags" },
    { href: "/budget", label: "Budget", icon: "fas fa-wallet" },
    { href: "/reports", label: "Reports", icon: "fas fa-chart-pie" },
  ];

  if (!isOpen) return null;

  return (
    <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40">
      <div className="bg-white w-64 h-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center h-16 px-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <i className="fas fa-chart-line text-primary-foreground text-sm"></i>
            </div>
            <h1 className="text-xl font-bold text-slate-800">FinanceTracker</h1>
          </div>
        </div>
        
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <a
                onClick={onClose}
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
      </div>
    </div>
  );
}
