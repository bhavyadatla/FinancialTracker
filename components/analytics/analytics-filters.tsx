'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar, Filter, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export type TimeFilter = 'this-month' | 'last-month' | 'last-3-months' | 'last-6-months' | 'this-year' | 'all';

interface AnalyticsFiltersProps {
  onTimeFilterChange: (filter: TimeFilter) => void;
  currentFilter: TimeFilter;
}

export function AnalyticsFilters({ onTimeFilterChange, currentFilter }: AnalyticsFiltersProps) {
  const timeFilterOptions = [
    { value: 'this-month', label: 'This Month', icon: 'fas fa-calendar-day' },
    { value: 'last-month', label: 'Last Month', icon: 'fas fa-calendar-minus' },
    { value: 'last-3-months', label: 'Last 3 Months', icon: 'fas fa-calendar-alt' },
    { value: 'last-6-months', label: 'Last 6 Months', icon: 'fas fa-calendar' },
    { value: 'this-year', label: 'This Year', icon: 'fas fa-calendar-year' },
    { value: 'all', label: 'All Time', icon: 'fas fa-infinity' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-600" />
            Analytics Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Calendar className="w-4 h-4 text-slate-500" />
              <Select value={currentFilter} onValueChange={onTimeFilterChange}>
                <SelectTrigger className="w-44 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeFilterOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <i className={`${option.icon} text-sm text-slate-500`}></i>
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              className="bg-white border-slate-300 hover:bg-slate-50 text-slate-700"
              onClick={() => onTimeFilterChange('this-month')}
            >
              <TrendingUp className="w-4 h-4 mr-1" />
              Quick: This Month
            </Button>
          </div>
          
          <div className="mt-3 text-xs text-slate-500">
            Filter your financial analytics by time period to get detailed insights
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}