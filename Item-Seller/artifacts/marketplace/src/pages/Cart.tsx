import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useGetCart, getGetCartQueryKey, useUpdateCartItem, useRemoveFromCart } from "@workspace/api-client-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight } from "lucide-react";

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: {
    id: number; title: string; price: number; currency: string;
    imageUrl?: string | null; country: string;
  };
}

export default function Cart() {
  const { token } = useAuthStore();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: cart = [], isLoading } = useGetCart({
    query: { enabled: !!token, queryKey: getGetCartQueryKey() },
  });
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveFromCart();

  if (!token) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Carrinho vazio</h2>
          <p className="text-muted-foreground mb-6">Inicia sessao para ver o teu carrinho</p>
          <Link href="/login"><Button>Entrar</Button></Link>
        </div>
      </div>
    );
  }

  const items = cart as CartItem[];
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const currency = items[0]?.product.currency ?? "EUR";

  const handleQuantity = async (productId: number, qty: number) => {
    if (qty < 1) return;
    try {
      await updateItem.mutateAsync({ productId, data: { quantity: qty } });
      queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
    } catch {
      toast({ title: "Erro ao atualizar", variant: "destructive" });
    }
  };

  const handleRemove = async (productId: number) => {
    try {
      await removeItem.mutateAsync({ productId });
      queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
      toast({ title: "Item removido" });
    } catch {
      toast({ title: "Erro ao remover", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Carrinho</h1>

        {isLoading ? (
          <div className="text-center py-20 text-muted-foreground">A carregar...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">O carrinho esta vazio</h2>
            <p className="text-muted-foreground mb-6">Adiciona alguns produtos para comecar</p>
            <Link href="/products"><Button>Explorar produtos</Button></Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-3">
              <AnimatePresence>
                {items.map(item => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="bg-card border border-border rounded-xl p-4 flex gap-4"
                  >
                    <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 flex-shrink-0 overflow-hidden flex items-center justify-center">
                      {item.product.imageUrl ? (
                        <img src={item.product.imageUrl} alt={item.product.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl font-bold text-primary/30">{item.product.title.charAt(0)}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${item.productId}`}>
                        <h3 className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1">
                          {item.product.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground">{item.product.country}</p>
                      <p className="text-primary font-bold">{item.product.price.toFixed(2)} {item.product.currency}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button onClick={() => handleRemove(item.productId)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="flex items-center gap-2 border border-border rounded-lg">
                        <button onClick={() => handleQuantity(item.productId, item.quantity - 1)}
                          className="p-1.5 hover:bg-muted transition-colors rounded-l-lg">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                        <button onClick={() => handleQuantity(item.productId, item.quantity + 1)}
                          className="p-1.5 hover:bg-muted transition-colors rounded-r-lg">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        {(item.product.price * item.quantity).toFixed(2)} {item.product.currency}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="md:col-span-1">
              <div className="bg-card border border-border rounded-xl p-6 sticky top-24 space-y-4">
                <h2 className="text-lg font-bold">Resumo</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} itens)</span>
                    <span>{total.toFixed(2)} {currency}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Envio</span>
                    <span className="text-accent font-medium">Calculado no checkout</span>
                  </div>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">{total.toFixed(2)} {currency}</span>
                  </div>
                </div>
                <Button size="lg" className="w-full gap-2" onClick={() => navigate("/checkout")}>
                  Finalizar compra <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
