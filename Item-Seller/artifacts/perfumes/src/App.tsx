import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { motion, useScroll, useTransform } from "framer-motion";
import { ShoppingBag, MessageCircle, ChevronDown, Sparkles } from "lucide-react";

const queryClient = new QueryClient();

function LandingPage() {
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);

  const handleWhatsApp = (productName: string) => {
    const text = encodeURIComponent(`Olá! Gostaria de saber mais sobre o perfume ${productName}.`);
    window.open(`https://wa.me/351927605043?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-6 py-6 mix-blend-difference">
        <div className="text-xl font-serif tracking-widest text-primary-foreground">
          OUD & AMBER
        </div>
        <button className="text-primary-foreground hover:text-primary transition-colors">
          <ShoppingBag size={24} />
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div 
          style={{ opacity: heroOpacity, y: heroY }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-black/40 z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background z-10"></div>
          <img 
            src="/perfumes.jpeg" 
            alt="Luxury Oriental Perfumes" 
            className="w-full h-full object-cover object-center scale-105"
          />
        </motion.div>
        
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto mt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <span className="text-primary uppercase tracking-[0.3em] text-sm md:text-sm font-semibold mb-6 block">
              A Arte da Perfumaria Oriental
            </span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-5xl md:text-7xl lg:text-8xl font-serif text-white mb-6 leading-tight drop-shadow-2xl"
          >
            A Essência do <br/> <span className="text-primary italic">Luxo</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="text-muted-foreground text-lg md:text-xl font-light max-w-2xl mx-auto mb-12"
          >
            Descubra fragrâncias raras que contam histórias ancestrais, destiladas em frascos de puro requinte e sedução.
          </motion.p>
          <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ duration: 1, delay: 1.2 }}
          >
            <button 
              onClick={() => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 text-primary border border-primary/30 px-8 py-4 uppercase tracking-widest text-sm hover:bg-primary hover:text-primary-foreground transition-all duration-500"
            >
              Explorar Coleção
            </button>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2, repeat: Infinity, repeatType: "reverse" }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 text-primary/50"
        >
          <ChevronDown size={32} strokeWidth={1} />
        </motion.div>
      </section>

      {/* Collection Section */}
      <section id="collection" className="py-32 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-5xl font-serif mb-4">A Coleção Exclusiva</h2>
          <div className="h-px w-24 bg-primary/50 mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
          
          {/* Product 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="group cursor-pointer"
          >
            <div className="relative aspect-[4/5] mb-8 overflow-hidden bg-secondary/30 border border-white/5">
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
              <img
                src="/fakhama.jpeg"
                alt="Fakhama — Maison Asrar"
                className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            </div>
            <div className="text-center">
              <div className="text-primary text-sm uppercase tracking-widest mb-2">Maison Asrar</div>
              <h3 className="text-3xl font-serif mb-4">Fakhama</h3>
              <p className="text-muted-foreground font-light mb-6">
                Uma fragrância majestosa num frasco ornado com mandala em ouro. Notas ricas e complexas de oud, âmbar e especiarias quentes que evocam os mistérios das noites no deserto.
              </p>
              <div className="flex justify-center items-end gap-4 mb-8">
                <span className="text-2xl font-serif text-white">€58</span>
              </div>
              <button
                onClick={() => handleWhatsApp("Fakhama — Maison Asrar")}
                className="w-full md:w-auto bg-primary text-primary-foreground px-8 py-4 flex items-center justify-center gap-3 uppercase tracking-widest text-sm hover:bg-white transition-colors duration-300 mx-auto"
              >
                <MessageCircle size={18} />
                Encomendar
              </button>
            </div>
          </motion.div>

          {/* Product 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="group cursor-pointer md:mt-24"
          >
            <div className="relative aspect-[4/5] mb-8 overflow-hidden bg-secondary/30 border border-white/5">
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
              <img
                src="/shaghaf.jpeg"
                alt="Shaghaf Vanilla Toffee — Swiss Arabian"
                className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            </div>
            <div className="text-center">
              <div className="text-white/50 text-sm uppercase tracking-widest mb-2">Swiss Arabian</div>
              <h3 className="text-3xl font-serif mb-4">Shaghaf Vanilla Toffee</h3>
              <p className="text-muted-foreground font-light mb-6">
                Uma indulgência olfativa gourmand. Notas quentes de baunilha entrelaçadas com toffee derretido e madeiras preciosas, num frasco elegante de linhas retas.
              </p>
              <div className="flex justify-center items-end gap-4 mb-8">
                <span className="text-2xl font-serif text-white">€45</span>
              </div>
              <button 
                onClick={() => handleWhatsApp("Shaghaf Vanilla Toffee")}
                className="w-full md:w-auto bg-transparent border border-primary text-primary px-8 py-4 flex items-center justify-center gap-3 uppercase tracking-widest text-sm hover:bg-primary hover:text-primary-foreground transition-all duration-300 mx-auto"
              >
                <MessageCircle size={18} />
                Encomendar
              </button>
            </div>
          </motion.div>

        </div>
      </section>

      {/* About Section */}
      <section className="relative py-32 bg-secondary/50 border-y border-white/5">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <Sparkles className="text-primary mx-auto mb-8 opacity-50" size={32} />
            <h2 className="text-4xl font-serif mb-8 text-white">Sobre as Fragrâncias</h2>
            <p className="text-xl md:text-2xl text-muted-foreground font-serif italic leading-relaxed mb-12">
              "A verdadeira perfumaria oriental não é apenas sobre o aroma; é uma alquimia que toca a alma. Cada gota carrega séculos de tradição, destilando resinas raras, madeiras preciosas e especiarias em puro ouro líquido."
            </p>
            <div className="grid grid-cols-3 gap-6 text-sm uppercase tracking-widest text-primary/70">
              <div>Longevidade</div>
              <div>Projeção</div>
              <div>Exclusividade</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer / Contact */}
      <footer className="py-24 px-6 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-3xl font-serif mb-6">Atendimento Personalizado</h2>
          <p className="text-muted-foreground mb-10 font-light">
            Garantimos a autenticidade e a qualidade de cada frasco. Entre em contacto diretamente para aconselhamento olfativo e reservas.
          </p>
          <button 
            onClick={() => handleWhatsApp("Informações Gerais")}
            className="inline-flex items-center gap-3 bg-white text-black px-10 py-5 uppercase tracking-widest text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-all duration-300"
          >
            <MessageCircle size={20} />
            Contactar no WhatsApp
          </button>
          
          <div className="mt-24 pt-8 border-t border-white/10 text-white/30 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
            <div>© 2024 Oud & Amber. Todos os direitos reservados.</div>
            <div className="flex gap-6 uppercase tracking-widest text-xs">
              <a href="#" className="hover:text-primary transition-colors">Instagram</a>
              <a href="#" className="hover:text-primary transition-colors">Termos</a>
            </div>
          </div>
        </motion.div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LandingPage />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
