import { useParams, Link } from "wouter";
import { useGetOrder, useGetMe, useMarkOrderShipped, useConfirmOrderDelivery, useDisputeOrder } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, ArrowLeft, Package, Truck, CheckCircle2, AlertOctagon } from "lucide-react";
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

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const orderId = parseInt(id || "0", 10);
  const { toast } = useToast();

  const { data: user } = useGetMe();
  const { data: order, isLoading, refetch } = useGetOrder(orderId, {
    query: { enabled: !!orderId }
  });

  const shipMutation = useMarkOrderShipped();
  const confirmMutation = useConfirmOrderDelivery();
  const disputeMutation = useDisputeOrder();

  if (isLoading) {
    return (
      <div className="container max-w-3xl mx-auto px-4 py-12">
        <Skeleton className="h-8 w-64 mb-8" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold mb-4">Encomenda não encontrada</h2>
        <Button asChild>
          <Link href="/dashboard">Voltar ao Dashboard</Link>
        </Button>
      </div>
    );
  }

  const isBuyer = user?.id === order.buyerId;
  const isSeller = user?.id === order.sellerId;

  const handleShip = () => {
    shipMutation.mutate({ id: order.id }, {
      onSuccess: () => {
        toast({ title: "Estado atualizado", description: "Encomenda marcada como enviada." });
        refetch();
      }
    });
  };

  const handleConfirm = () => {
    confirmMutation.mutate({ id: order.id }, {
      onSuccess: () => {
        toast({ title: "Entrega confirmada", description: "Pagamento libertado para o vendedor." });
        refetch();
      }
    });
  };

  const handleDispute = () => {
    disputeMutation.mutate({ id: order.id }, {
      onSuccess: () => {
        toast({ variant: "destructive", title: "Disputa aberta", description: "O pagamento está retido até resolução." });
        refetch();
      }
    });
  };

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8 md:py-12">
      <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar ao Dashboard
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold">Encomenda #{order.id}</h1>
          <p className="text-muted-foreground mt-1">
            Realizada a {format(new Date(order.createdAt), "d 'de' MMMM, yyyy", { locale: pt })}
          </p>
        </div>
        <Badge className={`${STATUS_MAP[order.status]?.color || "bg-muted"} text-sm px-3 py-1`}>
          {STATUS_MAP[order.status]?.label || order.status}
        </Badge>
      </div>

      <div className="border rounded-2xl overflow-hidden bg-card mb-8">
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-muted rounded-xl overflow-hidden shrink-0">
              {order.productImageUrl ? (
                <img src={order.productImageUrl} alt={order.productName || "Produto"} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-8 w-8 text-muted-foreground opacity-50" />
                </div>
              )}
            </div>
            
            <div className="flex-1 flex flex-col justify-center">
              <h2 className="text-xl font-bold mb-2">
                {order.productName || `Produto #${order.productId}`}
              </h2>
              <div className="text-2xl font-bold mb-4">
                {new Intl.NumberFormat("pt-PT", { style: "currency", currency: order.currency }).format(order.price)}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <span className="block font-medium text-foreground mb-1">Vendedor</span>
                  {order.sellerName || "Desconhecido"}
                </div>
                <div>
                  <span className="block font-medium text-foreground mb-1">Comprador</span>
                  {order.buyerName || "Desconhecido"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator />
        
        <div className="bg-muted/30 p-6 md:p-8">
          <div className="flex items-start gap-4 mb-6">
            <ShieldCheck className="h-6 w-6 text-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold mb-1">Proteção de Escrow</h3>
              <p className="text-sm text-muted-foreground">
                O pagamento fica retido até confirmares a entrega. Só liberta quando tu aprovares.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 pt-4 border-t border-border/50">
            {isSeller && order.status === "paid" && (
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleShip} disabled={shipMutation.isPending} className="flex-1">
                  <Truck className="mr-2 h-4 w-4" />
                  {shipMutation.isPending ? "A atualizar..." : "Marcar como Enviado"}
                </Button>
              </div>
            )}

            {isBuyer && order.status === "shipped" && (
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleConfirm} disabled={confirmMutation.isPending} className="flex-1">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {confirmMutation.isPending ? "A confirmar..." : "Confirmar Entrega (Libertar Pagamento)"}
                </Button>
                <Button onClick={handleDispute} disabled={disputeMutation.isPending} variant="destructive" className="flex-1">
                  <AlertOctagon className="mr-2 h-4 w-4" />
                  {disputeMutation.isPending ? "A abrir..." : "Abrir Disputa"}
                </Button>
              </div>
            )}

            {((isSeller && order.status !== "paid") || (isBuyer && order.status !== "shipped")) && (
              <p className="text-sm text-muted-foreground italic text-center">
                Nenhuma ação necessária neste momento.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
