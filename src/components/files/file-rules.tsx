"use client";

import React, { useState } from "react";
import { Plus, Trash2, FolderOpen, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { FileRule, FileCondition, FileAction } from "@/types";

interface FileRulesProps {
  rules: FileRule[];
  onCreateRule: (rule: Partial<FileRule>) => Promise<void>;
  onDeleteRule: (id: string) => Promise<void>;
  onToggleRule: (id: string, isActive: boolean) => Promise<void>;
}

export function FileRules({ rules, onCreateRule, onDeleteRule, onToggleRule }: FileRulesProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [watchPath, setWatchPath] = useState("");
  const [conditions, setConditions] = useState<FileCondition[]>([{ type: "extension", value: "" }]);
  const [actions, setActions] = useState<FileAction[]>([{ type: "move", destination: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name || !watchPath) return;
    setIsSubmitting(true);
    try {
      await onCreateRule({
        name,
        watch_path: watchPath,
        conditions: conditions.filter((c) => c.value),
        actions: actions.filter((a) => a.destination || a.pattern),
        is_active: true,
      });
      setShowForm(false);
      setName("");
      setWatchPath("");
      setConditions([{ type: "extension", value: "" }]);
      setActions([{ type: "move", destination: "" }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">File Organization Rules</h3>
          <p className="text-sm text-muted-foreground">Auto-categorize and organize files using AI</p>
        </div>
        <Button variant="hive" onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Rule
        </Button>
      </div>

      {showForm && (
        <Card className="border-hive-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Create File Rule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Rule Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Organize Downloads" className="mt-1" />
              </div>
              <div>
                <Label>Watch Folder</Label>
                <div className="relative mt-1">
                  <FolderOpen className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={watchPath} onChange={(e) => setWatchPath(e.target.value)} placeholder="/Users/me/Downloads" className="pl-9" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Conditions</Label>
              {conditions.map((condition, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Select
                    value={condition.type}
                    onValueChange={(v) => {
                      const updated = [...conditions];
                      updated[i] = { ...updated[i], type: v as FileCondition["type"] };
                      setConditions(updated);
                    }}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="extension">File Extension</SelectItem>
                      <SelectItem value="name_contains">Name Contains</SelectItem>
                      <SelectItem value="name_regex">Name Regex</SelectItem>
                      <SelectItem value="size_gt">Size Greater Than</SelectItem>
                      <SelectItem value="size_lt">Size Less Than</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    value={condition.value}
                    onChange={(e) => {
                      const updated = [...conditions];
                      updated[i] = { ...updated[i], value: e.target.value };
                      setConditions(updated);
                    }}
                    placeholder={condition.type === "extension" ? ".pdf, .doc" : "value"}
                    className="flex-1"
                  />
                  {conditions.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => setConditions(conditions.filter((_, idx) => idx !== i))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => setConditions([...conditions, { type: "extension", value: "" }])}>
                <Plus className="mr-1 h-3.5 w-3.5" />
                Add Condition
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Actions</Label>
              {actions.map((action, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Select
                    value={action.type}
                    onValueChange={(v) => {
                      const updated = [...actions];
                      updated[i] = { ...updated[i], type: v as FileAction["type"] };
                      setActions(updated);
                    }}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="move">Move to Folder</SelectItem>
                      <SelectItem value="copy">Copy to Folder</SelectItem>
                      <SelectItem value="rename">Rename (pattern)</SelectItem>
                      <SelectItem value="tag">Add Tag</SelectItem>
                      <SelectItem value="ai_categorize">AI Categorize</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    value={action.destination || action.pattern || ""}
                    onChange={(e) => {
                      const updated = [...actions];
                      if (action.type === "rename" || action.type === "tag") {
                        updated[i] = { ...updated[i], pattern: e.target.value };
                      } else {
                        updated[i] = { ...updated[i], destination: e.target.value };
                      }
                      setActions(updated);
                    }}
                    placeholder={action.type === "move" || action.type === "copy" ? "/path/to/folder" : "pattern or tag"}
                    className="flex-1"
                  />
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => setActions([...actions, { type: "move", destination: "" }])}>
                <Plus className="mr-1 h-3.5 w-3.5" />
                Add Action
              </Button>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button variant="hive" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Rule
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Rules */}
      <div className="space-y-3">
        {rules.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-12 text-center">
              <FolderOpen className="mb-3 h-10 w-10 text-muted-foreground" />
              <h4 className="font-semibold">No file rules yet</h4>
              <p className="mt-1 text-sm text-muted-foreground">Create a rule to auto-organize your files</p>
            </CardContent>
          </Card>
        ) : (
          rules.map((rule) => (
            <Card key={rule.id}>
              <CardContent className="flex items-center gap-4 p-4">
                <Switch checked={rule.is_active} onCheckedChange={(checked) => onToggleRule(rule.id, checked)} />
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium">{rule.name}</h4>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <FolderOpen className="h-3 w-3" />
                    <span>{rule.watch_path}</span>
                    <ArrowRight className="h-3 w-3" />
                    {(rule.actions as FileAction[]).map((a, i) => (
                      <Badge key={i} variant="secondary" className="text-[10px]">
                        {a.type}: {a.destination || a.pattern}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => onDeleteRule(rule.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
