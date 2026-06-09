import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search as SearchIcon, SlidersHorizontal, X } from "lucide-react";
import { 
  useListProducts, 
  useListCategories,
  useListCountries
} from "@workspace/api-client-react";

export default function Products() {
  const [location, setLocation] = useLocation();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  
  const categoryFilter = searchParams.get("category") || undefined;
  const countryFilter = searchParams.get("country") || undefined;
  const searchFilter = searchParams.get("search") || undefined;
  const regionFilter = searchParams.get("region") || undefined;
  const featuredFilter = searchParams.get("featured") === "true";

  const [searchInput, setSearchInput] = useState(searchFilter || "");

  const { data: products, isLoading } = useListProducts({
    category: categoryFilter,
    country: countryFilter,
    search: searchFilter,
    region: regionFilter,
    featured: featuredFilter ? true : undefined
  });

  const { data: categories } = useListCategories();
  const { data: countries } = useListCountries();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchString);
    if (searchInput.trim()) {
      params.set("search", searchInput.trim());
    } else {
      params.delete("search");
    }
    setLocation(`/products?${params.toString()}`);
  };

  const clearFilters = () => {
    setLocation("/products");
    setSearchInput("");
  };

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchString);
    if (params.get(key) === value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    setLocation(`/products?${params.toString()}`);
  };

  const hasActiveFilters = categoryFilter || countryFilter || searchFilter || regionFilter || featuredFilter;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 flex flex-col md:flex-row gap-8">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 flex-shrink-0">
        <div className="sticky top-24 space-y-8">
          <div>
            <h1 className="font-serif text-3xl font-bold mb-6">Produtos</h1>
            <form onSubmit={handleSearch} className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Pesquisar..."
                className="pl-9 pr-4 bg-muted/50 border-border"
              />
            </form>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center justify-between pb-4 border-b border-border/50">
              <span className="text-sm font-medium">Filtros Ativos</span>
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground">
                Limpar todos
              </Button>
            </div>
          )}

          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider text-muted-foreground">
              <SlidersHorizontal className="h-4 w-4" /> Categorias
            </h3>
            <div className="space-y-2">
              {categories?.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => updateFilter("category", cat.name)}
                  className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    categoryFilter === cat.name 
                      ? "bg-primary text-primary-foreground font-medium" 
                      : "hover:bg-muted text-foreground"
                  }`}
                >
                  {cat.name} <span className="opacity-60 text-xs ml-1">({cat.productCount})</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">
              Países
            </h3>
            <div className="max-h-64 overflow-y-auto pr-2 space-y-1 scrollbar-thin">
              {countries?.map((country) => (
                <button
                  key={country.name}
                  onClick={() => updateFilter("country", country.name)}
                  className={`block w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${
                    countryFilter === country.name 
                      ? "bg-secondary text-secondary-foreground font-medium" 
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {country.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <div className="mb-6 flex justify-between items-center">
          <p className="text-muted-foreground text-sm">
            {products ? `${products.length} produtos encontrados` : "A carregar produtos..."}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col gap-3">
                <Skeleton className="aspect-square rounded-xl" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-1/4 mt-2" />
              </div>
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center border rounded-2xl bg-muted/30">
            <div className="w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
              <SearchIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Nenhum produto encontrado</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Não encontrámos produtos que correspondam aos seus filtros. Tente remover alguns filtros ou pesquisar por outra palavra.
            </p>
            <Button onClick={clearFilters} variant="outline">
              Limpar Filtros
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
