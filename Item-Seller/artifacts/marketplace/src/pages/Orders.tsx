import { Link } from "wouter";
import { motion } from "framer-motion";
import { useListOrders } from "@workspace/api-client-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/lib/auth";
import { Package, MapPin, Calendar, Tag } from "lucide-react";

interface OrderItem {
  id: number; productId: number; productTitle: string; quantity: number; price: number; currency: string;
}

interface Order {
  id: number; status: string; total: number; currency: string;
  shippingAddress: string; shippingCountry: string; trackingCode?: string | null;
  items: OrderItem[]; createdAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmada",
  shipped: "Enviada",
  delivered: "Entregue",
  cancelled: "Cancelada",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-secondary/20 text-secondary-foreground border-secondary/30",
  confirmed: "bg-accent/20 text-accent border-accent/30",
  shipped: "bg-primary/20 text-primary border-primary/30",
  delivered: "bg-green-500/20 text-green-700 border-green-500/30",
  cancelled: "bg-destructive/20 text-destructive border-destructive/30",
};

export default function Orders() {
  const { token } = useAuthStore();
  const { data: orders = [], isLoading } = useListOrders({ query: { enabled: !!token } });

  if (!token) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="text-center py-20">
          <p className="text-xl text-muted-foreground mb-4">Inicia sessao para ver as tuas encomendas</p>
          <Link href="/login"><Button>Entrar</Button></Link>
        </div>
      </div>
    );
  }

  const orderList = orders as Order[];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">As minhas Encomendas</h1>

        {isLoading ? (
          <div className="text-center py-20 text-muted-foreground">A carregar encomendas...</div>
        ) : orderList.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Sem encomendas ainda</h2>
            <p className="text-muted-foreground mb-6">As tuas encomendas apareceram aqui</p>
            <Link href="/products"><Button>Comecar a comprar</Button></Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orderList.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-xl p-6 space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-foreground">Encomenda #{order.id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${STATUS_COLORS[order.status] ?? "bg-muted text-muted-foreground"}`}>
                        {STATUS_LABELS[order.status] ?? order.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(order.createdAt).toLocaleDateString("pt-PT")}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {order.shippingCountry}
                      </span>
                      {order.trackingCode && (
                        <span className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {order.trackingCode}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-primary">{order.total.toFixed(2)} {order.currency}</div>
                  </div>
                </div>

                <div className="border-t border-border pt-3 space-y-1.5">
                  {order.items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-foreground">{item.productTitle} <span className="text-muted-foreground">×{item.quantity}</span></span>
                      <span className="font-medium">{(item.price * item.quantity).toFixed(2)} {item.currency}</span>
                    </div>
                  ))}
                </div>

                <div className="text-xs text-muted-foreground border-t border-border pt-2">
                  Entrega para: {order.shippingAddress}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
