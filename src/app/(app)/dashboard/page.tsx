"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { TaskInput } from "@/components/tasks/task-input";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { UpcomingTasks } from "@/components/dashboard/upcoming-tasks";
import type { DashboardStats } from "@/types";

const defaultStats: DashboardStats = {
  total_tasks: 0,
  active_tasks: 0,
  completed_today: 0,
  failed_today: 0,
  success_rate: 100,
  upcoming_runs: [],
  recent_runs: [],
  active_workflows: 0,
  unread_notifications: 0,
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      if (json.data) setStats(json.data);
    } catch {
      // Use defaults
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleTaskInput = async (input: string) => {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ natural_language_input: input }),
    });

    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.error || "Failed to create task");
    }

    // Refresh stats
    fetchStats();
  };

  return (
    <div>
      <Header title="Dashboard" description="Your automation command center" />
      <div className="space-y-6 p-6">
        <TaskInput onSubmit={handleTaskInput} />
        <StatsCards stats={stats} />
        <div className="grid gap-6 lg:grid-cols-2">
          <RecentActivity runs={stats.recent_runs} />
          <UpcomingTasks tasks={stats.upcoming_runs} />
        </div>
      </div>
    </div>
  );
}
