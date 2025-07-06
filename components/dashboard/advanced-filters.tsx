'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useState } from 'react';

interface FilterState {
  category: string;
  type: string;
  startDate: string;
  endDate: string;
  minAmount: string;
  maxAmount: string;
}

interface AdvancedFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  onExport: (format: 'json' | 'csv') => void;
}

export function AdvancedFilters({ onFilterChange, onExport }: AdvancedFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    category: '',
    type: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
  });

  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
  });

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters: FilterState = {
      category: '',
      type: '',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value !== '').length;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Advanced Filters</CardTitle>
          <div className="flex gap-2">
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary">
                {getActiveFiltersCount()} active
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories?.map((category: any) => (
                  <SelectItem key={category._id} value={category._id}>
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: category.color }}
                      ></div>
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Transaction Type</Label>
            <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="minAmount">Min Amount ($)</Label>
            <Input
              id="minAmount"
              type="number"
              placeholder="0"
              value={filters.minAmount}
              onChange={(e) => handleFilterChange('minAmount', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxAmount">Max Amount ($)</Label>
            <Input
              id="maxAmount"
              type="number"
              placeholder="10000"
              value={filters.maxAmount}
              onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
            />
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Data Export</h3>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onExport('json')}
                className="flex items-center gap-2"
              >
                <i className="fas fa-download"></i>
                Export JSON
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onExport('csv')}
                className="flex items-center gap-2"
              >
                <i className="fas fa-file-csv"></i>
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}