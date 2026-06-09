import { useListUsers, useApproveUser, useRejectUser } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

export default function Admin() {
  const { data: users, isLoading, refetch } = useListUsers();
  const approveMutation = useApproveUser();
  const rejectMutation = useRejectUser();
  const { toast } = useToast();

  const handleApprove = (id: string) => {
    approveMutation.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Sucesso", description: "Utilizador aprovado." });
        refetch();
      }
    });
  };

  const handleReject = (id: string) => {
    rejectMutation.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Sucesso", description: "Utilizador rejeitado." });
        refetch();
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl font-bold">Painel de Administração</h1>
        <Badge variant="outline" className="text-sm px-3 py-1">
          Acesso Restrito
        </Badge>
      </div>

      <div className="border rounded-2xl overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Nome</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium">Data de Registo</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-48" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-6 py-4 flex justify-end gap-2"><Skeleton className="h-8 w-20" /><Skeleton className="h-8 w-20" /></td>
                  </tr>
                ))
              ) : users?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    Nenhum utilizador encontrado.
                  </td>
                </tr>
              ) : (
                users?.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {u.email}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={u.approved ? "default" : "secondary"} className={!u.approved ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-100" : ""}>
                        {u.approved ? "Aprovado" : "Pendente"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {format(new Date(u.createdAt), "dd MMM yyyy", { locale: pt })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        {!u.approved && (
                          <Button 
                            size="sm" 
                            onClick={() => handleApprove(u.id)}
                            disabled={approveMutation.isPending || rejectMutation.isPending}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Aprovar
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleReject(u.id)}
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                        >
                          Rejeitar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
