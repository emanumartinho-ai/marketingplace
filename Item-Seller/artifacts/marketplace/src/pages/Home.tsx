import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useGetFeaturedProducts, useGetCategories, useListProducts } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ProductCard";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowRight, Globe, TrendingUp, ShieldCheck, Truck } from "lucide-react";
import { COUNTRIES_EUROPE, COUNTRIES_AFRICA } from "@/lib/constants";

export default function Home() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("");

  const { data: featured = [] } = useGetFeaturedProducts();
  const { data: categories = [] } = useGetCategories();
  const { data: products = [] } = useListProducts(
    selectedCountry ? { country: selectedCountry } : undefined,
    { query: { enabled: !!selectedCountry } }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?search=${encodeURIComponent(search)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-secondary/80 text-white py-20 px-4">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='40' cy='40' r='3'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-4 bg-white/20 text-white border-white/30 text-sm px-4 py-1">
              Europa + Africa em um so lugar
            </Badge>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 leading-tight">
              O mercado<br />
              <span className="text-secondary">sem fronteiras</span>
            </h1>
            <p className="text-white/80 text-xl mb-10 max-w-2xl mx-auto">
              Compra produtos unicos de Angola, Nigeria, Portugal, Franca e muito mais.
              Tudo num so lugar.
            </p>
            <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="O que procuras?"
                  className="pl-10 h-12 bg-white text-foreground border-0 text-base"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <Button type="submit" size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 h-12 px-6 font-semibold">
                Pesquisar
              </Button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-card border-b border-border py-6">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-3 gap-4 text-center">
          {[
            { icon: Globe, label: "18+ paises" },
            { icon: ShieldCheck, label: "Compra segura" },
            { icon: Truck, label: "Envio rapido" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col sm:flex-row items-center justify-center gap-2 text-muted-foreground">
              <Icon className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Categorias</h2>
            <Link href="/products">
              <Button variant="ghost" size="sm" className="gap-1 text-primary">
                Ver todos <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {(categories as { category: string; count: number }[]).map((cat, i) => (
              <motion.div
                key={cat.category}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/products?category=${encodeURIComponent(cat.category)}`}>
                  <Badge
                    variant="outline"
                    className="px-4 py-2 text-sm font-medium cursor-pointer hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                  >
                    {cat.category}
                    <span className="ml-1.5 text-xs opacity-60">({cat.count})</span>
                  </Badge>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {(featured as unknown[]).length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12 pt-0">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Em Destaque</h2>
            </div>
            <Link href="/products">
              <Button variant="ghost" size="sm" className="gap-1 text-primary">
                Ver todos <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {(featured as {
              id: number; title: string; price: number; currency: string;
              category: string; country: string; imageUrl?: string | null; isFeatured?: boolean;
            }[]).map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Countries Filter */}
      <section className="bg-muted/30 border-y border-border py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground mb-6">Explorar por pais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Europa</h3>
              <div className="flex flex-wrap gap-2">
                {COUNTRIES_EUROPE.map(c => (
                  <button
                    key={c}
                    onClick={() => setSelectedCountry(selectedCountry === c ? "" : c)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                      selectedCountry === c
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border hover:border-primary hover:text-primary"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Africa</h3>
              <div className="flex flex-wrap gap-2">
                {COUNTRIES_AFRICA.map(c => (
                  <button
                    key={c}
                    onClick={() => setSelectedCountry(selectedCountry === c ? "" : c)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                      selectedCountry === c
                        ? "bg-accent text-accent-foreground border-accent"
                        : "bg-card border-border hover:border-accent hover:text-accent"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {selectedCountry && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8"
            >
              <h3 className="text-lg font-semibold mb-4">Produtos de {selectedCountry}</h3>
              {(products as unknown[]).length === 0 ? (
                <p className="text-muted-foreground">Nenhum produto de {selectedCountry} ainda.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {(products as {
                    id: number; title: string; price: number; currency: string;
                    category: string; country: string; imageUrl?: string | null; isFeatured?: boolean;
                  }[]).slice(0, 8).map((p, i) => (
                    <ProductCard key={p.id} product={p} index={i} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-foreground mb-3">Tens algo para vender?</h2>
          <p className="text-muted-foreground mb-6 text-lg">
            Publica o teu anuncio em segundos e alcanca compradores em toda a Europa e Africa.
          </p>
          <Link href="/sell">
            <Button size="lg" className="gap-2 px-8">
              Comecar a vender <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
