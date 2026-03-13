import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { DiagnosticInputs, SimulationRecord } from '@shared/types';
import { calculatePricing } from '@/lib/pricing-engine';
import { DiagnosticForm } from '@/components/calculator/DiagnosticForm';
import { ResultsPanel } from '@/components/calculator/ResultsPanel';
import { HistoryDrawer } from '@/components/calculator/HistoryDrawer';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Toaster } from '@/components/ui/sonner';
import { RefreshCcw, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { CollabLogo } from '@/components/ui/collab-logo';
const schema = z.object({
  companyName: z.string().min(1, "Obrigatório"),
  segment: z.string().min(1, "Obrigatório"),
  leadName: z.string().default(""),
  leadRole: z.string().default(""),
  monthlyRevenue: z.number().min(0),
  annualRevenue: z.number().min(0),
  hasERP: z.enum(["yes", "no"]),
  erpName: z.string().optional().or(z.literal('')),
  needsCollabERP: z.enum(["yes", "no"]),
  internalFinanceTeam: z.enum(["yes", "no"]),
  internalOpsTeam: z.enum(["yes", "no"]),
  needsOps: z.boolean(),
  needsStrategic: z.boolean(),
  manualBankSchedules: z.number().min(0),
  manualNFSe: z.number().min(0),
  monthlyBoletos: z.number().min(0),
  needsAnalyticalMeetings: z.boolean(),
  needsStrategicMeetings: z.boolean(),
  needsDashboards: z.boolean(),
  needsDRE: z.boolean(),
  needsBudgeting: z.boolean(),
  needsControllership: z.boolean(),
  meetingHours: z.number().min(0),
  commercialRep: z.string().min(1, "Obrigatório"),
  notes: z.string().optional().default(""),
});
const defaultValues: DiagnosticInputs = {
  companyName: '',
  segment: '',
  leadName: '',
  leadRole: '',
  monthlyRevenue: 0,
  annualRevenue: 0,
  hasERP: 'no',
  erpName: '',
  needsCollabERP: 'no',
  internalFinanceTeam: 'no',
  internalOpsTeam: 'no',
  needsOps: true,
  needsStrategic: false,
  manualBankSchedules: 10,
  manualNFSe: 10,
  monthlyBoletos: 10,
  needsAnalyticalMeetings: false,
  needsStrategicMeetings: false,
  needsDashboards: false,
  needsDRE: false,
  needsBudgeting: false,
  needsControllership: false,
  meetingHours: 0,
  commercialRep: '',
  notes: '',
};
export function HomePage() {
  const queryClient = useQueryClient();
  const { register, control, watch, setValue, reset } = useForm<DiagnosticInputs>({
    resolver: zodResolver(schema),
    defaultValues,
  });
  const formValues = watch();
  const pricingResult = useMemo(() => {
    try {
      return calculatePricing(formValues);
    } catch (e) {
      console.error("Pricing calculation error:", e);
      return calculatePricing(defaultValues);
    }
  }, [formValues]);
  const saveMutation = useMutation({
    mutationFn: (record: SimulationRecord) => api<SimulationRecord>('/api/simulations', {
      method: 'POST',
      body: JSON.stringify(record)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['simulations'] });
      toast.success("Simulação salva com sucesso!");
    },
    onError: (err) => {
      toast.error(`Erro ao salvar: ${err instanceof Error ? err.message : 'Falha na conexão'}`);
    }
  });
  const handleSave = () => {
    if (!formValues.companyName) {
      toast.error("Insira o nome da empresa para salvar.");
      return;
    }
    const record: SimulationRecord = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      inputs: formValues,
      result: pricingResult,
    };
    saveMutation.mutate(record);
  };
  const loadSimulation = (record: SimulationRecord) => {
    reset(record.inputs);
    toast.info(`Simulação de ${record.inputs.companyName} carregada.`);
  };
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-background print:bg-white">
      <ThemeToggle />
      <header className="border-b bg-white/80 backdrop-blur-md dark:bg-card/80 sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CollabLogo size={32} />
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                Calculadora Comercial - Collab DealDesk
              </h1>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                Collab Gestão Empresarial
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <HistoryDrawer onLoad={loadSimulation} />
            <Button variant="ghost" size="sm" onClick={() => reset(defaultValues)}>
              <RefreshCcw className="w-4 h-4 mr-2" /> Novo
            </Button>
            <Button
              variant="default"
              size="sm"
              className="hidden sm:flex"
              onClick={handleSave}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Salvar Nuvem
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7 print:hidden">
            <div className="mb-10">
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Diagnóstico Comercial</h2>
              <p className="text-slate-500 mt-2 font-medium">Configure as necessidades operacionais e estratégicas para gerar a proposta.</p>
            </div>
            {control && (
              <DiagnosticForm register={register} control={control} setValue={setValue} />
            )}
          </div>
          <div className="lg:col-span-5 relative print:col-span-12">
            <ResultsPanel result={pricingResult} companyName={formValues.companyName} commercialRep={formValues.commercialRep} />
          </div>
        </div>
      </main>
      <Toaster richColors closeButton position="top-center" />
    </div>
  );
}