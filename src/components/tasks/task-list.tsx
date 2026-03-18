"use client";

import React from "react";
import {
  Play,
  Pause,
  Trash2,
  RotateCcw,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  MoreVertical,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, getStatusBg, parseCronExpression } from "@/lib/utils";
import type { Task } from "@/types";

interface TaskListProps {
  tasks: Task[];
  onSelect?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onRetry?: (taskId: string) => void;
  onPause?: (taskId: string) => void;
  onResume?: (taskId: string) => void;
}

const statusIcons: Record<string, React.ReactNode> = {
  completed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  failed: <XCircle className="h-4 w-4 text-red-500" />,
  running: <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />,
  pending: <Clock className="h-4 w-4 text-yellow-500" />,
  paused: <Pause className="h-4 w-4 text-gray-400" />,
  cancelled: <XCircle className="h-4 w-4 text-gray-400" />,
};

export function TaskList({ tasks, onSelect, onDelete, onRetry, onPause, onResume }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 rounded-full bg-muted p-4">
          <ListIcon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">No tasks yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Create your first task using natural language above
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <Card
          key={task.id}
          className="cursor-pointer transition-colors hover:bg-accent/50"
          onClick={() => onSelect?.(task)}
        >
          <CardContent className="flex items-center gap-4 p-4">
            <div className="shrink-0">{statusIcons[task.status] || statusIcons.pending}</div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="truncate font-medium">{task.title}</h4>
                <Badge variant="outline" className={getStatusBg(task.status)}>
                  {task.status}
                </Badge>
              </div>
              <p className="mt-0.5 truncate text-sm text-muted-foreground">{task.description}</p>
              <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                {task.cron_expression && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {parseCronExpression(task.cron_expression)}
                  </span>
                )}
                {task.last_run_at && (
                  <span>Last run: {formatDate(task.last_run_at)}</span>
                )}
                {task.next_run_at && (
                  <span>Next: {formatDate(task.next_run_at)}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {task.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex shrink-0 items-center gap-1" onClick={(e) => e.stopPropagation()}>
              {task.status === "failed" && onRetry && (
                <Button variant="ghost" size="icon" onClick={() => onRetry(task.id)} title="Retry">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
              {task.status === "running" && onPause && (
                <Button variant="ghost" size="icon" onClick={() => onPause(task.id)} title="Pause">
                  <Pause className="h-4 w-4" />
                </Button>
              )}
              {task.status === "paused" && onResume && (
                <Button variant="ghost" size="icon" onClick={() => onResume(task.id)} title="Resume">
                  <Play className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button variant="ghost" size="icon" onClick={() => onDelete(task.id)} title="Delete">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ListIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  );
}
