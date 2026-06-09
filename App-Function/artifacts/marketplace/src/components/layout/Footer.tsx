import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="font-serif text-2xl font-bold text-primary block mb-4">
              Bisno Sem Fronteiras
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              O mercado que conecta a Europa e a África. Descubra produtos únicos de diversas culturas.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Descobrir</h3>
            <ul className="space-y-3">
              <li><Link href="/products" className="text-sm text-muted-foreground hover:text-primary transition-colors">Todos os Produtos</Link></li>
              <li><Link href="/products?featured=true" className="text-sm text-muted-foreground hover:text-primary transition-colors">Destaques</Link></li>
              <li><Link href="/products?region=EUROPA" className="text-sm text-muted-foreground hover:text-primary transition-colors">Europa</Link></li>
              <li><Link href="/products?region=AFRICA" className="text-sm text-muted-foreground hover:text-primary transition-colors">África</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Empresa</h3>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">Sobre Nós</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Carreiras</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Imprensa</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Suporte</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Ajuda & Contacto</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Envios & Devoluções</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Termos de Serviço</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Bisno Sem Fronteiras. Todos os direitos reservados.
          </p>
          <div className="flex gap-4">
            <span className="text-sm text-muted-foreground">Português (PT)</span>
            <span className="text-sm text-muted-foreground">EUR (€)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
