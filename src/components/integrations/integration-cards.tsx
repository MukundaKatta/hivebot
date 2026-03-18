"use client";

import React from "react";
import { Mail, Hash, MessageSquare, Globe, FileSpreadsheet, Zap, Calendar, FolderOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import type { Integration, IntegrationType } from "@/types";

const integrationMeta: Record<
  IntegrationType,
  { name: string; description: string; icon: React.ReactNode; color: string }
> = {
  email: {
    name: "Email (SMTP)",
    description: "Send emails via SMTP. Supports HTML templates and attachments.",
    icon: <Mail className="h-6 w-6" />,
    color: "bg-red-500/10 text-red-500",
  },
  slack: {
    name: "Slack Webhook",
    description: "Send messages to Slack channels via incoming webhooks.",
    icon: <Hash className="h-6 w-6" />,
    color: "bg-purple-500/10 text-purple-500",
  },
  discord: {
    name: "Discord Webhook",
    description: "Send messages and embeds to Discord channels.",
    icon: <MessageSquare className="h-6 w-6" />,
    color: "bg-indigo-500/10 text-indigo-500",
  },
  http: {
    name: "HTTP / REST",
    description: "Make HTTP requests to any API endpoint with custom headers and body.",
    icon: <Globe className="h-6 w-6" />,
    color: "bg-green-500/10 text-green-500",
  },
  google_sheets: {
    name: "Google Sheets",
    description: "Read, write, and append data to Google Spreadsheets.",
    icon: <FileSpreadsheet className="h-6 w-6" />,
    color: "bg-emerald-500/10 text-emerald-500",
  },
  scraper: {
    name: "Web Scraper",
    description: "Scrape web pages with CSS selectors, pagination, and scheduling.",
    icon: <Globe className="h-6 w-6" />,
    color: "bg-blue-500/10 text-blue-500",
  },
  calendar: {
    name: "Calendar",
    description: "Create, view, and manage calendar events with reminders.",
    icon: <Calendar className="h-6 w-6" />,
    color: "bg-orange-500/10 text-orange-500",
  },
  file: {
    name: "File Organizer",
    description: "Watch folders and auto-categorize files using AI.",
    icon: <FolderOpen className="h-6 w-6" />,
    color: "bg-yellow-500/10 text-yellow-500",
  },
};

interface IntegrationCardsProps {
  integrations: Integration[];
  onConfigure: (type: IntegrationType) => void;
  onToggle: (id: string, isActive: boolean) => void;
}

export function IntegrationCards({ integrations, onConfigure, onToggle }: IntegrationCardsProps) {
  const allTypes: IntegrationType[] = ["email", "slack", "discord", "google_sheets", "http", "scraper", "calendar", "file"];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {allTypes.map((type) => {
        const meta = integrationMeta[type];
        const existing = integrations.find((i) => i.type === type);

        return (
          <Card key={type} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${meta.color}`}>
                  {meta.icon}
                </div>
                {existing && (
                  <Switch
                    checked={existing.is_active}
                    onCheckedChange={(checked) => onToggle(existing.id, checked)}
                  />
                )}
              </div>
              <CardTitle className="mt-3 text-base">{meta.name}</CardTitle>
              <CardDescription className="text-xs">{meta.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge variant={existing?.is_active ? "success" : "secondary"}>
                  {existing?.is_active ? "Connected" : "Not configured"}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onConfigure(type)}
                >
                  {existing ? "Edit" : "Configure"}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
