import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { DiagnosticInputs, calculatePricing } from '@/lib/pricing-engine';
import { DiagnosticForm } from '@/components/calculator/DiagnosticForm';
import { ResultsPanel } from '@/components/calculator/ResultsPanel';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Toaster } from '@/components/ui/sonner';
import { Calculator } from 'lucide-react';
const schema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  annualRevenue: z.number().min(0),
  monthlyNFSe: z.number().min(0),
  monthlyBankSchedules: z.number().min(0),
  needsDRE: z.boolean(),
  needsCashFlow: z.boolean(),
  needsTaxPlanning: z.boolean(),
  manualNfseEntry: z.boolean(),
  inventoryManagement: z.boolean(),
});
const defaultValues: DiagnosticInputs = {
  companyName: '',
  annualRevenue: 1200000,
  monthlyNFSe: 30,
  monthlyBankSchedules: 20,
  needsDRE: false,
  needsCashFlow: false,
  needsTaxPlanning: false,
  manualNfseEntry: false,
  inventoryManagement: false,
};
export function HomePage() {
  const { register, control, watch, setValue } = useForm<DiagnosticInputs>({
    resolver: zodResolver(schema),
    defaultValues,
  });
  const formValues = watch();
  const pricingResult = useMemo(() => {
    return calculatePricing(formValues);
  }, [formValues]);
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-background">
      <ThemeToggle />
      <header className="border-b bg-white dark:bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Collab DealDesk</h1>
          </div>
          <div className="hidden md:block text-sm text-muted-foreground font-medium">
            Commercial Diagnostic & Pricing Engine v2.4
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-foreground">Client Diagnostic</h2>
                <p className="text-muted-foreground mt-2">Fill in the operational profile to determine the ideal commercial proposal.</p>
              </div>
              <DiagnosticForm 
                register={register} 
                control={control} 
                setValue={setValue} 
              />
            </div>
            <div className="lg:col-span-5 relative">
              <ResultsPanel result={pricingResult} />
            </div>
          </div>
        </div>
      </main>
      <Toaster richColors closeButton />
    </div>
  );
}