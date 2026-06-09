import { Link } from "wouter";
import { motion } from "framer-motion";
import { ShoppingCart, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/lib/auth";
import { useAddToCart } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: number;
  title: string;
  price: number;
  currency: string;
  category: string;
  country: string;
  imageUrl?: string | null;
  isFeatured?: boolean;
}

interface Props {
  product: Product;
  index?: number;
}

const PLACEHOLDER_COLORS = [
  "from-primary/20 to-secondary/20",
  "from-accent/20 to-primary/20",
  "from-secondary/20 to-accent/20",
  "from-primary/30 to-accent/10",
];

export function ProductCard({ product, index = 0 }: Props) {
  const { token } = useAuthStore();
  const addToCart = useAddToCart();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!token) {
      toast({ title: "Inicia sessão para adicionar ao carrinho", variant: "destructive" });
      return;
    }
    try {
      await addToCart.mutateAsync({ data: { productId: product.id, quantity: 1 } });
      queryClient.invalidateQueries({ queryKey: ["/cart"] });
      toast({ title: "Adicionado ao carrinho!" });
    } catch {
      toast({ title: "Erro ao adicionar ao carrinho", variant: "destructive" });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Link href={`/products/${product.id}`}>
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer h-full flex flex-col">
          <div className={`relative h-48 bg-gradient-to-br ${PLACEHOLDER_COLORS[index % PLACEHOLDER_COLORS.length]} flex items-center justify-center overflow-hidden`}>
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
            ) : (
              <div className="text-5xl opacity-30 font-bold text-primary">
                {product.title.charAt(0)}
              </div>
            )}
            {product.isFeatured && (
              <Badge className="absolute top-2 left-2 bg-secondary text-secondary-foreground font-semibold text-xs">
                Destaque
              </Badge>
            )}
          </div>
          <div className="p-4 flex flex-col flex-1 gap-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                {product.title}
              </h3>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span>{product.country}</span>
            </div>
            <Badge variant="outline" className="w-fit text-xs">
              {product.category}
            </Badge>
            <div className="flex items-center justify-between mt-auto pt-2">
              <span className="text-xl font-bold text-primary">
                {product.price.toFixed(2)} <span className="text-sm font-normal text-muted-foreground">{product.currency}</span>
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddToCart}
                disabled={addToCart.isPending}
                className="gap-1.5 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
