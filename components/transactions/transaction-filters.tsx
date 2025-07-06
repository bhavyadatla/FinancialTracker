import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, FilterIcon, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { type Category } from "@shared/mongodb-types";

interface TransactionFiltersProps {
  onFiltersChange: (filters: TransactionFilters) => void;
  className?: string;
}

export interface TransactionFilters {
  search?: string;
  categoryId?: string;
  type?: 'income' | 'expense';
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
}

export function TransactionFilters({ onFiltersChange, className }: TransactionFiltersProps) {
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [isOpen, setIsOpen] = useState(false);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const updateFilters = (newFilters: Partial<TransactionFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== null && value !== ""
  );

  return (
    <Card className={cn("mb-6", className)}>
      <CardHeader 
        className="cursor-pointer" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <FilterIcon className="h-5 w-5" />
            Filter Transactions
            {hasActiveFilters && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                Active
              </span>
            )}
          </div>
          <Button variant="ghost" size="sm">
            {isOpen ? "Hide" : "Show"} Filters
          </Button>
        </CardTitle>
      </CardHeader>
      
      {isOpen && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label>Search Description</Label>
              <Input
                placeholder="Search transactions..."
                value={filters.search || ""}
                onChange={(e) => updateFilters({ search: e.target.value })}
              />
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select 
                value={filters.categoryId || "all"} 
                onValueChange={(value) => updateFilters({ categoryId: value === "all" ? undefined : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Transaction Type */}
            <div className="space-y-2">
              <Label>Type</Label>
              <Select 
                value={filters.type || "all"} 
                onValueChange={(value) => updateFilters({ type: value === "all" ? undefined : value as 'income' | 'expense' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amount Range */}
            <div className="space-y-2">
              <Label>Min Amount</Label>
              <Input
                type="number"
                placeholder="0"
                value={filters.minAmount || ""}
                onChange={(e) => updateFilters({ minAmount: e.target.value ? parseFloat(e.target.value) : undefined })}
              />
            </div>

            <div className="space-y-2">
              <Label>Max Amount</Label>
              <Input
                type="number"
                placeholder="No limit"
                value={filters.maxAmount || ""}
                onChange={(e) => updateFilters({ maxAmount: e.target.value ? parseFloat(e.target.value) : undefined })}
              />
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.startDate ? format(filters.startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.startDate}
                    onSelect={(date) => updateFilters({ startDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button onClick={clearFilters} variant="outline" className="flex items-center gap-2">
              <X className="h-4 w-4" />
              Clear All Filters
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}