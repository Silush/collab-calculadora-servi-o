import React, { useMemo } from 'react';
import { PricingResult, DiagnosticInputs, PlanType } from '@shared/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, AlertTriangle, Copy, Zap, Printer, Share2, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { formatCurrency, cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { calculatePricing } from '@/lib/pricing-engine';
import { useFormContext } from 'react-hook-form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
interface ResultsPanelProps {
  result: PricingResult;
  companyName: string;
  commercialRep?: string;
  activeId?: string | null;
}
export function ResultsPanel({ result, companyName, commercialRep, activeId }: ResultsPanelProps) {
  const { watch } = useFormContext<DiagnosticInputs>() || { watch: () => ({}) };
  const currentInputs = watch() as DiagnosticInputs;
  const comparison = useMemo(() => {
    const plans: PlanType[] = ['essential', 'business', 'premium'];
    return plans.map(p => calculatePricing(currentInputs, p));
  }, [currentInputs]);
  const shareUrl = activeId ? `${window.location.origin}?id=${activeId}` : null;
  const copyProposal = async () => {
    const today = format(new Date(), "dd/MM/yyyy", { locale: ptBR });
    const text = `PROPOSTA COMERCIAL - COLLAB DEALDESK
Cliente: ${companyName || 'Lead Diagnosticado'}
Plano: ${result.recommendedPlan.toUpperCase()}
Investimento Mensal: ${formatCurrency(result.totalMonthly)}
${shareUrl ? `Link da Simulação: ${shareUrl}` : ''}
JUSTIFICATIVA:
${result.arguments.map(a => `- ${a}`).join('\n')}
Preparado por: ${commercialRep || 'Consultor Collab'} | Data: ${today}`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Proposta copiada!");
    } catch (err) {
      toast.error("Erro ao copiar.");
    }
  };
  const handleShare = async () => {
    if (!activeId) return toast.error("Salve a simulação primeiro para gerar um link.");
    await navigator.clipboard.writeText(shareUrl!);
    toast.success("Link de compartilhamento copiado!");
  };
  const planStyles = {
    essential: 'border-slate-300 bg-slate-50',
    business: 'border-blue-300 bg-blue-50/30',
    premium: 'border-emerald-500 bg-emerald-50/50',
  };
  return (
    <div className="sticky top-24 space-y-6 print:static print:top-0">
      <Card className={cn(
        "overflow-hidden border-2 shadow-xl transition-all duration-500 print:shadow-none print:border-slate-300 print:w-full",
        planStyles[result.recommendedPlan]
      )}>
        {result.recommendedPlan === 'premium' && (
          <div className="bg-emerald-600 text-white text-[10px] font-bold py-1 text-center uppercase tracking-widest print:hidden">
            Recomendação Ideal
          </div>
        )}
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <Badge className="px-3 py-1 text-sm font-bold uppercase tracking-wider bg-primary">
              {result.recommendedPlan}
            </Badge>
          </div>
          <CardTitle className="text-4xl font-black pt-6 flex items-baseline gap-1">
            {formatCurrency(result.totalMonthly)}
            <span className="text-sm font-medium text-muted-foreground">/mês</span>
          </CardTitle>
          <p className="text-xs text-muted-foreground font-medium">Investimento inicial: {formatCurrency(result.totalInitial)}</p>
        </CardHeader>
        <CardContent className="pt-4">
          <Tabs defaultValue="breakdown" className="w-full print:hidden">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="breakdown">Itens</TabsTrigger>
              <TabsTrigger value="compare">Planos</TabsTrigger>
              <TabsTrigger value="args">Ganhos</TabsTrigger>
            </TabsList>
            <TabsContent value="breakdown" className="space-y-3">
              {result.breakdown.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-sm border-b border-dashed border-slate-200 pb-1">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-mono font-bold">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="compare">
               <Table>
                  <TableBody>
                    {comparison.map((c) => (
                      <TableRow key={c.recommendedPlan} className={cn(c.recommendedPlan === result.recommendedPlan && "bg-slate-200/50")}>
                        <TableCell className="capitalize text-xs font-bold">{c.recommendedPlan}</TableCell>
                        <TableCell className="text-right text-xs font-mono">{formatCurrency(c.totalMonthly)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
               </Table>
            </TabsContent>
            <TabsContent value="args" className="space-y-3">
               {result.arguments.map((arg, i) => (
                  <div key={i} className="flex gap-2 text-xs text-foreground/90">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{arg}</span>
                  </div>
                ))}
            </TabsContent>
          </Tabs>
          {/* Visible in Print only section */}
          <div className="hidden print:block space-y-6 mt-4">
            <div className="border-t pt-4">
              <h3 className="text-sm font-bold mb-2 uppercase">Composição do Investimento</h3>
              {result.breakdown.map((item, i) => (
                <div key={i} className="flex justify-between text-xs py-1 border-b">
                  <span>{item.label}</span>
                  <span className="font-bold">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
            <div className="break-before-page pt-4">
              <h3 className="text-sm font-bold mb-2 uppercase">Justificativa Comercial</h3>
              <div className="space-y-2">
                {result.arguments.map((arg, i) => (
                  <div key={i} className="flex gap-2 text-xs">
                    <span>• {arg}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <AnimatePresence>
            {result.alerts.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 space-y-2 print:hidden">
                {result.alerts.map((alert, i) => (
                  <div key={i} className="flex gap-2 p-2 rounded bg-amber-50 border border-amber-200 text-[10px] text-amber-900">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                    {alert}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 pt-0 pb-6 print:hidden">
          <Button className="w-full h-12 text-lg font-bold" onClick={copyProposal}>
            <Copy className="mr-2 w-5 h-5" /> Copiar Proposta
          </Button>
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="mr-2 w-4 h-4" /> Link
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="mr-2 w-4 h-4" /> PDF
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}