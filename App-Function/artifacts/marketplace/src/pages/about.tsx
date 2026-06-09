import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function About() {
  return (
    <div>
      <div className="bg-secondary text-secondary-foreground py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6">A Nossa Missão</h1>
          <p className="text-xl max-w-2xl mx-auto opacity-80">
            Ligar continentes através do comércio. O Bisno Sem Fronteiras nasceu com o propósito de criar uma ponte direta entre os talentos da Europa e a riqueza cultural de África.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-serif text-3xl font-bold mb-6">Uma Viagem Sem Fronteiras</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Acreditamos que cada produto conta uma história — a história de quem o fez, do material de que é feito, e do lugar de onde vem.
              </p>
              <p>
                No Bisno Sem Fronteiras, não somos apenas uma loja online. Somos um bazaar cosmopolita, um mercado vibrante onde as fronteiras se esbatem e o comércio se torna uma troca cultural rica e significativa.
              </p>
              <p>
                Desde os fios de ouro finamente trabalhados na Europa até aos cosméticos naturais inovadores de África, a nossa seleção é cuidada, autêntica e representativa do orgulho de cada nação.
              </p>
            </div>
            <div className="mt-8">
              <Button asChild className="bg-primary text-white">
                <Link href="/products">Descubra os Nossos Produtos</Link>
              </Button>
            </div>
          </div>
          <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1523365280205-593b4e9f90be?q=80&w=1500&auto=format&fit=crop" 
              alt="Pessoas no mercado" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
