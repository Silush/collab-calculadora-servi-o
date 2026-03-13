import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { History, Trash2, ArrowRight, Loader2 } from "lucide-react";
import { SimulationRecord } from "@shared/types";
import { Badge } from "@/components/ui/badge";
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
  const { data, isLoading, error } = useQuery({
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
  const simulations = data?.items ?? [];
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <History className="w-4 h-4" /> Histórico
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader className="flex flex-row items-center justify-between mb-6">
          <SheetTitle>Simulações Recentes</SheetTitle>
        </SheetHeader>
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))
          ) : error ? (
            <div className="text-center py-10 text-destructive text-sm font-medium">
              Erro ao carregar histórico: {(error as Error).message}
            </div>
          ) : simulations.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">Nenhuma simulação salva.</div>
          ) : (
            simulations.map((record) => (
              <div key={record.id} className="p-4 border rounded-xl hover:border-primary/50 transition-colors group relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                  onClick={() => deleteMutation.mutate(record.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <div className="flex justify-between items-start mb-2 pr-8">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100">{record.inputs.companyName || "Lead sem nome"}</h4>
                    <p className="text-xs text-muted-foreground">
                      {format(record.timestamp, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {record.result.recommendedPlan}
                  </Badge>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm font-bold text-primary">
                    {formatCurrency(record.result.totalMonthly)}
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => onLoad(record)} className="group-hover:bg-primary group-hover:text-white transition-all">
                    Carregar <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}