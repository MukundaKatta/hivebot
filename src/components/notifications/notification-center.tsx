"use client";

import React from "react";
import { Bell, CheckCheck, Trash2, Info, AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDate, cn } from "@/lib/utils";
import type { Notification } from "@/types";

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
}

export function NotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
}: NotificationCenterProps) {
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Badge variant="info">{unreadCount} unread</Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={onMarkAllAsRead} className="gap-1">
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all as read
          </Button>
        )}
      </div>

      <ScrollArea className="h-[calc(100vh-240px)]">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Bell className="mb-3 h-10 w-10 text-muted-foreground" />
            <h4 className="font-semibold">All caught up!</h4>
            <p className="mt-1 text-sm text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={cn(
                  "transition-colors",
                  !notification.is_read && "border-hive-200 bg-hive-50/30 dark:bg-hive-950/10"
                )}
              >
                <CardContent className="flex items-start gap-3 p-3">
                  <div className="mt-0.5 shrink-0">
                    {notification.title.toLowerCase().includes("fail") ? (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    ) : notification.title.toLowerCase().includes("complet") ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Info className="h-5 w-5 text-hive-500" />
                    )}
                  </div>

                  <div
                    className="min-w-0 flex-1 cursor-pointer"
                    onClick={() => !notification.is_read && onMarkAsRead(notification.id)}
                  >
                    <div className="flex items-center gap-2">
                      <p className={cn("text-sm font-medium", !notification.is_read && "font-semibold")}>
                        {notification.title}
                      </p>
                      {!notification.is_read && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-hive-500" />
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">{notification.message}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatDate(notification.created_at)}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {notification.channel}
                      </Badge>
                      {notification.task_id && (
                        <a href={`/tasks?id=${notification.task_id}`} className="flex items-center gap-1 text-hive-500 hover:underline">
                          View task <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  <Button variant="ghost" size="icon" onClick={() => onDelete(notification.id)} className="shrink-0">
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
