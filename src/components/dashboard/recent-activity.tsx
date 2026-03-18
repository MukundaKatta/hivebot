"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, XCircle, Loader2, Clock } from "lucide-react";
import { formatDate, getStatusBg } from "@/lib/utils";
import type { TaskRun } from "@/types";

interface RecentActivityProps {
  runs: TaskRun[];
}

export function RecentActivity({ runs }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {runs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Clock className="mb-2 h-6 w-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {runs.map((run) => (
                <div key={run.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <div className="shrink-0">
                    {run.status === "completed" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                    {run.status === "failed" && <XCircle className="h-4 w-4 text-red-500" />}
                    {run.status === "running" && <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />}
                    {run.status === "pending" && <Clock className="h-4 w-4 text-yellow-500" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">Task Run</p>
                    <p className="text-xs text-muted-foreground">{formatDate(run.created_at)}</p>
                  </div>
                  <Badge className={getStatusBg(run.status)} variant="outline">
                    {run.status}
                  </Badge>
                  {run.duration_ms && (
                    <span className="text-xs text-muted-foreground">{(run.duration_ms / 1000).toFixed(1)}s</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
