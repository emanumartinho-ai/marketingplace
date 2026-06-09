import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useListOrders, useListProducts, useGetMe } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, Tag, ShoppingCart } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

const STATUS_MAP: Record<string, { label: string, color: string }> = {
  pending: { label: "Aguardando pagamento", color: "bg-muted text-muted-foreground" },
  paid: { label: "Pagamento em escrow", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100" },
  shipped: { label: "Enviado — aguardando confirmação", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100" },
  delivered: { label: "Entregue — pagamento libertado", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" },
  disputed: { label: "Em disputa", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100" },
  cancelled: { label: "Cancelado", color: "bg-muted text-muted-foreground" },
};

function OrderList({ role }: { role: "buyer" | "seller" }) {
  const { data: orders, isLoading } = useListOrders({ role });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-12 border rounded-xl bg-muted/20">
        <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-1">Nenhuma encomenda</h3>
        <p className="text-muted-foreground">Ainda não tem encomendas como {role === "buyer" ? "comprador" : "vendedor"}.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map(order => (
        <Link key={order.id} href={`/orders/${order.id}`} className="block">
          <div className="border rounded-xl p-4 md:p-6 flex flex-col md:flex-row gap-4 md:items-center hover:bg-muted/50 transition-colors bg-card">
            <div className="h-16 w-16 bg-muted rounded-md overflow-hidden shrink-0">
              {order.productImageUrl ? (
                <img src={order.productImageUrl} alt={order.productName || "Produto"} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-muted">
                  <Tag className="h-6 w-6 text-muted-foreground opacity-50" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 mb-1">
                <h4 className="font-semibold text-base truncate">{order.productName || `Produto #${order.productId}`}</h4>
                <div className="font-bold whitespace-nowrap">
                  {new Intl.NumberFormat("pt-PT", { style: "currency", currency: order.currency }).format(order.price)}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground mb-2">
                <span>Encomenda #{order.id}</span>
                <span>•</span>
                <span>{format(new Date(order.createdAt), "d 'de' MMMM, yyyy", { locale: pt })}</span>
                {role === "buyer" && order.sellerName && (
                  <>
                    <span>•</span>
                    <span>Vendedor: {order.sellerName}</span>
                  </>
                )}
                {role === "seller" && order.buyerName && (
                  <>
                    <span>•</span>
                    <span>Comprador: {order.buyerName}</span>
                  </>
                )}
              </div>

              <div>
                <Badge className={STATUS_MAP[order.status]?.color || "bg-muted"}>
                  {STATUS_MAP[order.status]?.label || order.status}
                </Badge>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function MyListings() {
  const { data: user } = useGetMe();
  const { data: products, isLoading } = useListProducts({ sellerId: user?.id }, {
    query: { enabled: !!user?.id }
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <Skeleton key={i} className="aspect-[3/4] w-full rounded-xl" />)}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12 border rounded-xl bg-muted/20">
        <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-1">Nenhum anúncio</h3>
        <p className="text-muted-foreground">Ainda não criou nenhum anúncio.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="font-serif text-3xl md:text-4xl font-bold mb-8">Dashboard</h1>

      <Tabs defaultValue="compras" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="compras">As Minhas Compras</TabsTrigger>
          <TabsTrigger value="vendas">As Minhas Vendas</TabsTrigger>
          <TabsTrigger value="anuncios">Os Meus Anúncios</TabsTrigger>
        </TabsList>
        
        <TabsContent value="compras">
          <OrderList role="buyer" />
        </TabsContent>
        
        <TabsContent value="vendas">
          <OrderList role="seller" />
        </TabsContent>
        
        <TabsContent value="anuncios">
          <MyListings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
