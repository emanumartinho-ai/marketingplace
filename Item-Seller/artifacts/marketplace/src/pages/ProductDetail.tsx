import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useGetProduct, getGetProductQueryKey, useAddToCart } from "@workspace/api-client-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, MapPin, User, Package, ArrowLeft, Truck } from "lucide-react";
import { Link } from "wouter";

export default function ProductDetail() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const [, navigate] = useLocation();
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: product, isLoading } = useGetProduct(id, {
    query: { enabled: !!id, queryKey: getGetProductQueryKey(id) },
  });
  const addToCart = useAddToCart();

  const handleAddToCart = async () => {
    if (!token) { navigate("/login"); return; }
    try {
      await addToCart.mutateAsync({ data: { productId: id, quantity: 1 } });
      queryClient.invalidateQueries({ queryKey: ["/cart"] });
      toast({ title: "Adicionado ao carrinho!" });
    } catch {
      toast({ title: "Erro ao adicionar ao carrinho", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-8">
          <Skeleton className="h-80 rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-12 w-1/3" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-20 text-center">
          <p className="text-2xl font-semibold text-foreground">Produto nao encontrado</p>
          <Link href="/products"><Button className="mt-4">Ver todos os produtos</Button></Link>
        </div>
      </div>
    );
  }

  const p = product as {
    id: number; title: string; description: string; price: number; currency: string;
    category: string; country: string; sellerName: string; stock: number;
    imageUrl?: string | null; isFeatured?: boolean; shippingInfo?: string | null;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link href="/products">
          <Button variant="ghost" size="sm" className="gap-1.5 mb-6 text-muted-foreground">
            <ArrowLeft className="w-4 h-4" /> Voltar aos produtos
          </Button>
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl flex items-center justify-center h-80 md:h-full min-h-64 overflow-hidden border border-border"
          >
            {p.imageUrl ? (
              <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <div className="text-8xl font-bold text-primary/20">{p.title.charAt(0)}</div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline">{p.category}</Badge>
              {p.isFeatured && <Badge className="bg-secondary text-secondary-foreground">Destaque</Badge>}
            </div>

            <h1 className="text-3xl font-bold text-foreground leading-tight">{p.title}</h1>

            <div className="text-4xl font-extrabold text-primary">
              {p.price.toFixed(2)} <span className="text-xl text-muted-foreground font-normal">{p.currency}</span>
            </div>

            <p className="text-foreground/80 leading-relaxed">{p.description}</p>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" /> <span>{p.country}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="w-4 h-4" /> <span>Vendedor: {p.sellerName}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Package className="w-4 h-4" />
                <span className={p.stock > 0 ? "text-accent font-medium" : "text-destructive"}>
                  {p.stock > 0 ? `${p.stock} em stock` : "Sem stock"}
                </span>
              </div>
              {p.shippingInfo && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Truck className="w-4 h-4" /> <span>{p.shippingInfo}</span>
                </div>
              )}
            </div>

            <div className="pt-2">
              <Button
                size="lg"
                className="w-full gap-2 text-base"
                disabled={p.stock === 0 || addToCart.isPending}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-5 h-5" />
                {addToCart.isPending ? "A adicionar..." : p.stock === 0 ? "Sem stock" : "Adicionar ao carrinho"}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
