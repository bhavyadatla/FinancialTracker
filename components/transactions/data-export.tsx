import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Download, FileText, Table, CalendarIcon, Filter } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { type Category, type TransactionWithCategory } from "@shared/mongodb-types";

interface ExportFilters {
  startDate?: Date;
  endDate?: Date;
  categoryId?: string;
  type?: 'income' | 'expense';
}

export function DataExport() {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<ExportFilters>({});
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: transactions = [] } = useQuery<TransactionWithCategory[]>({
    queryKey: ["/api/transactions"],
  });

  const exportToCSV = async (data: TransactionWithCategory[]) => {
    const csvHeaders = ['Date', 'Description', 'Amount', 'Type', 'Category'];
    const csvRows = data.map(transaction => [
      format(new Date(transaction.date), 'yyyy-MM-dd'),
      transaction.description,
      transaction.amount.toString(),
      transaction.type,
      transaction.category.name
    ]);

    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = async (data: TransactionWithCategory[]) => {
    const exportData = {
      exportDate: new Date().toISOString(),
      filters: filters,
      totalTransactions: data.length,
      summary: {
        totalIncome: data.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
        totalExpenses: data.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
      },
      transactions: data
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${format(new Date(), 'yyyy-MM-dd')}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFilteredTransactions = () => {
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      
      if (filters.startDate && transactionDate < filters.startDate) return false;
      if (filters.endDate && transactionDate > filters.endDate) return false;
      if (filters.categoryId && transaction.categoryId !== filters.categoryId) return false;
      if (filters.type && transaction.type !== filters.type) return false;
      
      return true;
    });
  };

  const handleExport = async (format: 'csv' | 'json') => {
    setIsExporting(true);
    try {
      const filteredData = getFilteredTransactions();
      
      if (filteredData.length === 0) {
        toast({
          title: "No Data",
          description: "No transactions match your filter criteria.",
          variant: "destructive",
        });
        return;
      }

      if (format === 'csv') {
        await exportToCSV(filteredData);
      } else {
        await exportToJSON(filteredData);
      }

      toast({
        title: "Export Successful",
        description: `${filteredData.length} transactions exported to ${format.toUpperCase()}`,
      });
      
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your data.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const filteredCount = getFilteredTransactions().length;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Transactions
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Export Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date Range */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !filters.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-3 w-3" />
                        {filters.startDate ? format(filters.startDate, "MMM dd") : "From"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.startDate}
                        onSelect={(date) => setFilters(prev => ({ ...prev, startDate: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !filters.endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-3 w-3" />
                        {filters.endDate ? format(filters.endDate, "MMM dd") : "To"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.endDate}
                        onSelect={(date) => setFilters(prev => ({ ...prev, endDate: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <Label className="text-xs">Category</Label>
                <Select 
                  value={filters.categoryId || "all"} 
                  onValueChange={(value) => setFilters(prev => ({ 
                    ...prev, 
                    categoryId: value === "all" ? undefined : value 
                  }))}
                >
                  <SelectTrigger className="h-8">
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

              {/* Type Filter */}
              <div className="space-y-2">
                <Label className="text-xs">Transaction Type</Label>
                <Select 
                  value={filters.type || "all"} 
                  onValueChange={(value) => setFilters(prev => ({ 
                    ...prev, 
                    type: value === "all" ? undefined : value as 'income' | 'expense'
                  }))}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="income">Income Only</SelectItem>
                    <SelectItem value="expense">Expenses Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Preview Count */}
              <div className="text-center py-2 bg-gray-50 rounded text-sm">
                <span className="font-medium">{filteredCount}</span> transactions will be exported
              </div>
            </CardContent>
          </Card>

          {/* Export Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => handleExport('csv')}
              disabled={isExporting || filteredCount === 0}
              className="w-full flex items-center gap-2"
            >
              <Table className="h-4 w-4" />
              {isExporting ? "Exporting..." : "Export as CSV"}
            </Button>
            
            <Button
              onClick={() => handleExport('json')}
              disabled={isExporting || filteredCount === 0}
              variant="outline"
              className="w-full flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              {isExporting ? "Exporting..." : "Export as JSON"}
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            CSV format is compatible with Excel and Google Sheets.<br />
            JSON format includes additional metadata and summary statistics.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}