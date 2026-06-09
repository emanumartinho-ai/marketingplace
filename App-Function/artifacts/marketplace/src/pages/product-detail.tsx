import { useParams, useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { MapPin, ShoppingBag, ArrowLeft, ShieldCheck, Truck } from "lucide-react";
import { useGetProduct, useCreateOrder } from "@workspace/api-client-react";
import { useAuth } from "@workspace/replit-auth-web";
import { useGetMe } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const productId = parseInt(id || "0", 10);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { isAuthenticated } = useAuth();
  const { data: userProfile } = useGetMe({
    query: { enabled: isAuthenticated }
  });

  const { data: product, isLoading, isError } = useGetProduct(productId, {
    query: {
      enabled: !!productId,
    }
  });

  const createOrderMutation = useCreateOrder();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="grid md:grid-cols-2 gap-12">
          <Skeleton className="aspect-square rounded-2xl w-full" />
          <div className="space-y-6">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-8 w-1/4" />
            <Separator />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold mb-4">Produto não encontrado</h2>
        <p className="text-muted-foreground mb-8">O produto que procura não existe ou foi removido.</p>
        <Button asChild>
          <Link href="/products">Voltar para Produtos</Link>
        </Button>
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: product.currency || "EUR",
  }).format(product.price);

  const handleBuy = () => {
    createOrderMutation.mutate(
      { data: { productId: product.id } },
      {
        onSuccess: (order) => {
          toast({
            title: "Encomenda criada",
            description: "A sua encomenda foi criada com sucesso.",
          });
          setLocation(`/orders/${order.id}`);
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Erro",
            description: "Não foi possível criar a encomenda. Tente novamente.",
          });
        }
      }
    );
  };

  const isApproved = isAuthenticated && userProfile?.approved;
  const isOwnProduct = isAuthenticated && userProfile?.id === product.sellerId;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Link href="/products" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar aos produtos
      </Link>

      <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
        {/* Images */}
        <div className="relative rounded-2xl overflow-hidden bg-muted aspect-square border shadow-sm">
          {product.featured && (
            <Badge className="absolute top-4 left-4 z-10 bg-accent text-accent-foreground border-none font-semibold px-3 py-1 shadow-sm text-sm">
              Destaque
            </Badge>
          )}
          <img 
            src={product.imageUrl || `https://placehold.co/800x800/eeeeee/111111?text=${encodeURIComponent(product.name)}`} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <Link href={`/products?category=${product.category}`} className="text-sm font-semibold tracking-wider uppercase text-primary hover:underline">
              {product.category}
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href={`/products?country=${product.country}`} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
              <MapPin className="mr-1 h-3.5 w-3.5" />
              {product.country}
            </Link>
          </div>

          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2 leading-tight">
            {product.name}
          </h1>

          {product.sellerName && (
            <p className="text-muted-foreground mb-6">
              Vendido por <span className="font-medium text-foreground">{product.sellerName}</span>
            </p>
          )}
          
          <div className="text-3xl font-bold text-foreground mb-8">
            {formattedPrice}
          </div>

          <Separator className="mb-8" />

          <div className="prose prose-sm md:prose-base text-muted-foreground mb-10">
            <p className="leading-relaxed">
              {product.description || "Sem descrição disponível."}
            </p>
          </div>

          <div className="mt-auto space-y-4">
            {isOwnProduct ? (
              <Button size="lg" className="w-full h-14 text-lg rounded-xl" disabled>
                O seu produto
              </Button>
            ) : isApproved ? (
              <Button 
                size="lg" 
                className="w-full h-14 text-lg bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
                onClick={handleBuy}
                disabled={createOrderMutation.isPending}
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                {createOrderMutation.isPending ? "A processar..." : "Comprar Agora"}
              </Button>
            ) : isAuthenticated ? (
              <Button size="lg" className="w-full h-14 text-lg rounded-xl" disabled>
                Aguardando aprovação para comprar
              </Button>
            ) : (
              <Button size="lg" className="w-full h-14 text-lg rounded-xl" asChild>
                <Link href="/login">Entrar para Comprar</Link>
              </Button>
            )}
            
            <div className="bg-secondary/50 p-4 rounded-lg mt-6 border">
              <p className="text-sm font-medium flex items-center gap-2 mb-1">
                <ShieldCheck className="h-4 w-4" />
                Proteção do Comprador
              </p>
              <p className="text-xs text-muted-foreground">
                O pagamento fica retido até confirmares a entrega. Só liberta quando tu aprovares.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
