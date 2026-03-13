import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { History, Trash2, ArrowRight, Share2, Globe, Lock } from "lucide-react";
import { SimulationRecord } from "@shared/types";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
interface HistoryDrawerProps {
  onLoad: (record: SimulationRecord) => void;
}
export function HistoryDrawer({ onLoad }: HistoryDrawerProps) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['simulations'],
    queryFn: () => api<{ items: SimulationRecord[] }>('/api/simulations'),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/api/simulations/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['simulations'] });
      toast.success("Registro removido.");
    }
  });
  const togglePublicMutation = useMutation({
    mutationFn: ({ id, isPublic }: { id: string, isPublic: boolean }) => 
      api(`/api/simulations/${id}`, { method: 'PATCH', body: JSON.stringify({ isPublic }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['simulations'] })
  });
  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}?id=${id}`;
    navigator.clipboard.writeText(url);
    toast.success("Link de compartilhamento copiado!");
  };
  const simulations = data?.items ?? [];
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <History className="w-4 h-4" /> Histórico
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[500px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Simulações Salvas</SheetTitle>
          <SheetDescription>Acesse e gerencie diagnósticos comerciais anteriores.</SheetDescription>
        </SheetHeader>
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)
          ) : simulations.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">Nenhuma simulação encontrada.</div>
          ) : (
            simulations.map((record) => (
              <div key={record.id} className="p-4 border rounded-xl hover:bg-slate-50 transition-colors group relative">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-sm truncate max-w-[200px]">{record.inputs.companyName || "Sem nome"}</h4>
                    <p className="text-[10px] text-muted-foreground">
                      {format(record.timestamp, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopyLink(record.id)}>
                      <Share2 className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteMutation.mutate(record.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px] uppercase">{record.result.recommendedPlan}</Badge>
                    <span className="text-xs font-bold">{formatCurrency(record.result.totalMonthly)}</span>
                  </div>
                  <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => onLoad(record)}>
                    Abrir <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
                <div className="mt-3 pt-3 border-t flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    {record.isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                    Público
                  </div>
                  <Switch 
                    checked={!!record.isPublic} 
                    onCheckedChange={(val) => togglePublicMutation.mutate({ id: record.id, isPublic: val })}
                    className="scale-75"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}