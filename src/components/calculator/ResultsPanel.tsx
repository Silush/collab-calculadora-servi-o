import React from 'react';
import { PricingResult } from '@shared/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, AlertTriangle, Copy, Zap, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
interface ResultsPanelProps {
  result: PricingResult;
  companyName: string;
}
export function ResultsPanel({ result, companyName }: ResultsPanelProps) {
  const copyProposal = () => {
    const text = `PROPOSTA COMERCIAL - COLLAB DEALDESK
Cliente: ${companyName || 'Lead Diagnosticado'}
Plano Recomendado: ${result.recommendedPlan.toUpperCase()}
INVESTIMENTO:
Mensalidade: ${formatCurrency(result.totalMonthly)}
Implantação: ${formatCurrency(result.setupFee)}
JUSTIFICATIVA COMERCIAL:
${result.arguments.map(a => `- ${a}`).join('\n')}
COMPOSIÇÃO:
${result.breakdown.map(b => `- ${b.label}: ${formatCurrency(b.value)}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    toast.success("Proposta copiada para o clipboard!");
  };
  const planStyles = {
    essential: 'border-slate-300 ring-slate-400/20 bg-slate-50',
    business: 'border-blue-300 ring-blue-400/20 bg-blue-50/30',
    premium: 'border-emerald-500 ring-emerald-400/30 bg-emerald-50/50',
  };
  return (
    <div className="sticky top-24 space-y-6">
      <Card className={`overflow-hidden border-2 shadow-xl transition-all duration-500 ${planStyles[result.recommendedPlan]}`}>
        {result.recommendedPlan === 'premium' && (
          <div className="bg-emerald-600 text-white text-[10px] font-bold py-1 text-center uppercase tracking-widest animate-pulse">
            Melhor Custo-Benefício Identificado
          </div>
        )}
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <Badge className="px-3 py-1 text-sm font-bold uppercase tracking-wider bg-primary">
              {result.recommendedPlan}
            </Badge>
            {result.savingsVsIndividual && (
              <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs">
                <Zap className="w-3 h-3 fill-emerald-600" /> Economia {formatCurrency(result.savingsVsIndividual)}
              </div>
            )}
          </div>
          <CardTitle className="text-4xl font-black pt-6 flex items-baseline gap-1">
            {formatCurrency(result.totalMonthly)}
            <span className="text-sm font-medium text-muted-foreground">/mês</span>
          </CardTitle>
          <p className="text-xs text-muted-foreground font-medium">Investimento inicial: {formatCurrency(result.totalInitial)}</p>
        </CardHeader>
        <CardContent className="pt-4">
          <Tabs defaultValue="breakdown" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="breakdown">Composição</TabsTrigger>
              <TabsTrigger value="args">Justificativa</TabsTrigger>
            </TabsList>
            <TabsContent value="breakdown" className="space-y-3">
              {result.breakdown.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-sm border-b border-dashed border-slate-200 pb-1">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-mono font-bold">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="args" className="space-y-4">
              <div className="space-y-3">
                {result.arguments.map((arg, i) => (
                  <div key={i} className="flex gap-2 text-xs leading-relaxed text-foreground/90">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{arg}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
          <AnimatePresence>
            {result.alerts.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 space-y-2">
                {result.alerts.map((alert, i) => (
                  <div key={i} className="flex gap-2 p-2 rounded bg-amber-100/50 border border-amber-200 text-[11px] text-amber-900">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                    {alert}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 pt-0 pb-6">
          <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 text-lg shadow-lg shadow-primary/20" onClick={copyProposal}>
            <Copy className="mr-2 w-5 h-5" /> Copiar Proposta
          </Button>
          <p className="text-[10px] text-center text-muted-foreground flex items-center justify-center gap-1">
            <Info className="w-3 h-3" /> Valores calculados com base no volume diagnosticado.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}