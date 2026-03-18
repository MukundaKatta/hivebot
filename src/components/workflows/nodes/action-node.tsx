"use client";

import React, { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { Mail, MessageSquare, Globe, FileSpreadsheet, Send, Hash } from "lucide-react";

const integrationIcons: Record<string, React.ReactNode> = {
  email: <Mail className="h-4 w-4" />,
  slack: <Hash className="h-4 w-4" />,
  discord: <MessageSquare className="h-4 w-4" />,
  google_sheets: <FileSpreadsheet className="h-4 w-4" />,
  http: <Globe className="h-4 w-4" />,
  scraper: <Globe className="h-4 w-4" />,
};

function ActionNodeComponent({ data }: NodeProps) {
  return (
    <div className="min-w-[180px] rounded-lg border-2 border-hive-400 bg-white shadow-md dark:bg-gray-900">
      <Handle type="target" position={Position.Top} className="!bg-hive-400 !h-3 !w-3" />
      <div className="flex items-center gap-2 rounded-t-md bg-hive-500 px-3 py-2 text-white">
        {integrationIcons[data.integration as string] || <Send className="h-4 w-4" />}
        <span className="text-xs font-semibold uppercase tracking-wider">Action</span>
      </div>
      <div className="px-3 py-2">
        <p className="text-sm font-medium">{data.label}</p>
        {data.integration && (
          <p className="mt-0.5 text-xs capitalize text-muted-foreground">
            {(data.integration as string).replace("_", " ")}
          </p>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-hive-400 !h-3 !w-3" />
    </div>
  );
}

export const ActionNode = memo(ActionNodeComponent);
