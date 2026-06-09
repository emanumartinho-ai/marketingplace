import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useRegister } from "@workspace/api-client-react";
import { useAuthStore } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, User, Mail, Lock, Phone, MapPin } from "lucide-react";
import { ALL_COUNTRIES } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

export default function Register() {
  const [, navigate] = useLocation();
  const { setToken } = useAuthStore();
  const { toast } = useToast();
  const registerMutation = useRegister();

  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "", country: "", address: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.country) { toast({ title: "Seleciona um pais", variant: "destructive" }); return; }
    try {
      const result = await registerMutation.mutateAsync({ data: form });
      setToken((result as { token: string }).token);
      navigate("/");
      toast({ title: "Conta criada com sucesso!" });
    } catch (err: unknown) {
      const msg = (err as { data?: { error?: string } })?.data?.error ?? "Erro ao criar conta";
      toast({ title: msg, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-accent/70 to-primary/60 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="text-white max-w-md relative z-10"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-extrabold">GlobalMarket</span>
          </div>
          <h2 className="text-4xl font-bold mb-4 leading-tight">
            Junta-te a<br />nos hoje
          </h2>
          <p className="text-white/80 text-lg leading-relaxed">
            Cria a tua conta gratuita e comeca a comprar ou vender para todo o mundo.
          </p>
        </motion.div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md py-8"
        >
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-6 lg:hidden">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Globe className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-extrabold text-xl">Global<span className="text-primary">Market</span></span>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Criar conta</h1>
            <p className="text-muted-foreground">E gratuito e rapido</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nome completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="name" placeholder="O teu nome" className="pl-9"
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="o-teu@email.com" className="pl-9"
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Palavra-passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="password" type="password" placeholder="Minimo 6 caracteres" className="pl-9"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={6} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Telefone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="phone" placeholder="+351 912 345 678" className="pl-9"
                  value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Pais</Label>
              <Select value={form.country} onValueChange={v => setForm(f => ({ ...f, country: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleciona o teu pais" />
                </SelectTrigger>
                <SelectContent>
                  {ALL_COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address">Morada (opcional)</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="address" placeholder="Rua, cidade, codigo postal" className="pl-9"
                  value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
              </div>
            </div>
            <Button type="submit" className="w-full mt-2" disabled={registerMutation.isPending} size="lg">
              {registerMutation.isPending ? "A criar conta..." : "Criar conta gratuita"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Ja tens conta?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Entrar
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
