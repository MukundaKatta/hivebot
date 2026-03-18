"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, Loader2, CheckCircle2, XCircle, Clock, Brain, Eye, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { AgentGoal, AgentStep } from "@/types";

interface AgentChatProps {
  goals: AgentGoal[];
  onSubmitGoal: (goal: string) => Promise<void>;
}

const stepTypeIcons: Record<string, React.ReactNode> = {
  think: <Brain className="h-3.5 w-3.5 text-purple-500" />,
  action: <Zap className="h-3.5 w-3.5 text-blue-500" />,
  observe: <Eye className="h-3.5 w-3.5 text-green-500" />,
  decide: <Bot className="h-3.5 w-3.5 text-honey-500" />,
};

const statusIcons: Record<string, React.ReactNode> = {
  completed: <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />,
  failed: <XCircle className="h-3.5 w-3.5 text-red-500" />,
  running: <Loader2 className="h-3.5 w-3.5 text-blue-500 animate-spin" />,
  pending: <Clock className="h-3.5 w-3.5 text-yellow-500" />,
};

export function AgentChat({ goals, onSubmitGoal }: AgentChatProps) {
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [goals]);

  const handleSubmit = async () => {
    if (!input.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmitGoal(input.trim());
      setInput("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-200px)] flex-col">
      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {goals.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-honey-400 to-hive-500">
              <Bot className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Agent Mode</h3>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Give me a goal and I&apos;ll figure out the steps to accomplish it. I can scrape websites, send messages,
              make API calls, and more.
            </p>
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              {[
                "Find the top trending repos on GitHub and email me a summary",
                "Check if my website is up and alert me on Slack if it's down",
                "Scrape job listings for 'AI Engineer' from HN and save to Google Sheets",
                "Monitor a URL for price changes and notify me via Discord",
              ].map((example, i) => (
                <button
                  key={i}
                  onClick={() => setInput(example)}
                  className="rounded-lg border p-3 text-left text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {goals.map((goal) => (
              <div key={goal.id} className="space-y-3">
                {/* User message */}
                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-tr-md bg-hive-600 px-4 py-3 text-sm text-white">
                    {goal.goal}
                  </div>
                </div>

                {/* Agent response */}
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-honey-400 to-honey-600">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 space-y-2">
                    {/* Status badge */}
                    <Badge
                      variant={
                        goal.status === "completed"
                          ? "success"
                          : goal.status === "failed"
                          ? "destructive"
                          : goal.status === "executing"
                          ? "info"
                          : "secondary"
                      }
                    >
                      {goal.status === "planning" && "Planning..."}
                      {goal.status === "executing" && "Executing..."}
                      {goal.status === "completed" && "Completed"}
                      {goal.status === "failed" && "Failed"}
                    </Badge>

                    {/* Steps */}
                    {(goal.steps as AgentStep[]).map((step, i) => (
                      <Card key={step.id || i} className="overflow-hidden">
                        <CardContent className="flex items-start gap-2 p-2.5">
                          <div className="mt-0.5 shrink-0">
                            {stepTypeIcons[step.type] || stepTypeIcons.action}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium capitalize text-muted-foreground">
                                {step.type}
                              </span>
                              {statusIcons[step.status]}
                            </div>
                            <p className="text-sm">{step.description}</p>
                            {step.result && (
                              <p className="mt-1 text-xs text-muted-foreground">{step.result}</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {/* Result */}
                    {goal.result && (
                      <div className="rounded-lg bg-muted/50 p-3 text-sm">
                        {goal.result}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="border-t bg-card p-4">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Describe your goal... e.g., 'Find the top trending repos on GitHub and email me a summary'"
            className="min-h-[44px] resize-none"
            rows={1}
          />
          <Button onClick={handleSubmit} disabled={!input.trim() || isSubmitting} variant="hive" size="icon" className="h-[44px] w-[44px] shrink-0">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Press Cmd+Enter to send</p>
      </div>
    </div>
  );
}
