"use client";

import { useEffect, useState, useTransition } from "react";
import { Bell, Check, CheckCheck, Trash2, X } from "lucide-react";

import {
  deleteNotificationAction,
  listNotificationsAction,
  markAllNotificationsReadAction,
  markNotificationReadAction,
  type NotificationApiItem,
} from "@/lib/actions/notifications";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationApiItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;
    listNotificationsAction(false).then((res) => {
      if (!active || !res.ok) return;
      setNotifications(res.data);
      setUnreadCount(res.unreadCount);
    });
    return () => {
      active = false;
    };
  }, []);

  function refreshNotifications() {
    listNotificationsAction(false).then((res) => {
      if (!res.ok) return;
      setNotifications(res.data);
      setUnreadCount(res.unreadCount);
    });
  }

  function handleMarkRead(id: string) {
    startTransition(async () => {
      const res = await markNotificationReadAction(id);
      if (!res.ok) return;
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isRead: true } : item
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    });
  }

  function handleMarkAllRead() {
    startTransition(async () => {
      const res = await markAllNotificationsReadAction();
      if (!res.ok) return;
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, isRead: true }))
      );
      setUnreadCount(0);
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const wasUnread = notifications.find((n) => n.id === id && !n.isRead);
      const res = await deleteNotificationAction(id);
      if (!res.ok) return;
      setNotifications((prev) => prev.filter((item) => item.id !== id));
      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          const next = !open;
          setOpen(next);
          if (next) {
            refreshNotifications();
          }
        }}
        aria-label="Notifications"
        className="relative p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-accent text-[10px] font-bold text-slate-950 rounded-full flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-card rounded-2xl border border-border shadow-xl z-50 overflow-hidden">
          <div className="p-3.5 border-b border-border flex items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold text-foreground">
                Notifications
              </h3>
              <p className="text-[11px] text-muted-foreground">
                {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleMarkAllRead}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold text-primary hover:bg-primary/10"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span>Tout lire</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer les notifications"
                className="p-1 rounded-full text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-border/60">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                Aucune notification pour le moment.
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 flex items-start justify-between gap-2 ${
                    item.isRead ? "bg-card" : "bg-primary/5"
                  }`}
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      {!item.isRead && (
                        <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                      )}
                      <p className="text-xs font-semibold text-foreground truncate">
                        {item.titre}
                      </p>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug">
                      {item.message}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(item.createdAt).toLocaleString("fr-FR")}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {!item.isRead && (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleMarkRead(item.id)}
                        title="Marquer comme lue"
                        aria-label="Marquer comme lue"
                        className="p-1 rounded-full text-primary hover:bg-primary/10"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleDelete(item.id)}
                      title="Supprimer"
                      aria-label="Supprimer la notification"
                      className="p-1 rounded-full text-muted-foreground hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
