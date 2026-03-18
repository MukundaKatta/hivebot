"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Zap,
  Mail,
  Hash,
  MessageSquare,
  Globe,
  FileSpreadsheet,
  GitBranch,
  Timer,
  Clock,
  FolderOpen,
  Send,
} from "lucide-react";
import type { WorkflowNodeType, IntegrationType } from "@/types";

interface NodePaletteItem {
  type: WorkflowNodeType;
  integration?: IntegrationType;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const paletteItems: NodePaletteItem[] = [
  { type: "trigger", label: "Cron Trigger", icon: <Clock className="h-4 w-4" />, color: "bg-honey-400" },
  { type: "trigger", label: "Webhook Trigger", icon: <Globe className="h-4 w-4" />, color: "bg-honey-400" },
  { type: "trigger", integration: "file", label: "File Watch", icon: <FolderOpen className="h-4 w-4" />, color: "bg-honey-400" },
  { type: "action", integration: "email", label: "Send Email", icon: <Mail className="h-4 w-4" />, color: "bg-hive-500" },
  { type: "action", integration: "slack", label: "Slack Message", icon: <Hash className="h-4 w-4" />, color: "bg-hive-500" },
  { type: "action", integration: "discord", label: "Discord Message", icon: <MessageSquare className="h-4 w-4" />, color: "bg-hive-500" },
  { type: "action", integration: "http", label: "HTTP Request", icon: <Globe className="h-4 w-4" />, color: "bg-hive-500" },
  { type: "action", integration: "scraper", label: "Web Scrape", icon: <Send className="h-4 w-4" />, color: "bg-hive-500" },
  { type: "action", integration: "google_sheets", label: "Google Sheets", icon: <FileSpreadsheet className="h-4 w-4" />, color: "bg-hive-500" },
  { type: "condition", label: "Condition", icon: <GitBranch className="h-4 w-4" />, color: "bg-green-500" },
  { type: "delay", label: "Delay", icon: <Timer className="h-4 w-4" />, color: "bg-purple-500" },
];

interface NodePaletteProps {
  onAddNode: (item: NodePaletteItem) => void;
}

export function NodePalette({ onAddNode }: NodePaletteProps) {
  return (
    <Card className="w-64 shrink-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Node Palette</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {paletteItems.map((item, i) => (
          <button
            key={`${item.type}-${item.integration || item.label}-${i}`}
            onClick={() => onAddNode(item)}
            className="flex w-full items-center gap-2 rounded-md p-2 text-sm transition-colors hover:bg-accent"
            draggable
          >
            <div className={`flex h-7 w-7 items-center justify-center rounded ${item.color} text-white`}>
              {item.icon}
            </div>
            <span className="text-left">{item.label}</span>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
