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
import { PLANS } from '@/lib/plans';
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
  // Use specific fields to reduce unnecessary re-renders
  const companyName = useWatch({ name: 'companyName' });
  const leadName = useWatch({ name: 'leadName' });
  const leadRole = useWatch({ name: 'leadRole' });
  const annualRevenue = useWatch({ name: 'annualRevenue' });
  const segment = useWatch({ name: 'segment' });
  const commercialRep = useWatch({ name: 'commercialRep' });
  const hasERP = useWatch({ name: 'hasERP' });
  const erpName = useWatch({ name: 'erpName' });
  const bankSchedules = useWatch({ name: 'manualBankSchedules' }) || 0;
  const nfse = useWatch({ name: 'manualNFSe' }) || 0;
  const boletos = useWatch({ name: 'monthlyBoletos' }) || 0;
  const currentInputs = useMemo(() => ({
    companyName, leadName, leadRole, annualRevenue, segment, commercialRep, 
    hasERP, erpName, manualBankSchedules: bankSchedules, manualNFSe: nfse, monthlyBoletos: boletos
  }), [companyName, leadName, leadRole, annualRevenue, segment, commercialRep, hasERP, erpName, bankSchedules, nfse, boletos]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const comparison = useMemo(() => {
    if (!companyName && !annualRevenue) return [];
    const plans: PlanType[] = ['essential', 'business', 'premium'];
    return plans.map(p => calculatePricing(context.getValues(), p));
  }, [companyName, annualRevenue]);
  const shareUrl = activeId ? `${window.location.origin}?id=${activeId}` : null;
  const copyProposal = async () => {
    if (!commercialRep) {
      return toast.warning("Identifique-se como 'Responsável Comercial' antes de gerar a proposta.");
    }
    const today = format(new Date(), "dd/MM/yyyy", { locale: ptBR });
    const planName = planDisplayNames[result.recommendedPlan];
    const planLimits = (PLANS as any)[result.recommendedPlan]?.limits;
    const text = `PROPOSTA COMERCIAL - COLLAB GESTÃO EMPRESARIAL
1. DADOS DO CLIENTE
Empresa: ${companyName || 'N/A'}
Contato: ${leadName || 'Não Informado'} (${leadRole || 'Cargo não informado'})
Faturamento Anual: ${formatCurrency(annualRevenue)}
2. DIAGNÓSTICO OPERACIONAL
Volume Atual: ${bankSchedules} agendamentos / ${nfse} NFSe
${planLimits ? `Franquia Inclusa: ${planLimits.bankSchedules} agendamentos, ${planLimits.nfse} NFSe, ${planLimits.boletos} boletos.` : 'Escopo focado em suporte estratégico CFO.'}
3. RECOMENDAÇÃO TÉCNICA: ${planName.toUpperCase()}
${result.arguments.length > 0 ? result.arguments.map(a => `• ${a}`).join('\n') : '• Solução customizada para as necessidades operacionais identificadas.'}
4. INVESTIMENTO
${result.breakdown.map(item => `- ${item.label}: ${formatCurrency(item.value)}`).join('\n')}
MENSALIDADE TOTAL: ${formatCurrency(result.totalMonthly)}
TAXA DE IMPLANTAÇÃO: ${formatCurrency(result.totalInitial)}
---
Emitido por: ${commercialRep}
Collab Gestão Empresarial | ${today}`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Proposta estruturada copiada!");
    } catch (err) {
      toast.error("Erro ao copiar proposta.");
      console.error(err);
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
  const currentYear = new Date().getFullYear();
  return (
    <div className="sticky top-24 space-y-6 print:static print:top-0">
      <Card className={cn(
        "overflow-hidden border-2 shadow-xl transition-all duration-500 print:shadow-none print:border-slate-200 print:w-full print:bg-white",
        planStyles[result.recommendedPlan]
      )}>
        {/* Print Header */}
        <div className="hidden print:flex justify-between items-center border-b-2 border-slate-900 pb-8 mb-10">
          <div className="flex items-center gap-6">
            <CollabLogo size={80} printSize={80} glow={false} />
            <div>
              <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Collab Gestão Empresarial</h2>
              <p className="text-[12px] text-slate-500 uppercase font-bold tracking-[0.4em]">Relatório de Diagnóstico Comercial</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Data de Emissão</div>
            <div className="text-sm font-bold text-slate-900">
              {format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}
            </div>
          </div>
        </div>
        {result.recommendedPlan === 'premium' && (
          <div className="bg-emerald-600 text-white text-[10px] font-bold py-1 text-center uppercase tracking-widest print:hidden">
            Recomendação de Máxima Eficiência
          </div>
        )}
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start print:hidden">
            <Badge className="px-3 py-1 text-sm font-bold uppercase tracking-wider bg-primary">
              {planDisplayNames[result.recommendedPlan]}
            </Badge>
          </div>
          <CardTitle className="text-4xl font-black pt-6 flex items-baseline gap-1 print:pt-0 print:text-slate-900">
            {formatCurrency(result.totalMonthly)}
            <span className="text-sm font-medium text-muted-foreground">/mês</span>
          </CardTitle>
          <p className="text-xs text-muted-foreground font-medium">Investimento inicial (Setup): {formatCurrency(result.totalInitial)}</p>
        </CardHeader>
        <CardContent className="pt-4 min-h-[300px]">
          <Tabs defaultValue="breakdown" className="w-full print:hidden">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="breakdown">Composição</TabsTrigger>
              <TabsTrigger value="compare">Comparar</TabsTrigger>
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
                  <div key={i} className="flex gap-2 text-xs text-foreground/90 leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{arg}</span>
                  </div>
                ))}
            </TabsContent>
          </Tabs>
          <div className="hidden print:block space-y-12">
            <section className="space-y-4">
              <h3 className="text-sm font-black uppercase text-slate-900 tracking-widest border-b-2 border-slate-100 pb-2">I. Parâmetros de Diagnóstico</h3>
              <div className="grid grid-cols-2 gap-x-16 gap-y-4 text-[12px]">
                <div><span className="text-slate-400 font-bold uppercase text-[10px] block">Empresa</span> <span className="font-bold text-slate-900">{companyName || 'N/A'}</span></div>
                <div><span className="text-slate-400 font-bold uppercase text-[10px] block">Segmento</span> <span className="font-bold text-slate-900">{segment || 'N/A'}</span></div>
                <div><span className="text-slate-400 font-bold uppercase text-[10px] block">Faturamento Anual</span> <span className="font-bold text-slate-900">{formatCurrency(annualRevenue)}</span></div>
                <div><span className="text-slate-400 font-bold uppercase text-[10px] block">ERP Atual</span> <span className="font-bold text-slate-900">{hasERP === 'yes' ? erpName : 'Nenhum'}</span></div>
                <div className="col-span-2"><span className="text-slate-400 font-bold uppercase text-[10px] block">Volumetria Operacional</span> <span className="font-bold text-slate-900">{bankSchedules} agendamentos | {nfse} emissões NFSe | {boletos} boletos</span></div>
              </div>
            </section>
            <section className="space-y-4">
              <h3 className="text-sm font-black uppercase text-slate-900 tracking-widest border-b-2 border-slate-100 pb-2">II. Justificativa Estratégica</h3>
              <div className="space-y-3">
                {result.arguments.map((arg, i) => (
                  <div key={i} className="flex gap-4 text-[12px] leading-relaxed">
                    <span className="text-blue-600 font-black">•</span>
                    <span className="text-slate-700">{arg}</span>
                  </div>
                ))}
              </div>
            </section>
            <section className="space-y-4">
              <h3 className="text-sm font-black uppercase text-slate-900 tracking-widest border-b-2 border-slate-100 pb-2">III. Proposta de Investimento</h3>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                {result.breakdown.map((item, i) => (
                  <div key={i} className="flex justify-between text-[12px] py-2.5 border-b border-slate-200/50 last:border-0">
                    <span className="text-slate-600 font-medium">{item.label}</span>
                    <span className="font-mono font-bold text-slate-900">{formatCurrency(item.value)}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-6 mt-4 text-lg font-black text-blue-800">
                  <span className="uppercase tracking-tight">Investimento Mensal Total</span>
                  <span>{formatCurrency(result.totalMonthly)}</span>
                </div>
              </div>
            </section>
            <div className="pt-24 flex justify-between items-end">
              <div className="text-[10px] text-slate-400 max-w-[300px]">
                Este documento é uma simulação comercial exclusiva. Os valores podem sofrer alterações após a validação técnica definitiva do ambiente ERP do cliente.
              </div>
              <div className="w-72 text-center">
                <div className="border-t-2 border-slate-900 pt-4 font-black text-sm text-slate-900 uppercase">
                  {commercialRep || 'Consultor Collab'}
                </div>
                <div className="text-[10px] text-slate-500 uppercase tracking-[0.3em] mt-2">
                  Responsável Comercial
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
          <Button className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20" onClick={copyProposal}>
            <Copy className="mr-2 w-5 h-5" /> Copiar Proposta
          </Button>
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button variant="outline" size="sm" onClick={handleShare} disabled={!activeId}>
              <Share2 className="mr-2 w-4 h-4" /> Link Direto
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="mr-2 w-4 h-4" /> Gerar PDF
            </Button>
          </div>
        </CardFooter>
        <div className="hidden print:flex fixed bottom-0 left-0 right-0 justify-between items-center text-[9px] text-slate-400 border-t border-slate-100 pt-4 bg-white">
          <div className="flex items-center gap-3">
            <CollabLogo size={14} glow={false} />
            <span className="font-bold">Collab Gestão Empresarial © {currentYear}</span>
          </div>
          <div>Simulação gerada via DealDesk Engine - Tecnologia para Decisão.</div>
          <div className="font-mono">Página 1 de 1</div>
        </div>
      </Card>
    </div>
  );
}