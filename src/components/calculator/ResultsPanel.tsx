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
import { useWatch } from 'react-hook-form';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
interface ResultsPanelProps {
  result: PricingResult;
  activeId?: string | null;
}
const planDisplayNames: Record<PlanType, string> = {
  essential: 'Essential BPO',
  business: 'Business CFO',
  premium: 'Premium Finance',
};
export function ResultsPanel({ result, activeId }: ResultsPanelProps) {
  const formValues = useWatch<DiagnosticInputs>();
  const companyName = formValues.companyName;
  const leadName = formValues.leadName;
  const leadRole = formValues.leadRole;
  const annualRevenue = formValues.annualRevenue;
  const segment = formValues.segment;
  const commercialRep = formValues.commercialRep;
  const hasERP = formValues.hasERP;
  const erpName = formValues.erpName;
  const bankSchedules = formValues.manualBankSchedules || 0;
  const nfse = formValues.manualNFSe || 0;
  const boletos = formValues.monthlyBoletos || 0;
  const comparison = useMemo(() => {
    if (!companyName && !annualRevenue) return [];
    const plans: PlanType[] = ['essential', 'business', 'premium'];
    return plans.map(p => calculatePricing(formValues as DiagnosticInputs, p));
  }, [companyName, annualRevenue, formValues]);
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
    <div className="lg:sticky lg:top-24 space-y-6 print:static print:top-0 print:m-0 print:p-0">
      <Card className={cn(
        "overflow-hidden border-2 shadow-xl transition-all duration-500 print:shadow-none print:border-none print:w-full print:bg-white print:m-0 print:p-0 print-card",
        planStyles[result.recommendedPlan]
      )}>
        {/* PRINT HEADER - Fixed top in A4 */}
        <div className="hidden print:flex justify-between items-end border-b-2 border-slate-900 pb-4 mb-8">
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none">COLLAB GESTÃO EMPRESARIAL</h2>
            <p className="text-[9px] text-slate-500 uppercase font-bold tracking-[0.3em] mt-1">Diagnóstico Comercial e Estratégico</p>
          </div>
          <div className="text-right">
            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Emissão</div>
            <div className="text-[10px] font-bold text-slate-900">
              {format(new Date(), "dd/MM/yyyy", { locale: ptBR })}
            </div>
          </div>
        </div>
        {result.recommendedPlan === 'premium' && (
          <div className="bg-emerald-600 text-white text-[10px] font-bold py-1 text-center uppercase tracking-widest print:hidden">
            Recomendação de Máxima Eficiência
          </div>
        )}
        <CardHeader className="pb-2 print:p-0 print:mb-6">
          <div className="flex justify-between items-start print:hidden">
            <Badge className="px-3 py-1 text-sm font-bold uppercase tracking-wider bg-primary">
              {planDisplayNames[result.recommendedPlan]}
            </Badge>
          </div>
          <CardTitle className="text-4xl font-black pt-6 flex items-baseline gap-1 print:pt-0 print:text-2xl print:text-slate-900">
            {formatCurrency(result.totalMonthly)}
            <span className="text-sm font-medium text-muted-foreground print:text-xs">/mês</span>
          </CardTitle>
          <p className="text-xs text-muted-foreground font-medium print:text-[10px]">
            Investimento no 1º Mês (Incluso Setup): {formatCurrency(result.totalInitial)}
          </p>
        </CardHeader>
        <CardContent className="pt-4 min-h-[300px] print:p-0 print:min-h-0">
          <Tabs defaultValue="breakdown" className="w-full print:hidden">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="breakdown">Detalhamento</TabsTrigger>
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
          {/* PRINT ONLY CONTENT - Dense A4 Layout */}
          <div className="hidden print:block space-y-8">
            <section className="space-y-3">
              <h3 className="text-[11px] font-black uppercase text-slate-900 tracking-widest border-b border-slate-200 pb-1">I. Parâmetros de Diagnóstico</h3>
              <div className="grid grid-cols-3 gap-4 text-[10px]">
                <div><span className="text-slate-400 font-bold uppercase text-[8px] block">Empresa</span> <span className="font-bold text-slate-900">{companyName || 'N/A'}</span></div>
                <div><span className="text-slate-400 font-bold uppercase text-[8px] block">Faturamento Anual</span> <span className="font-bold text-slate-900">{formatCurrency(annualRevenue)}</span></div>
                <div><span className="text-slate-400 font-bold uppercase text-[8px] block">ERP Atual</span> <span className="font-bold text-slate-900">{hasERP === 'yes' ? erpName : 'Nenhum'}</span></div>
                <div className="col-span-3"><span className="text-slate-400 font-bold uppercase text-[8px] block">Volumetria Estimada</span> <span className="font-bold text-slate-900">{bankSchedules} agendamentos | {nfse} NFSe | {boletos} boletos</span></div>
              </div>
            </section>
            <section className="space-y-3">
              <h3 className="text-[11px] font-black uppercase text-slate-900 tracking-widest border-b border-slate-200 pb-1">II. Justificativa Técnica</h3>
              <div className="space-y-2">
                {result.arguments.map((arg, i) => (
                  <div key={i} className="flex gap-3 text-[10px] leading-tight">
                    <span className="text-blue-600 font-black">•</span>
                    <span className="text-slate-700">{arg}</span>
                  </div>
                ))}
              </div>
            </section>
            <section className="space-y-3">
              <h3 className="text-[11px] font-black uppercase text-slate-900 tracking-widest border-b border-slate-200 pb-1">III. Plano de Investimento: {planDisplayNames[result.recommendedPlan]}</h3>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <Table className="print:text-[9px]">
                  <TableBody>
                    {result.breakdown.map((item, i) => (
                      <TableRow key={i} className="border-b border-slate-200/40 last:border-0 h-auto">
                        <TableCell className="py-1 font-medium text-slate-600">{item.label}</TableCell>
                        <TableCell className="py-1 text-right font-mono font-bold text-slate-900">{formatCurrency(item.value)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="border-t-2 border-slate-900">
                      <TableCell className="py-2 text-[11px] font-black text-blue-900 uppercase">Mensalidade Total</TableCell>
                      <TableCell className="py-2 text-right text-[11px] font-black text-blue-900">{formatCurrency(result.totalMonthly)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </section>
            {/* PRINT FOOTER - Signature and Legal */}
            <div className="pt-12 flex justify-between items-end print-footer">
              <div className="text-[8px] text-slate-400 max-w-[280px] italic">
                Simulação baseada em dados declaratórios. Valores sujeitos a revisão após auditoria técnica de processos e ambiente ERP.
              </div>
              <div className="w-56 text-center">
                <div className="border-t border-slate-900 pt-2 font-black text-[10px] text-slate-900 uppercase">
                  {commercialRep || 'Consultor Collab'}
                </div>
                <div className="text-[8px] text-slate-500 uppercase tracking-[0.2em] mt-1">
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
              <Printer className="mr-2 w-4 h-4" /> Gerar PDF (1 Página)
            </Button>
          </div>
        </CardFooter>
        {/* PAGE NUMBERING FOR PDF */}
        <div className="hidden print:flex fixed bottom-0 left-0 right-0 justify-between items-center text-[7px] text-slate-300 border-t border-slate-100 pt-2 bg-white">
          <div>© {currentYear} Collab Gestão Empresarial</div>
          <div className="font-mono">Página 1 de 1</div>
        </div>
      </Card>
    </div>
  );
}