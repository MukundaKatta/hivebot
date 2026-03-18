"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Calendar } from "lucide-react";
import { formatDate, parseCronExpression } from "@/lib/utils";
import type { Task } from "@/types";

interface UpcomingTasksProps {
  tasks: Task[];
}

export function UpcomingTasks({ tasks }: UpcomingTasksProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Upcoming Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Calendar className="mb-2 h-6 w-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No upcoming tasks</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-hive-500/10">
                    <Clock className="h-4 w-4 text-hive-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{task.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {task.next_run_at && <span>{formatDate(task.next_run_at)}</span>}
                      {task.cron_expression && (
                        <Badge variant="outline" className="text-[10px]">
                          {parseCronExpression(task.cron_expression)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
