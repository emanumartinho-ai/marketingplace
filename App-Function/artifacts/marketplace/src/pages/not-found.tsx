import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="font-serif text-8xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-2xl font-bold mb-4">Página Não Encontrada</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        Parece que se perdeu neste grande mercado. A página que procura não existe ou foi movida.
      </p>
      <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
        <Link href="/">Voltar à Página Principal</Link>
      </Button>
    </div>
  );
}
