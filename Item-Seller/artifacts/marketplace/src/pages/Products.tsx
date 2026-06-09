import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useListProducts, useGetCategories } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ProductCard";
import { Navbar } from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { ALL_COUNTRIES } from "@/lib/constants";

export default function Products() {
  const params = new URLSearchParams(window.location.search);
  const [search, setSearch] = useState(params.get("search") ?? "");
  const [country, setCountry] = useState(params.get("country") ?? "all");
  const [category, setCategory] = useState(params.get("category") ?? "all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const queryParams: Record<string, string | number> = {};
  if (debouncedSearch) queryParams.search = debouncedSearch;
  if (country && country !== "all") queryParams.country = country;
  if (category && category !== "all") queryParams.category = category;
  if (minPrice) queryParams.minPrice = Number(minPrice);
  if (maxPrice) queryParams.maxPrice = Number(maxPrice);

  const { data: products = [], isLoading } = useListProducts(Object.keys(queryParams).length ? queryParams : undefined);
  const { data: categories = [] } = useGetCategories();

  const clearFilters = () => {
    setSearch(""); setCountry("all"); setCategory("all"); setMinPrice(""); setMaxPrice("");
  };

  const hasFilters = search || (country && country !== "all") || (category && category !== "all") || minPrice || maxPrice;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-6">Todos os Produtos</h1>

          {/* Filters */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <SlidersHorizontal className="w-4 h-4" />
              Filtros
              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto gap-1 text-muted-foreground h-7">
                  <X className="w-3 h-3" /> Limpar
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="relative sm:col-span-2 lg:col-span-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Pesquisar..." className="pl-9" value={search}
                  onChange={e => setSearch(e.target.value)} />
              </div>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger><SelectValue placeholder="Pais" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os paises</SelectItem>
                  {ALL_COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {(categories as { category: string }[]).map(c => (
                    <SelectItem key={c.category} value={c.category}>{c.category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Input placeholder="Min €" value={minPrice} type="number"
                  onChange={e => setMinPrice(e.target.value)} />
                <Input placeholder="Max €" value={maxPrice} type="number"
                  onChange={e => setMaxPrice(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {/* Active filters */}
        {hasFilters && (
          <div className="flex flex-wrap gap-2 mb-4">
            {debouncedSearch && <Badge variant="secondary" className="gap-1">"{debouncedSearch}" <X className="w-3 h-3 cursor-pointer" onClick={() => setSearch("")} /></Badge>}
            {country && country !== "all" && <Badge variant="secondary" className="gap-1">{country} <X className="w-3 h-3 cursor-pointer" onClick={() => setCountry("all")} /></Badge>}
            {category && category !== "all" && <Badge variant="secondary" className="gap-1">{category} <X className="w-3 h-3 cursor-pointer" onClick={() => setCategory("all")} /></Badge>}
          </div>
        )}

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-xl overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-8 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (products as unknown[]).length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-xl font-semibold text-foreground mb-2">Nenhum produto encontrado</p>
            <p className="text-muted-foreground">Tenta alterar os filtros de pesquisa</p>
            {hasFilters && <Button variant="outline" className="mt-4" onClick={clearFilters}>Limpar filtros</Button>}
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              {(products as unknown[]).length} produto{(products as unknown[]).length !== 1 ? "s" : ""} encontrado{(products as unknown[]).length !== 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {(products as {
                id: number; title: string; price: number; currency: string;
                category: string; country: string; imageUrl?: string | null; isFeatured?: boolean;
              }[]).map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
