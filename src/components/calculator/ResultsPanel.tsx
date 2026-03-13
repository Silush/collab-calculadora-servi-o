import React, { useMemo } from 'react';
import { PricingResult, DiagnosticInputs, PlanType } from '@shared/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, AlertTriangle, Copy, Zap, Info, Printer, TrendingDown } from 'lucide-react';
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
}
export function ResultsPanel({ result, companyName, commercialRep }: ResultsPanelProps) {
  const { watch } = useFormContext<DiagnosticInputs>() || { watch: () => ({}) };
  const currentInputs = watch() as DiagnosticInputs;
  const comparison = useMemo(() => {
    const plans: PlanType[] = ['essential', 'business', 'premium'];
    return plans.map(p => calculatePricing(currentInputs, p));
  }, [currentInputs]);
  const copyProposal = async () => {
    const today = format(new Date(), "dd/MM/yyyy", { locale: ptBR });
    const compText = comparison
      .map(c => `- ${c.recommendedPlan.toUpperCase()}: ${formatCurrency(c.totalMonthly)}/mês`)
      .join('\n');
    const text = `PROPOSTA COMERCIAL - COLLAB DEALDESK
Cliente: ${companyName || 'Lead Diagnosticado'}
Plano Recomendado: ${result.recommendedPlan.toUpperCase()}
INVESTIMENTO:
Mensalidade: ${formatCurrency(result.totalMonthly)}
Implantação: ${formatCurrency(result.setupFee)}
COMPARATIVO DE INVESTIMENTO:
${compText}
JUSTIFICATIVA COMERCIAL:
${result.arguments.map(a => `- ${a}`).join('\n')}
COMPOSIÇÃO:
${result.breakdown.map(b => `- ${b.label}: ${formatCurrency(b.value)}`).join('\n')}
Proposta preparada por: ${commercialRep || 'Consultor Collab'} | Collab Gestão Empresarial | Data: ${today}`;
    try {
      if (!navigator.clipboard) throw new Error("Clipboard API não disponível");
      await navigator.clipboard.writeText(text);
      toast.success("Proposta copiada!");
    } catch (err) {
      toast.error("Erro ao copiar. Use o botão Imprimir.");
    }
  };
  const handlePrint = () => window.print();
  const planStyles = {
    essential: 'border-slate-300 ring-slate-400/20 bg-slate-50',
    business: 'border-blue-300 ring-blue-400/20 bg-blue-50/30',
    premium: 'border-emerald-500 ring-emerald-400/30 bg-emerald-50/50',
  };
  const premiumSavings = useMemo(() => {
    const essential = comparison.find(c => c.recommendedPlan === 'essential');
    const business = comparison.find(c => c.recommendedPlan === 'business');
    const premium = comparison.find(c => c.recommendedPlan === 'premium');
    if (!essential || !business || !premium) return null;
    const combined = essential.totalMonthly + business.totalMonthly;
    const savings = combined - premium.totalMonthly;
    const percent = Math.round((savings / combined) * 100);
    return { savings, percent };
  }, [comparison]);
  return (
    <div className="sticky top-24 space-y-6 print:static print:top-0">
      <Card className={cn(
        "overflow-hidden border-2 shadow-xl transition-all duration-500 print:shadow-none print:border-slate-300",
        planStyles[result.recommendedPlan]
      )}>
        {result.recommendedPlan === 'premium' && (
          <div className="bg-emerald-600 text-white text-[10px] font-bold py-1 text-center uppercase tracking-widest animate-pulse print:hidden">
            Recomendação Ideal
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
            <TabsList className="grid w-full grid-cols-3 mb-4 print:hidden">
              <TabsTrigger value="breakdown">Composição</TabsTrigger>
              <TabsTrigger value="compare">Comparativo</TabsTrigger>
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
            <TabsContent value="compare" className="space-y-4">
              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[10px] uppercase">Plano</TableHead>
                      <TableHead className="text-right text-[10px] uppercase">Mensal</TableHead>
                      <TableHead className="text-right text-[10px] uppercase">Setup</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comparison.map((c) => (
                      <TableRow 
                        key={c.recommendedPlan}
                        className={cn(
                          c.recommendedPlan === result.recommendedPlan && "bg-slate-200/50 dark:bg-slate-800/50",
                          c.recommendedPlan === 'premium' && "text-emerald-700 dark:text-emerald-400 font-bold"
                        )}
                      >
                        <TableCell className="capitalize text-xs">
                          {c.recommendedPlan}
                          {c.recommendedPlan === 'premium' && <Badge variant="outline" className="ml-1 scale-75 border-emerald-500 text-emerald-600">Best</Badge>}
                        </TableCell>
                        <TableCell className="text-right text-xs font-mono">{formatCurrency(c.totalMonthly)}</TableCell>
                        <TableCell className="text-right text-xs font-mono">{formatCurrency(c.setupFee)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {premiumSavings && (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs mb-1">
                    <TrendingDown className="w-4 h-4" /> Qual plano faz mais sentido?
                  </div>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-500 leading-snug">
                    O plano Premium oferece uma economia de <strong>{premiumSavings.percent}% ({formatCurrency(premiumSavings.savings)})</strong> em comparação à contratação separada de BPO + CFO.
                  </p>
                </div>
              )}
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
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 space-y-2 print:hidden">
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
        <CardFooter className="flex flex-col gap-2 pt-0 pb-6 print:hidden">
          <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 text-lg" onClick={copyProposal}>
            <Copy className="mr-2 w-5 h-5" /> Copiar Proposta
          </Button>
          <Button variant="outline" className="w-full font-medium" onClick={handlePrint}>
            <Printer className="mr-2 w-4 h-4" /> Imprimir / PDF
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}