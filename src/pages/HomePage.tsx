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
import { Calculator, RefreshCcw, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
const schema = z.object({
  companyName: z.string().min(1, "Obrigatório"),
  segment: z.string().optional(),
  monthlyRevenue: z.number().default(0),
  annualRevenue: z.number().default(0),
  hasERP: z.enum(["yes", "no"]).default("no"),
  needsOps: z.boolean().default(true),
  needsStrategic: z.boolean().default(false),
  manualBankSchedules: z.number().default(0),
  manualNFSe: z.number().default(0),
  monthlyBoletos: z.number().default(0),
  needsDRE: z.boolean().optional(),
  needsStrategicMeetings: z.boolean().optional(),
  needsAnalyticalMeetings: z.boolean().optional(),
  meetingHours: z.number().default(0),
}).passthrough();
const defaultValues: DiagnosticInputs = {
  companyName: '',
  segment: '',
  leadName: '',
  leadRole: '',
  monthlyRevenue: 0,
  annualRevenue: 0,
  hasERP: 'no',
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
};
export function HomePage() {
  const queryClient = useQueryClient();
  const { register, control, watch, setValue, reset } = useForm<DiagnosticInputs>({
    resolver: zodResolver(schema),
    defaultValues,
  });
  const formValues = watch();
  const pricingResult = useMemo(() => calculatePricing(formValues), [formValues]);
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
    <div className="min-h-screen bg-slate-50/50 dark:bg-background">
      <ThemeToggle />
      <header className="border-b bg-white/80 backdrop-blur-md dark:bg-card/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Collab DealDesk</h1>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Calculadora Comercial</p>
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
          <div className="lg:col-span-7">
            <div className="mb-10">
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Diagnóstico Comercial</h2>
              <p className="text-slate-500 mt-2 font-medium">Configure as necessidades operacionais e estratégicas para gerar a proposta.</p>
            </div>
            <DiagnosticForm register={register} control={control} setValue={setValue} />
          </div>
          <div className="lg:col-span-5 relative">
            <ResultsPanel result={pricingResult} companyName={formValues.companyName} />
          </div>
        </div>
      </main>
      <Toaster richColors closeButton position="top-center" />
    </div>
  );
}