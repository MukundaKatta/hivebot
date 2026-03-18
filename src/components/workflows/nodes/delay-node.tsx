"use client";

import React, { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { Timer } from "lucide-react";

function DelayNodeComponent({ data }: NodeProps) {
  return (
    <div className="min-w-[180px] rounded-lg border-2 border-purple-400 bg-white shadow-md dark:bg-gray-900">
      <Handle type="target" position={Position.Top} className="!bg-purple-400 !h-3 !w-3" />
      <div className="flex items-center gap-2 rounded-t-md bg-purple-500 px-3 py-2 text-white">
        <Timer className="h-4 w-4" />
        <span className="text-xs font-semibold uppercase tracking-wider">Delay</span>
      </div>
      <div className="px-3 py-2">
        <p className="text-sm font-medium">{data.label}</p>
        {data.config?.delay_ms && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            Wait {((data.config.delay_ms as number) / 1000).toFixed(0)}s
          </p>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-purple-400 !h-3 !w-3" />
    </div>
  );
}

export const DelayNode = memo(DelayNodeComponent);
