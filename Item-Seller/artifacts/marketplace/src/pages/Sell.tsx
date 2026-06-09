import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useCreateProduct } from "@workspace/api-client-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuthStore } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Image, DollarSign } from "lucide-react";
import { ALL_COUNTRIES } from "@/lib/constants";
import { Link } from "wouter";

const CATEGORIES = [
  "Telefones",
  "Computadores",
  "Relogios",
  "Smartwatches",
  "Fios de Ouro",
  "Fios de Prata",
  "Cosmeticos",
];

export default function Sell() {
  const { token } = useAuthStore();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const createProduct = useCreateProduct();

  const [form, setForm] = useState({
    title: "", description: "", price: "", currency: "EUR", category: "",
    country: "", stock: "1", imageUrl: "", shippingInfo: "", isFeatured: false,
  });

  if (!token) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="text-center py-20">
          <p className="text-xl text-muted-foreground mb-4">Inicia sessao para vender produtos</p>
          <Link href="/login"><Button>Entrar</Button></Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category) { toast({ title: "Seleciona uma categoria", variant: "destructive" }); return; }
    if (!form.country) { toast({ title: "Seleciona o pais de origem", variant: "destructive" }); return; }
    try {
      const product = await createProduct.mutateAsync({
        data: {
          title: form.title,
          description: form.description,
          price: Number(form.price),
          currency: form.currency,
          category: form.category,
          country: form.country,
          stock: Number(form.stock),
          imageUrl: form.imageUrl || undefined,
          shippingInfo: form.shippingInfo || undefined,
          isFeatured: form.isFeatured,
        },
      });
      toast({ title: "Produto publicado com sucesso!" });
      navigate(`/products/${(product as { id: number }).id}`);
    } catch (err: unknown) {
      const msg = (err as { data?: { error?: string } })?.data?.error ?? "Erro ao publicar produto";
      toast({ title: msg, variant: "destructive" });
    }
  };

  const f = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-1">Publicar produto</h1>
            <p className="text-muted-foreground">Preenche os detalhes do teu produto</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="font-semibold text-foreground">Informacao basica</h2>
              <div className="space-y-1.5">
                <Label htmlFor="title">Titulo do produto *</Label>
                <Input id="title" placeholder="Ex: Cesta artesanal de vime" value={form.title} onChange={f("title")} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="desc">Descricao *</Label>
                <Textarea id="desc" placeholder="Descreve o teu produto em detalhe..." rows={4}
                  value={form.description} onChange={f("description")} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Categoria *</Label>
                  <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                    <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Pais de origem *</Label>
                  <Select value={form.country} onValueChange={v => setForm(p => ({ ...p, country: v }))}>
                    <SelectTrigger><SelectValue placeholder="Pais" /></SelectTrigger>
                    <SelectContent>
                      {ALL_COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" /> Preco e stock
              </h2>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="price">Preco *</Label>
                  <Input id="price" type="number" step="0.01" min="0" placeholder="0.00"
                    value={form.price} onChange={f("price")} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Moeda</Label>
                  <Select value={form.currency} onValueChange={v => setForm(p => ({ ...p, currency: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="stock">Quantidade em stock</Label>
                <Input id="stock" type="number" min="1" value={form.stock} onChange={f("stock")} />
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <Image className="w-4 h-4 text-primary" /> Imagem e envio
              </h2>
              <div className="space-y-1.5">
                <Label htmlFor="imageUrl">URL da imagem</Label>
                <Input id="imageUrl" type="url" placeholder="https://..." value={form.imageUrl} onChange={f("imageUrl")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="shipping">Informacao de envio</Label>
                <Input id="shipping" placeholder="Ex: Envio em 3-5 dias uteis" value={form.shippingInfo} onChange={f("shippingInfo")} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Produto em destaque</Label>
                  <p className="text-xs text-muted-foreground">Aparece na pagina inicial</p>
                </div>
                <Switch checked={form.isFeatured} onCheckedChange={v => setForm(p => ({ ...p, isFeatured: v }))} />
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full gap-2" disabled={createProduct.isPending}>
              <PlusCircle className="w-5 h-5" />
              {createProduct.isPending ? "A publicar..." : "Publicar produto"}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
