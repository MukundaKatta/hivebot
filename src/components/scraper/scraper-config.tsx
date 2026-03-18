"use client";

import React, { useState } from "react";
import { Plus, Trash2, Loader2, Globe, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import type { ScraperSelector, ScraperConfig } from "@/types";

interface ScraperConfigFormProps {
  onSubmit: (config: ScraperConfig) => Promise<void>;
  initialConfig?: Partial<ScraperConfig>;
}

export function ScraperConfigForm({ onSubmit, initialConfig }: ScraperConfigFormProps) {
  const [url, setUrl] = useState(initialConfig?.url || "");
  const [selectors, setSelectors] = useState<ScraperSelector[]>(
    initialConfig?.selectors || [{ name: "", selector: "", multiple: true }]
  );
  const [usePagination, setUsePagination] = useState(!!initialConfig?.pagination);
  const [paginationSelector, setPaginationSelector] = useState(initialConfig?.pagination?.next_selector || "");
  const [maxPages, setMaxPages] = useState(initialConfig?.pagination?.max_pages || 5);
  const [schedule, setSchedule] = useState(initialConfig?.schedule || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewData, setPreviewData] = useState<Record<string, string | string[]> | null>(null);

  const addSelector = () => {
    setSelectors([...selectors, { name: "", selector: "", multiple: true }]);
  };

  const updateSelector = (index: number, field: keyof ScraperSelector, value: string | boolean) => {
    const updated = [...selectors];
    updated[index] = { ...updated[index], [field]: value };
    setSelectors(updated);
  };

  const removeSelector = (index: number) => {
    setSelectors(selectors.filter((_, i) => i !== index));
  };

  const handlePreview = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/scraper/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, selectors }),
      });
      const json = await res.json();
      if (json.data) setPreviewData(json.data);
    } catch {
      // Silently fail
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!url || selectors.every((s) => !s.selector)) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        url,
        selectors: selectors.filter((s) => s.selector),
        pagination: usePagination
          ? { next_selector: paginationSelector, max_pages: maxPages }
          : undefined,
        schedule: schedule || undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* URL */}
      <div className="space-y-2">
        <Label>Target URL</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/page-to-scrape"
              className="pl-9"
            />
          </div>
          <Button variant="outline" onClick={handlePreview} disabled={!url || isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
            Preview
          </Button>
        </div>
      </div>

      {/* Selectors */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>CSS Selectors</Label>
          <Button variant="outline" size="sm" onClick={addSelector} className="gap-1">
            <Plus className="h-3.5 w-3.5" />
            Add Selector
          </Button>
        </div>

        {selectors.map((selector, index) => (
          <Card key={index}>
            <CardContent className="grid gap-3 p-3 sm:grid-cols-4">
              <div>
                <Label className="text-xs">Field Name</Label>
                <Input
                  value={selector.name}
                  onChange={(e) => updateSelector(index, "name", e.target.value)}
                  placeholder="e.g., title"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">CSS Selector</Label>
                <Input
                  value={selector.selector}
                  onChange={(e) => updateSelector(index, "selector", e.target.value)}
                  placeholder="e.g., h2.product-title"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Attribute (optional)</Label>
                <Input
                  value={selector.attribute || ""}
                  onChange={(e) => updateSelector(index, "attribute", e.target.value)}
                  placeholder="e.g., href, src"
                  className="mt-1"
                />
              </div>
              <div className="flex items-end gap-2">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={selector.multiple}
                    onCheckedChange={(checked) => updateSelector(index, "multiple", checked)}
                  />
                  <Label className="text-xs">Multiple</Label>
                </div>
                {selectors.length > 1 && (
                  <Button variant="ghost" size="icon" onClick={() => removeSelector(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Switch checked={usePagination} onCheckedChange={setUsePagination} />
          <Label>Enable Pagination</Label>
        </div>
        {usePagination && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs">Next Page Selector</Label>
              <Input
                value={paginationSelector}
                onChange={(e) => setPaginationSelector(e.target.value)}
                placeholder="e.g., a.next-page"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Max Pages</Label>
              <Input
                type="number"
                value={maxPages}
                onChange={(e) => setMaxPages(Number(e.target.value))}
                min={1}
                max={50}
                className="mt-1"
              />
            </div>
          </div>
        )}
      </div>

      {/* Schedule */}
      <div className="space-y-2">
        <Label>Schedule (optional cron expression)</Label>
        <Input
          value={schedule}
          onChange={(e) => setSchedule(e.target.value)}
          placeholder="0 9 * * * (daily at 9am) or leave empty for one-time"
        />
      </div>

      {/* Preview Data */}
      {previewData && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Preview Results</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="overflow-auto rounded-md bg-muted p-3 text-xs">
              {JSON.stringify(previewData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      <Button onClick={handleSubmit} disabled={!url || isSubmitting} className="w-full gap-2" variant="hive">
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
        {isSubmitting ? "Creating Scraper..." : "Create Scraper Task"}
      </Button>
    </div>
  );
}
