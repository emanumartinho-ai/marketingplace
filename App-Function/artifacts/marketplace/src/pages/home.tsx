import { Link } from "wouter";
import { ArrowRight, Globe2, Compass, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  useListFeaturedProducts, 
  useGetMarketplaceSummary,
  useListCategories
} from "@workspace/api-client-react";

export default function Home() {
  const { data: featuredProducts, isLoading: isLoadingFeatured } = useListFeaturedProducts();
  const { data: summary } = useGetMarketplaceSummary();
  const { data: categories } = useListCategories();

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative w-full h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/40 z-10" />
          <img 
            src="/hero.png" 
            alt="Mercado vibrante" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="relative z-20 container mx-auto px-4 text-center text-white">
          <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 max-w-4xl mx-auto leading-tight drop-shadow-lg">
            Um mercado vivo que conecta culturas.
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto font-light drop-shadow-md">
            Descubra produtos únicos, artesanais e autênticos. Da Europa a África, o Bisno Sem Fronteiras traz o mundo até si.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-base rounded-full px-8 bg-primary hover:bg-primary/90 text-white border-0" asChild>
              <Link href="/products">
                Explorar Produtos
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base rounded-full px-8 bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm" asChild>
              <Link href="/about">A Nossa Missão</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats / Bar */}
      {summary && (
        <section className="bg-secondary text-secondary-foreground py-10 border-y border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-border/20">
              <div className="flex flex-col items-center">
                <span className="font-serif text-3xl font-bold text-primary mb-1">{summary.totalProducts}+</span>
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Produtos</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-serif text-3xl font-bold text-primary mb-1">{summary.totalCountries}</span>
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Países</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-serif text-3xl font-bold text-primary mb-1">{summary.totalCategories}</span>
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Categorias</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-serif text-3xl font-bold text-primary mb-1">2</span>
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Continentes</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-20 md:py-28 container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <span className="text-primary font-medium tracking-wider uppercase text-sm mb-2 block">Seleção Especial</span>
            <h2 className="font-serif text-4xl font-bold text-foreground">Destaques do Mercado</h2>
          </div>
          <Button variant="ghost" className="group" asChild>
            <Link href="/products?featured=true">
              Ver todos os destaques 
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        {isLoadingFeatured ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col gap-3">
                <Skeleton className="aspect-square rounded-xl" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-1/4 mt-2" />
              </div>
            ))}
          </div>
        ) : featuredProducts && featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/50 rounded-2xl border border-dashed">
            <p className="text-muted-foreground">Nenhum produto em destaque de momento.</p>
          </div>
        )}
      </section>

      {/* Regions Browse */}
      <section className="bg-muted py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold text-foreground mb-4">Explore por Região</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Viaje através do nosso catálogo escolhendo a sua origem preferida. Uma ponte comercial unindo talentos europeus e riqueza africana.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Link href="/products?region=AFRICA" className="group relative rounded-2xl overflow-hidden aspect-[16/9] md:aspect-[4/3] flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10 transition-opacity group-hover:opacity-80" />
              <img src="https://images.unsplash.com/photo-1547471080-7fc2caa6f5bc?q=80&w=2000&auto=format&fit=crop" alt="África" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
              <div className="relative z-20 text-center text-white p-6">
                <Globe2 className="w-12 h-12 mx-auto mb-4 opacity-80" />
                <h3 className="font-serif text-4xl md:text-5xl font-bold mb-2">África</h3>
                <p className="text-white/80 font-medium">Angola, Moçambique, Nigéria e mais</p>
                <div className="mt-6 inline-flex items-center text-sm font-bold uppercase tracking-wider border-b-2 border-primary pb-1 group-hover:text-primary transition-colors">
                  Explorar continente
                </div>
              </div>
            </Link>

            <Link href="/products?region=EUROPA" className="group relative rounded-2xl overflow-hidden aspect-[16/9] md:aspect-[4/3] flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10 transition-opacity group-hover:opacity-80" />
              <img src="https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=2000&auto=format&fit=crop" alt="Europa" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
              <div className="relative z-20 text-center text-white p-6">
                <Compass className="w-12 h-12 mx-auto mb-4 opacity-80" />
                <h3 className="font-serif text-4xl md:text-5xl font-bold mb-2">Europa</h3>
                <p className="text-white/80 font-medium">Portugal, França, Suíça e mais</p>
                <div className="mt-6 inline-flex items-center text-sm font-bold uppercase tracking-wider border-b-2 border-primary pb-1 group-hover:text-primary transition-colors">
                  Explorar continente
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl font-bold text-foreground mb-4">Categorias Populares</h2>
          <p className="text-muted-foreground">Encontre o que procura nas nossas secções mais visitadas</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {categories?.map((cat) => (
            <Link key={cat.name} href={`/products?category=${encodeURIComponent(cat.name)}`} className="group flex flex-col items-center justify-center p-6 text-center border rounded-2xl hover:border-primary hover:bg-primary/5 transition-all">
              <div className="w-16 h-16 rounded-full bg-secondary text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">{cat.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{cat.productCount} produtos</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
