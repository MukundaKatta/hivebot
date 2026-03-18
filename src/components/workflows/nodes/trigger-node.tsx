"use client";

import React, { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { Zap, Clock, Globe, FolderOpen } from "lucide-react";

const triggerIcons: Record<string, React.ReactNode> = {
  cron: <Clock className="h-4 w-4" />,
  webhook: <Globe className="h-4 w-4" />,
  file_watch: <FolderOpen className="h-4 w-4" />,
  manual: <Zap className="h-4 w-4" />,
};

function TriggerNodeComponent({ data }: NodeProps) {
  return (
    <div className="min-w-[180px] rounded-lg border-2 border-honey-400 bg-white shadow-md dark:bg-gray-900">
      <div className="flex items-center gap-2 rounded-t-md bg-honey-400 px-3 py-2 text-white">
        {triggerIcons[data.config?.trigger_type as string] || <Zap className="h-4 w-4" />}
        <span className="text-xs font-semibold uppercase tracking-wider">Trigger</span>
      </div>
      <div className="px-3 py-2">
        <p className="text-sm font-medium">{data.label}</p>
        {data.config?.schedule && (
          <p className="mt-0.5 text-xs text-muted-foreground">{data.config.schedule as string}</p>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-honey-400 !h-3 !w-3" />
    </div>
  );
}

export const TriggerNode = memo(TriggerNodeComponent);
