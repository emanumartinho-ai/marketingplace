import { Link } from "wouter";
import { Product } from "@workspace/api-client-react/src/generated/api.schemas";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  // Format price
  const formattedPrice = new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: product.currency || "EUR",
  }).format(product.price);

  return (
    <Link href={`/products/${product.id}`} className="group flex flex-col h-full rounded-xl overflow-hidden border bg-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="relative aspect-square overflow-hidden bg-muted">
        {product.featured && (
          <Badge className="absolute top-3 left-3 z-10 bg-accent text-accent-foreground border-none font-semibold px-2.5 py-0.5 shadow-sm">
            Destaque
          </Badge>
        )}
        <div className="absolute top-3 right-3 z-10">
          <Badge variant="outline" className="bg-background/80 backdrop-blur-sm border-white/20 text-xs gap-1 py-1">
            <MapPin className="w-3 h-3" />
            {product.country}
          </Badge>
        </div>
        <img 
          src={product.imageUrl || `https://placehold.co/400x400/f5e8d3/2a2522?text=${encodeURIComponent(product.name)}`} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      
      <div className="flex flex-col flex-1 p-5">
        <div className="text-xs font-medium text-muted-foreground mb-2 tracking-wide uppercase">
          {product.category}
        </div>
        <h3 className="font-serif text-lg font-medium text-card-foreground leading-tight mb-2 line-clamp-2">
          {product.name}
        </h3>
        
        <div className="mt-auto flex items-end justify-between pt-4">
          <div className="text-lg font-bold text-primary">
            {formattedPrice}
          </div>
        </div>
      </div>
    </Link>
  );
}
