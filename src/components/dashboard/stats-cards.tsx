"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  ListTodo,
  CheckCircle2,
  XCircle,
  Zap,
  GitBranch,
  Bell,
  TrendingUp,
  Activity,
} from "lucide-react";
import type { DashboardStats } from "@/types";

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      label: "Total Tasks",
      value: stats.total_tasks,
      icon: ListTodo,
      color: "text-hive-500",
      bg: "bg-hive-500/10",
    },
    {
      label: "Active Tasks",
      value: stats.active_tasks,
      icon: Activity,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Completed Today",
      value: stats.completed_today,
      icon: CheckCircle2,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      label: "Failed Today",
      value: stats.failed_today,
      icon: XCircle,
      color: "text-red-500",
      bg: "bg-red-500/10",
    },
    {
      label: "Success Rate",
      value: `${stats.success_rate}%`,
      icon: TrendingUp,
      color: "text-honey-500",
      bg: "bg-honey-500/10",
    },
    {
      label: "Active Workflows",
      value: stats.active_workflows,
      icon: GitBranch,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      label: "Integrations",
      value: 6,
      icon: Zap,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      label: "Notifications",
      value: stats.unread_notifications,
      icon: Bell,
      color: "text-pink-500",
      bg: "bg-pink-500/10",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="flex items-center gap-4 p-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.bg}`}>
              <card.icon className={`h-6 w-6 ${card.color}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className="text-2xl font-bold">{card.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
