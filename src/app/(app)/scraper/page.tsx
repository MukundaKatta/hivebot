"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { ScraperConfigForm } from "@/components/scraper/scraper-config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Globe, Clock, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Task, ScraperConfig } from "@/types";

export default function ScraperPage() {
  const [scraperTasks, setScraperTasks] = useState<Task[]>([]);
  const [results, setResults] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    fetchScraperTasks();
  }, []);

  const fetchScraperTasks = async () => {
    const res = await fetch("/api/tasks?tags=scraper");
    const json = await res.json();
    if (json.data) setScraperTasks(json.data);
  };

  const handleCreateScraper = async (config: ScraperConfig) => {
    const res = await fetch("/api/scraper", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    if (res.ok) fetchScraperTasks();
  };

  const handleDelete = async (taskId: string) => {
    await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    fetchScraperTasks();
  };

  return (
    <div>
      <Header title="Web Scraper" description="Point at a URL, select elements, schedule recurring scrapes" />
      <div className="p-6">
        <Tabs defaultValue="create">
          <TabsList>
            <TabsTrigger value="create">Create Scraper</TabsTrigger>
            <TabsTrigger value="active">Active Scrapers ({scraperTasks.length})</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Configure Web Scraper</CardTitle>
              </CardHeader>
              <CardContent>
                <ScraperConfigForm onSubmit={handleCreateScraper} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="active" className="mt-6">
            <div className="space-y-3">
              {scraperTasks.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center py-12 text-center">
                    <Globe className="mb-3 h-10 w-10 text-muted-foreground" />
                    <h4 className="font-semibold">No active scrapers</h4>
                    <p className="mt-1 text-sm text-muted-foreground">Create a scraper to get started</p>
                  </CardContent>
                </Card>
              ) : (
                scraperTasks.map((task) => (
                  <Card key={task.id}>
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                        <Globe className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium">{task.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline">{task.status}</Badge>
                          {task.cron_expression && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {task.cron_expression}
                            </span>
                          )}
                          {task.last_run_at && <span>Last: {formatDate(task.last_run_at)}</span>}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(task.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="results" className="mt-6">
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-sm text-muted-foreground">
                  Scraper results will appear here after your first scrape completes
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
