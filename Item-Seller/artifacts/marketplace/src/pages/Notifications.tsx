import { motion, AnimatePresence } from "framer-motion";
import {
  useListNotifications, getListNotificationsQueryKey,
  useMarkNotificationRead, useMarkAllNotificationsRead
} from "@workspace/api-client-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Bell, BellOff, CheckCheck } from "lucide-react";
import { Link } from "wouter";

interface Notification {
  id: number; title: string; message: string; type: string; isRead: boolean; createdAt: string;
}

const TYPE_COLORS: Record<string, string> = {
  order: "bg-accent/10 border-accent/30",
  info: "bg-primary/10 border-primary/30",
  promo: "bg-secondary/10 border-secondary/30",
};

export default function Notifications() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: notifications = [], isLoading } = useListNotifications({
    query: { enabled: !!token, queryKey: getListNotificationsQueryKey() },
  });
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const notifs = notifications as Notification[];
  const unreadCount = notifs.filter(n => !n.isRead).length;

  const handleMarkRead = async (id: number) => {
    await markRead.mutateAsync({ id });
    queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
  };

  const handleMarkAll = async () => {
    await markAll.mutateAsync({});
    queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
    toast({ title: "Todas marcadas como lidas" });
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="text-center py-20">
          <p className="text-xl text-muted-foreground mb-4">Inicia sessao para ver as tuas notificacoes</p>
          <Link href="/login"><Button>Entrar</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Notificacoes</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-muted-foreground mt-1">{unreadCount} nao lida{unreadCount !== 1 ? "s" : ""}</p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAll} className="gap-1.5">
              <CheckCheck className="w-4 h-4" /> Marcar todas
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-muted-foreground">A carregar...</div>
        ) : notifs.length === 0 ? (
          <div className="text-center py-20">
            <BellOff className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Sem notificacoes</h2>
            <p className="text-muted-foreground">As tuas notificacoes aparecerao aqui</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {notifs.map((notif, i) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => !notif.isRead && handleMarkRead(notif.id)}
                  className={`border rounded-xl p-4 cursor-pointer transition-all ${
                    notif.isRead ? "bg-card border-border opacity-70" : `${TYPE_COLORS[notif.type] ?? "bg-card border-border"} shadow-sm`
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${notif.isRead ? "bg-muted" : "bg-primary"}`}>
                      <Bell className={`w-4 h-4 ${notif.isRead ? "text-muted-foreground" : "text-primary-foreground"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={`font-semibold ${notif.isRead ? "text-muted-foreground" : "text-foreground"}`}>
                          {notif.title}
                        </h3>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{notif.message}</p>
                      <p className="text-xs text-muted-foreground mt-1.5">
                        {new Date(notif.createdAt).toLocaleString("pt-PT")}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
