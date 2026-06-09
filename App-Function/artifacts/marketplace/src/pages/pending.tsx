import { ShieldAlert } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Pending() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6 border rounded-3xl p-8 bg-card shadow-sm">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-10 h-10 text-muted-foreground" />
        </div>
        
        <h1 className="font-serif text-3xl font-bold">Aguardando Aprovação</h1>
        
        <p className="text-muted-foreground">
          A sua conta foi criada com sucesso, mas a nossa equipa precisa de rever o seu perfil para garantir a segurança da plataforma antes que possa vender ou comprar.
        </p>
        
        <div className="pt-6">
          <Button asChild className="w-full">
            <Link href="/">Voltar à Página Principal</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
