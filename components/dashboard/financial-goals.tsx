import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Target, Plus, TrendingUp, Calendar, DollarSign, CheckCircle } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { motion } from "framer-motion";

const goalSchema = z.object({
  title: z.string().min(1, "Goal title is required"),
  targetAmount: z.number().positive("Target amount must be positive"),
  currentAmount: z.number().min(0, "Current amount cannot be negative"),
  targetDate: z.string().min(1, "Target date is required"),
  category: z.enum(["savings", "emergency", "investment", "purchase", "debt", "other"]),
  description: z.string().optional(),
});

type Goal = z.infer<typeof goalSchema> & { _id: string; createdAt: Date };

export function FinancialGoals() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock data for demonstration - in real app this would come from an API
  const mockGoals: Goal[] = [
    {
      _id: "1",
      title: "Emergency Fund",
      targetAmount: 10000,
      currentAmount: 3500,
      targetDate: "2025-12-31",
      category: "emergency",
      description: "6 months of expenses",
      createdAt: new Date("2025-01-01")
    },
    {
      _id: "2", 
      title: "Vacation to Europe",
      targetAmount: 5000,
      currentAmount: 1200,
      targetDate: "2025-08-15",
      category: "purchase",
      description: "Summer vacation trip",
      createdAt: new Date("2025-02-01")
    },
    {
      _id: "3",
      title: "Investment Portfolio",
      targetAmount: 25000,
      currentAmount: 8750,
      targetDate: "2026-01-01",
      category: "investment",
      description: "Long-term wealth building",
      createdAt: new Date("2025-01-15")
    }
  ];

  const form = useForm<z.infer<typeof goalSchema>>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: "",
      targetAmount: 0,
      currentAmount: 0,
      targetDate: "",
      category: "savings",
      description: "",
    },
  });

  const addGoalMutation = useMutation({
    mutationFn: (data: z.infer<typeof goalSchema>) => {
      // Mock API call - in real app this would be: apiRequest("POST", "/api/goals", data)
      return Promise.resolve({ ...data, _id: Date.now().toString(), createdAt: new Date() });
    },
    onSuccess: () => {
      toast({
        title: "Goal Created",
        description: "Your financial goal has been added successfully!",
      });
      form.reset();
      setIsAddDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
    },
  });

  const onSubmit = (data: z.infer<typeof goalSchema>) => {
    addGoalMutation.mutate(data);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'emergency': return '🚨';
      case 'savings': return '💰';
      case 'investment': return '📈';
      case 'purchase': return '🛍️';
      case 'debt': return '💳';
      default: return '🎯';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'savings': return 'bg-green-100 text-green-800';
      case 'investment': return 'bg-blue-100 text-blue-800';
      case 'purchase': return 'bg-purple-100 text-purple-800';
      case 'debt': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getDaysRemaining = (targetDate: string) => {
    const target = new Date(targetDate);
    const today = new Date();
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Financial Goals
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Financial Goal</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Goal Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Emergency Fund" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="targetAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Amount</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="10000"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="currentAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Amount</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select goal type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="savings">💰 Savings</SelectItem>
                            <SelectItem value="emergency">🚨 Emergency Fund</SelectItem>
                            <SelectItem value="investment">📈 Investment</SelectItem>
                            <SelectItem value="purchase">🛍️ Purchase</SelectItem>
                            <SelectItem value="debt">💳 Debt Payoff</SelectItem>
                            <SelectItem value="other">🎯 Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="targetDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Goal description..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1" disabled={addGoalMutation.isPending}>
                      {addGoalMutation.isPending ? "Creating..." : "Create Goal"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {mockGoals.length === 0 ? (
          <div className="text-center py-8">
            <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-4">No financial goals set yet</p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              Set Your First Goal
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {mockGoals.map((goal, index) => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100;
              const daysRemaining = getDaysRemaining(goal.targetDate);
              const isCompleted = progress >= 100;
              
              return (
                <motion.div
                  key={goal._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getCategoryIcon(goal.category)}</span>
                      <div>
                        <h4 className="font-semibold flex items-center gap-2">
                          {goal.title}
                          {isCompleted && <CheckCircle className="h-4 w-4 text-green-600" />}
                        </h4>
                        {goal.description && (
                          <p className="text-sm text-gray-600">{goal.description}</p>
                        )}
                      </div>
                    </div>
                    <Badge className={getCategoryColor(goal.category)}>
                      {goal.category}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}
                      </span>
                      <span className="text-sm font-bold">
                        {progress.toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(progress, 100)} 
                      className="h-2"
                    />
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {daysRemaining > 0 ? `${daysRemaining} days left` : 'Overdue'}
                      </span>
                      <span>
                        {formatCurrency(goal.targetAmount - goal.currentAmount)} remaining
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}