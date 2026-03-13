import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { History, Trash2, ArrowRight } from "lucide-react";
import { SimulationRecord } from "@shared/types";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";
interface HistoryDrawerProps {
  onLoad: (record: SimulationRecord) => void;
}
export function HistoryDrawer({ onLoad }: HistoryDrawerProps) {
  const [history, setHistory] = React.useState<SimulationRecord[]>([]);
  const loadHistory = () => {
    const saved = localStorage.getItem('dealdesk_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  };
  const clearHistory = () => {
    localStorage.removeItem('dealdesk_history');
    setHistory([]);
  };
  return (
    <Sheet onOpenChange={(open) => open && loadHistory()}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <History className="w-4 h-4" /> Histórico
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader className="flex flex-row items-center justify-between mb-6">
          <SheetTitle>Simulações Recentes</SheetTitle>
          {history.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearHistory} className="text-destructive hover:text-destructive">
              <Trash2 className="w-4 h-4 mr-1" /> Limpar
            </Button>
          )}
        </SheetHeader>
        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">Nenhuma simulação salva localmente.</div>
          ) : (
            history.map((record) => (
              <div key={record.id} className="p-4 border rounded-xl hover:border-primary/50 transition-colors group">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-slate-900">{record.inputs.companyName || "Lead sem nome"}</h4>
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