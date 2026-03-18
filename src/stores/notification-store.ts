import { create } from "zustand";
import type { Notification } from "@/types";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;

  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.is_read).length,
    }),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: notification.is_read ? state.unreadCount : state.unreadCount + 1,
    })),

  markAsRead: async (id) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "POST" });
      set((state) => ({
        notifications: state.notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch {
      // Silently fail
    }
  },

  markAllAsRead: async () => {
    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
        unreadCount: 0,
      }));
    } catch {
      // Silently fail
    }
  },

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/notifications");
      const json = await res.json();
      if (res.ok) {
        const notifications = json.data || [];
        set({
          notifications,
          unreadCount: notifications.filter((n: Notification) => !n.is_read).length,
          isLoading: false,
        });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  deleteNotification: async (id) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: "DELETE" });
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount: state.notifications.find((n) => n.id === id && !n.is_read)
          ? state.unreadCount - 1
          : state.unreadCount,
      }));
    } catch {
      // Silently fail
    }
  },
}));
