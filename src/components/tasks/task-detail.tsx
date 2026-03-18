"use client";

import React, { useEffect, useState } from "react";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  RotateCcw,
  Play,
  Pause,
  AlertCircle,
  Info,
  Bug,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { formatDate, getStatusBg } from "@/lib/utils";
import type { Task, TaskRun, TaskLog } from "@/types";

interface TaskDetailProps {
  task: Task;
  runs: TaskRun[];
  onRetry?: (taskId: string, runId: string) => void;
  onClose?: () => void;
}

const logLevelIcons = {
  info: <Info className="h-3.5 w-3.5 text-blue-500" />,
  warn: <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />,
  error: <AlertCircle className="h-3.5 w-3.5 text-red-500" />,
  debug: <Bug className="h-3.5 w-3.5 text-gray-500" />,
};

export function TaskDetail({ task, runs, onRetry, onClose }: TaskDetailProps) {
  return (
    <div className="space-y-6">
      {/* Task Header */}
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">{task.title}</h3>
          <Badge className={getStatusBg(task.status)}>{task.status}</Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
        {task.natural_language_input && (
          <p className="mt-2 rounded-md bg-muted/50 p-3 text-sm italic text-muted-foreground">
            &ldquo;{task.natural_language_input}&rdquo;
          </p>
        )}
      </div>

      {/* Task Info Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <InfoCard label="Schedule" value={task.cron_expression || "One-time"} />
        <InfoCard label="Last Run" value={task.last_run_at ? formatDate(task.last_run_at) : "Never"} />
        <InfoCard label="Next Run" value={task.next_run_at ? formatDate(task.next_run_at) : "N/A"} />
        <InfoCard label="Retries" value={`${task.retry_count} / ${task.max_retries}`} />
      </div>

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {task.tags.map((tag) => (
            <Badge key={tag} variant="secondary">{tag}</Badge>
          ))}
        </div>
      )}

      <Separator />

      {/* Task Runs */}
      <Tabs defaultValue="runs">
        <TabsList>
          <TabsTrigger value="runs">Run History ({runs.length})</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="runs">
          <ScrollArea className="h-[400px]">
            {runs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Clock className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No runs yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {runs.map((run) => (
                  <RunCard key={run.id} run={run} onRetry={onRetry ? () => onRetry(task.id, run.id) : undefined} />
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="config">
          <Card>
            <CardContent className="p-4">
              <pre className="overflow-auto rounded-md bg-muted p-4 text-xs">
                {JSON.stringify(
                  {
                    id: task.id,
                    schedule_type: task.schedule_type,
                    schedule_value: task.schedule_value,
                    cron_expression: task.cron_expression,
                    max_retries: task.max_retries,
                    workflow_id: task.workflow_id,
                  },
                  null,
                  2
                )}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-3">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-sm font-medium">{value}</p>
      </CardContent>
    </Card>
  );
}

function RunCard({ run, onRetry }: { run: TaskRun; onRetry?: () => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="overflow-hidden">
      <div
        className="flex cursor-pointer items-center gap-3 p-3 hover:bg-accent/50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="shrink-0">
          {run.status === "completed" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
          {run.status === "failed" && <XCircle className="h-4 w-4 text-red-500" />}
          {run.status === "running" && <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />}
          {run.status === "pending" && <Clock className="h-4 w-4 text-yellow-500" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Badge className={getStatusBg(run.status)} variant="outline">
              {run.status}
            </Badge>
            <span className="text-xs text-muted-foreground">{formatDate(run.created_at)}</span>
            {run.duration_ms && (
              <span className="text-xs text-muted-foreground">({(run.duration_ms / 1000).toFixed(1)}s)</span>
            )}
          </div>
          {run.error && <p className="mt-1 truncate text-xs text-red-500">{run.error}</p>}
        </div>
        {run.status === "failed" && onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onRetry();
            }}
            className="gap-1"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Retry
          </Button>
        )}
      </div>

      {expanded && run.logs && run.logs.length > 0 && (
        <div className="border-t bg-muted/30 p-3">
          <div className="space-y-1">
            {(run.logs as TaskLog[]).map((log, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                {logLevelIcons[log.level]}
                <span className="shrink-0 text-muted-foreground">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className="text-foreground">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
