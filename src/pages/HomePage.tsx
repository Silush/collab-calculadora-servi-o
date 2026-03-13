import React, { useMemo, useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSearchParams } from 'react-router-dom';
import { DiagnosticInputs, SimulationRecord } from '@shared/types';
import { calculatePricing } from '@/lib/pricing-engine';
import { DiagnosticForm } from '@/components/calculator/DiagnosticForm';
import { ResultsPanel } from '@/components/calculator/ResultsPanel';
import { HistoryDrawer } from '@/components/calculator/HistoryDrawer';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Toaster } from '@/components/ui/sonner';
import { RefreshCcw, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { CollabLogo } from '@/components/ui/collab-logo';
const schema = z.object({
  companyName: z.string().min(2, "Nome muito curto"),
  segment: z.string().min(1, "Obrigatório"),
  leadName: z.string().min(2, "Nome obrigatório"),
  leadRole: z.string().min(2, "Cargo obrigatório"),
  monthlyRevenue: z.number().min(0),
  annualRevenue: z.number().min(0),
  hasERP: z.enum(["yes", "no"]),
  erpName: z.string(),
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
  commercialRep: z.string().min(2, "Identifique-se para assinar"),
  notes: z.string(),
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
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [activeSimulationId, setActiveSimulationId] = useState<string | null>(null);
  const methods = useForm<DiagnosticInputs>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange'
  });
  const { register, control, watch, setValue, reset } = methods;
  const formValues = watch();
  useEffect(() => {
    const shareId = searchParams.get('id');
    if (shareId && !activeSimulationId) {
      setIsInitialLoading(true);
      api<SimulationRecord>(`/api/simulations/${shareId}`)
        .then((data) => {
          reset(data.inputs);
          setActiveSimulationId(data.id);
          toast.success(`Diagnóstico de ${data.inputs.companyName} carregado.`);
        })
        .catch(() => {
          toast.error("Simulação expirada ou inválida.");
          setSearchParams({});
        })
        .finally(() => setIsInitialLoading(false));
    }
  }, [searchParams, reset, activeSimulationId, setSearchParams]);
  const pricingResult = useMemo(() => {
    try {
      return calculatePricing(formValues);
    } catch (e) {
      return calculatePricing(defaultValues);
    }
  }, [formValues]);
  const saveMutation = useMutation({
    mutationFn: (record: SimulationRecord) => api<SimulationRecord>('/api/simulations', {
      method: 'POST',
      body: JSON.stringify(record)
    }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['simulations'] });
      setActiveSimulationId(data.id);
      setSearchParams({ id: data.id });
      toast.success("Diagnóstico salvo com sucesso!");
    },
    onError: (err) => toast.error(`Falha técnica: ${err.message}`)
  });
  const handleSave = async () => {
    const isValid = await methods.trigger();
    if (!isValid) return toast.error("Preencha os campos obrigatórios em destaque.");
    const record: SimulationRecord = {
      id: activeSimulationId || crypto.randomUUID(),
      timestamp: Date.now(),
      inputs: formValues,
      result: pricingResult,
    };
    saveMutation.mutate(record);
  };
  const handleReset = () => {
    reset(defaultValues);
    setActiveSimulationId(null);
    setSearchParams({});
    toast.info("Novo diagnóstico iniciado.");
  };
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-background print:bg-white">
      <ThemeToggle />
      <Toaster richColors closeButton position="top-center" />
      <header className="border-b bg-white/95 backdrop-blur-md dark:bg-card/95 sticky top-0 z-50 print:hidden h-20 flex items-center shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CollabLogo size={48} className="glow-lg" />
            <div className="flex flex-col">
              <h1 className="text-xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
                <span className="inline sm:hidden">Collab</span>
                <span className="hidden sm:inline">Collab Gestão Empresarial</span>
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400 mt-1">
                Diagnostic & Pricing Engine
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <HistoryDrawer onLoad={(rec) => { reset(rec.inputs); setActiveSimulationId(rec.id); setSearchParams({ id: rec.id }); }} />
            <Button variant="ghost" size="sm" onClick={handleReset} className="hidden md:flex">
              <RefreshCcw className="w-4 h-4 mr-2" /> Novo
            </Button>
            <Button variant="default" size="sm" onClick={handleSave} disabled={saveMutation.isPending} className="font-bold">
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Salvar
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <FormProvider {...methods}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-7 print:hidden">
              {isInitialLoading ? (
                <div className="space-y-8">
                  <Skeleton className="h-[400px] w-full rounded-2xl" />
                  <Skeleton className="h-[300px] w-full rounded-2xl" />
                  <Skeleton className="h-[300px] w-full rounded-2xl" />
                </div>
              ) : (
                <DiagnosticForm register={register} control={control} setValue={setValue} />
              )}
            </div>
            <div className="lg:col-span-5 relative print:col-span-12">
              {isInitialLoading ? (
                <Skeleton className="h-[600px] w-full rounded-2xl shadow-xl" />
              ) : (
                <ResultsPanel
                  result={pricingResult}
                  companyName={formValues.companyName}
                  commercialRep={formValues.commercialRep}
                  activeId={activeSimulationId}
                />
              )}
            </div>
          </div>
        </FormProvider>
      </main>
    </div>
  );
}