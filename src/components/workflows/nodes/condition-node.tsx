"use client";

import React, { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { GitBranch } from "lucide-react";

function ConditionNodeComponent({ data }: NodeProps) {
  return (
    <div className="min-w-[180px] rounded-lg border-2 border-green-400 bg-white shadow-md dark:bg-gray-900">
      <Handle type="target" position={Position.Top} className="!bg-green-400 !h-3 !w-3" />
      <div className="flex items-center gap-2 rounded-t-md bg-green-500 px-3 py-2 text-white">
        <GitBranch className="h-4 w-4" />
        <span className="text-xs font-semibold uppercase tracking-wider">Condition</span>
      </div>
      <div className="px-3 py-2">
        <p className="text-sm font-medium">{data.label}</p>
        {data.config?.field && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {data.config.field as string} {data.config.operator as string} {data.config.value as string}
          </p>
        )}
      </div>
      <div className="flex justify-between px-3 pb-2">
        <span className="text-[10px] text-green-600">True</span>
        <span className="text-[10px] text-red-500">False</span>
      </div>
      <Handle type="source" position={Position.Bottom} id="true" className="!bg-green-400 !h-3 !w-3 !left-[30%]" />
      <Handle type="source" position={Position.Bottom} id="false" className="!bg-red-400 !h-3 !w-3 !left-[70%]" />
    </div>
  );
}

export const ConditionNode = memo(ConditionNodeComponent);
