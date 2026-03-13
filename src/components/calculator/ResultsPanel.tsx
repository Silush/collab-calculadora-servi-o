import React, { useMemo } from 'react';
import { PricingResult, DiagnosticInputs, PlanType } from '@shared/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, AlertTriangle, Copy, Printer, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { formatCurrency, cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { calculatePricing } from '@/lib/pricing-engine';
import { useFormContext, useWatch } from 'react-hook-form';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { CollabLogo } from '@/components/ui/collab-logo';
interface ResultsPanelProps {
  result: PricingResult;
  companyName: string;
  commercialRep?: string;
  activeId?: string | null;
}
const planDisplayNames: Record<PlanType, string> = {
  essential: 'Essential BPO',
  business: 'Business CFO',
  premium: 'Premium Finance',
};
export function ResultsPanel({ result, activeId }: ResultsPanelProps) {
  const context = useFormContext<DiagnosticInputs>();
  // Use useWatch for real-time form state subscription - safest pattern for Results Panel
  const watchedValues = useWatch({
    control: context?.control,
  }) as DiagnosticInputs;
  const currentInputs = watchedValues || ({} as DiagnosticInputs);
  const comparison = useMemo(() => {
    if (!currentInputs.companyName && !currentInputs.monthlyRevenue) return [];
    const plans: PlanType[] = ['essential', 'business', 'premium'];
    return plans.map(p => calculatePricing(currentInputs, p));
  }, [currentInputs]);
  const shareUrl = activeId ? `${window.location.origin}?id=${activeId}` : null;
  const copyProposal = async () => {
    if (!currentInputs.commercialRep) {
      return toast.warning("Identifique-se como 'Responsável Comercial' antes de gerar a proposta.");
    }
    const today = format(new Date(), "dd/MM/yyyy", { locale: ptBR });
    const planName = planDisplayNames[result.recommendedPlan];
    const text = `PROPOSTA COMERCIAL - COLLAB DEALDESK
1. DADOS DO LEAD
Empresa: ${currentInputs.companyName || 'N/A'}
Contato: ${currentInputs.leadName || 'N/A'} (${currentInputs.leadRole || 'N/A'})
Faturamento: Mensal ${formatCurrency(currentInputs.monthlyRevenue)} | Anual ${formatCurrency(currentInputs.annualRevenue)}
ERP: ${currentInputs.hasERP === 'yes' ? currentInputs.erpName : 'Não possui'}
2. DIAGNÓSTICO OPERACIONAL
Agendamentos Bancários: ${currentInputs.manualBankSchedules}/mês
Emissões NFSe: ${currentInputs.manualNFSe}/mês
Boletos: ${currentInputs.monthlyBoletos}/mês
3. JUSTIFICATIVA TÉCNICA (RECOMENDAÇÃO: ${planName.toUpperCase()})
${result.arguments.map(a => `• ${a}`).join('\n')}
4. COMPOSIÇÃO DO INVESTIMENTO
${result.breakdown.map(item => `- ${item.label}: ${formatCurrency(item.value)}`).join('\n')}
INVESTIMENTO MENSAL TOTAL: ${formatCurrency(result.totalMonthly)}
INVESTIMENTO INICIAL (IMPLANTAÇÃO): ${formatCurrency(result.totalInitial)}
${result.savingsVsIndividual ? `EFICIÊNCIA POR UNIFICAÇÃO (ECONOMIA): ${formatCurrency(result.savingsVsIndividual)}` : ''}
Observações: ${currentInputs.notes || 'Nenhum comentário adicional.'}
---
Emitido por: ${currentInputs.commercialRep}
Collab Gestão Empresarial | ${today}
Link da Simulação: ${shareUrl || 'Disponível apenas após salvar'}`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Proposta estruturada copiada para o clipboard!");
    } catch (err) {
      toast.error("Erro ao copiar proposta.");
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
        <div className="hidden print:flex justify-between items-center border-b pb-4 mb-6">
          <div className="flex items-center gap-3">
            <CollabLogo size={40} />
            <h2 className="text-xl font-black text-slate-900 uppercase">Relatório de Diagnóstico</h2>
          </div>
          <div className="text-right text-[10px] text-muted-foreground">
            {format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}
          </div>
        </div>
        {result.recommendedPlan === 'premium' && (
          <div className="bg-emerald-600 text-white text-[10px] font-bold py-1 text-center uppercase tracking-widest print:hidden">
            Recomendação de Máximo Valor
          </div>
        )}
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start print:hidden">
            <Badge className="px-3 py-1 text-sm font-bold uppercase tracking-wider bg-primary">
              {planDisplayNames[result.recommendedPlan]}
            </Badge>
          </div>
          <CardTitle className="text-4xl font-black pt-6 flex items-baseline gap-1 print:pt-0">
            {formatCurrency(result.totalMonthly)}
            <span className="text-sm font-medium text-muted-foreground">/mês</span>
          </CardTitle>
          <p className="text-xs text-muted-foreground font-medium">Investimento inicial (Setup): {formatCurrency(result.totalInitial)}</p>
        </CardHeader>
        <CardContent className="pt-4 min-h-[300px]">
          <Tabs defaultValue="breakdown" className="w-full print:hidden">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="breakdown">Custos</TabsTrigger>
              <TabsTrigger value="compare">Planos</TabsTrigger>
              <TabsTrigger value="args">Argumentos</TabsTrigger>
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
                        <TableCell className="text-xs font-bold">{planDisplayNames[c.recommendedPlan]}</TableCell>
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
          <div className="hidden print:block space-y-8">
            <section className="space-y-2">
              <h3 className="text-sm font-black uppercase text-slate-900 border-b pb-1">1. Diagnóstico do Lead</h3>
              <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-xs">
                <div><span className="font-bold">Empresa:</span> {currentInputs.companyName || 'N/A'}</div>
                <div><span className="font-bold">Segmento:</span> {currentInputs.segment || 'N/A'}</div>
                <div><span className="font-bold">Lead:</span> {currentInputs.leadName || 'N/A'} ({currentInputs.leadRole || 'N/A'})</div>
                <div><span className="font-bold">ERP Atual:</span> {currentInputs.hasERP === 'yes' ? currentInputs.erpName : 'Nenhum'}</div>
                <div><span className="font-bold">Agendamentos:</span> {currentInputs.manualBankSchedules}/mês</div>
                <div><span className="font-bold">NFSe Emitidas:</span> {currentInputs.manualNFSe}/mês</div>
              </div>
            </section>
            <section className="space-y-2">
              <h3 className="text-sm font-black uppercase text-slate-900 border-b pb-1">2. Justificativa Estratégica</h3>
              <div className="space-y-2">
                {result.arguments.map((arg, i) => (
                  <div key={i} className="flex gap-2 text-xs">
                    <span>• {arg}</span>
                  </div>
                ))}
              </div>
            </section>
            <section className="space-y-2">
              <h3 className="text-sm font-black uppercase text-slate-900 border-b pb-1">3. Detalhamento do Investimento</h3>
              <div className="space-y-2">
                {result.breakdown.map((item, i) => (
                  <div key={i} className="flex justify-between text-xs py-1 border-b border-slate-100">
                    <span>{item.label}</span>
                    <span className="font-bold">{formatCurrency(item.value)}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 text-sm font-black text-primary">
                  <span>INVESTIMENTO MENSAL TOTAL</span>
                  <span>{formatCurrency(result.totalMonthly)}</span>
                </div>
              </div>
            </section>
            <div className="flex justify-end pt-24">
              <div className="w-64 text-center">
                <div className="border-t border-slate-900 pt-2 font-bold text-xs">
                  {currentInputs.commercialRep || 'Consultor Responsável'}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Collab Gestão Empresarial
                </div>
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
            <Copy className="mr-2 w-5 h-5" /> Gerar Proposta
          </Button>
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button variant="outline" size="sm" onClick={handleShare} disabled={!activeId}>
              <Share2 className="mr-2 w-4 h-4" /> Link Direto
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="mr-2 w-4 h-4" /> Imprimir
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}