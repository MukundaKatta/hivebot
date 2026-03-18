"use client";

import React, { useState } from "react";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

interface TaskInputProps {
  onSubmit: (input: string) => Promise<void>;
  placeholder?: string;
}

const EXAMPLES = [
  "Scrape the top 10 products from ProductHunt daily and email me a summary",
  "Every weekday at 9am, check if bitcoin is above $50k and post to Slack",
  "Watch my Downloads folder and auto-organize files by extension",
  "Send me a weekly digest of my completed tasks every Friday at 5pm",
  "Every hour, check example.com/api/status and alert me if it returns an error",
];

export function TaskInput({ onSubmit, placeholder }: TaskInputProps) {
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmit(input.trim());
      setInput("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Card className="border-honey-200 bg-gradient-to-r from-honey-50/50 to-hive-50/50 dark:from-honey-950/20 dark:to-hive-950/20">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-honey-400 to-honey-600">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 space-y-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder || 'Describe your task in plain English... e.g., "Scrape the top 10 products from ProductHunt daily and email me a summary"'}
              className="min-h-[60px] resize-none border-honey-200 bg-white/80 dark:bg-background/80"
              rows={2}
            />
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1.5">
                {EXAMPLES.slice(0, 3).map((example, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(example)}
                    className="rounded-full bg-white/60 px-2.5 py-1 text-xs text-muted-foreground hover:bg-white hover:text-foreground transition-colors border border-border/50 dark:bg-background/60"
                  >
                    {example.length > 50 ? example.slice(0, 50) + "..." : example}
                  </button>
                ))}
              </div>
              <Button
                onClick={handleSubmit}
                disabled={!input.trim() || isSubmitting}
                variant="hive"
                size="sm"
                className="gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {isSubmitting ? "Processing..." : "Create Task"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Press Cmd+Enter to submit. AI will parse your input and create the appropriate task, schedule, and workflow.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
