import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useGetCart, useCreateOrder, getGetCartQueryKey, getListOrdersQueryKey } from "@workspace/api-client-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, Package } from "lucide-react";
import { ALL_COUNTRIES } from "@/lib/constants";
import { Link } from "wouter";

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: { id: number; title: string; price: number; currency: string; imageUrl?: string | null };
}

export default function Checkout() {
  const { token } = useAuthStore();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: cart = [] } = useGetCart({ query: { enabled: !!token, queryKey: getGetCartQueryKey() } });
  const createOrder = useCreateOrder();

  const [form, setForm] = useState({ shippingAddress: "", shippingCountry: "" });

  const items = cart as CartItem[];
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const currency = items[0]?.product.currency ?? "EUR";

  if (!token) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="text-center py-20">
          <p className="text-xl">Inicia sessao para continuar</p>
          <Link href="/login"><Button className="mt-4">Entrar</Button></Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.shippingCountry) { toast({ title: "Seleciona o pais de entrega", variant: "destructive" }); return; }
    if (items.length === 0) { toast({ title: "O carrinho esta vazio", variant: "destructive" }); return; }

    try {
      await createOrder.mutateAsync({ data: form });
      queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
      queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
      toast({ title: "Encomenda confirmada!" });
      navigate("/orders");
    } catch {
      toast({ title: "Erro ao criar encomenda", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Finalizar Compra</h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">O carrinho esta vazio</p>
            <Link href="/products"><Button className="mt-4">Explorar produtos</Button></Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                  <h2 className="font-bold text-lg flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary" /> Morada de entrega
                  </h2>
                  <div className="space-y-1.5">
                    <Label htmlFor="address">Morada completa</Label>
                    <Input id="address" placeholder="Rua, numero, andar, codigo postal, cidade"
                      value={form.shippingAddress}
                      onChange={e => setForm(f => ({ ...f, shippingAddress: e.target.value }))}
                      required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Pais de entrega</Label>
                    <Select value={form.shippingCountry} onValueChange={v => setForm(f => ({ ...f, shippingCountry: v }))}>
                      <SelectTrigger><SelectValue placeholder="Seleciona o pais" /></SelectTrigger>
                      <SelectContent>
                        {ALL_COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                  <h2 className="font-bold text-lg flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-accent" /> Pagamento seguro
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Este e um ambiente de demonstracao. Nenhum pagamento sera processado.
                  </p>
                  <div className="flex gap-2">
                    {["VISA", "MC", "MB", "MBWAY"].map(m => (
                      <div key={m} className="border border-border rounded px-2 py-1 text-xs font-semibold text-muted-foreground">{m}</div>
                    ))}
                  </div>
                </div>

                <Button type="submit" size="lg" className="w-full gap-2" disabled={createOrder.isPending}>
                  {createOrder.isPending ? "A processar..." : `Confirmar encomenda — ${total.toFixed(2)} ${currency}`}
                </Button>
              </form>
            </motion.div>

            <div>
              <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
                <h2 className="font-bold text-lg mb-4">Resumo da encomenda</h2>
                <div className="space-y-3 mb-4">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-foreground line-clamp-1 flex-1 mr-2">{item.product.title} ×{item.quantity}</span>
                      <span className="font-semibold text-foreground whitespace-nowrap">
                        {(item.product.price * item.quantity).toFixed(2)} {item.product.currency}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">{total.toFixed(2)} {currency}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
