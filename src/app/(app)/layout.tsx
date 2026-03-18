"use client";

import React, { useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { useNotificationStore } from "@/stores/notification-store";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { fetchNotifications } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
