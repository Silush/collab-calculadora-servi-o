import React from 'react';
import { UseFormRegister, Control, useWatch, UseFormSetValue } from 'react-hook-form';
import { DiagnosticInputs } from '@shared/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { SEGMENT_GROUPS } from '@/lib/plans';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
interface SectionProps {
  register: UseFormRegister<DiagnosticInputs>;
  control: Control<DiagnosticInputs>;
  setValue: UseFormSetValue<DiagnosticInputs>;
}
export function GeneralInfoSection({ register, control, setValue }: SectionProps) {
  const hasERP = useWatch({ control, name: 'hasERP' });
  const selectedSegment = useWatch({ control, name: 'segment' });
  const [open, setOpen] = React.useState(false);
  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Dados Gerais do Lead</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Nome da Empresa</Label>
          <Input {...register('companyName')} placeholder="Ex: Collab Tecnologia LTDA" />
        </div>
        <div className="space-y-2 flex flex-col">
          <Label className="mb-2">Segmento</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between font-normal"
              >
                {selectedSegment
                  ? selectedSegment
                  : "Selecione o segmento..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command className="w-full">
                <CommandInput placeholder="Buscar segmento..." />
                <CommandList>
                  <CommandEmpty>Nenhum segmento encontrado.</CommandEmpty>
                  {SEGMENT_GROUPS.map((group) => (
                    <CommandGroup key={group.label} heading={group.label}>
                      {group.items.map((item) => (
                        <CommandItem
                          key={item}
                          value={item}
                          onSelect={(currentValue) => {
                            setValue('segment', currentValue);
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedSegment === item ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {item}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ))}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label>Faturamento Mensal (R$)</Label>
          <Input type="number" {...register('monthlyRevenue', { valueAsNumber: true })} />
        </div>
        <div className="space-y-2">
          <Label>Faturamento Anual Últ. 12m (R$)</Label>
          <Input type="number" {...register('annualRevenue', { valueAsNumber: true })} />
        </div>
        <div className="space-y-2">
          <Label>Responsável Comercial (para assinatura)</Label>
          <Input {...register('commercialRep')} placeholder="Seu nome para assinatura" />
        </div>
        <div className="space-y-3">
          <Label>Já possui ERP?</Label>
          <RadioGroup
            value={hasERP}
            onValueChange={(val) => setValue('hasERP', val as "yes" | "no")}
            className="flex items-center space-x-4 pt-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="erp-yes" />
              <Label htmlFor="erp-yes" className="font-normal">Sim</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="erp-no" />
              <Label htmlFor="erp-no" className="font-normal">Não</Label>
            </div>
          </RadioGroup>
        </div>
        <AnimatePresence>
          {hasERP === 'yes' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 overflow-hidden md:col-span-2"
            >
              <Label>Nome do ERP Atual</Label>
              <Input {...register('erpName')} placeholder="Ex: SAP, Totvs, Omie..." />
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
export function OperationalSection({ control, setValue }: Pick<SectionProps, 'control' | 'setValue'>) {
  const bank = useWatch({ control, name: 'manualBankSchedules' }) ?? 0;
  const nfse = useWatch({ control, name: 'manualNFSe' }) ?? 0;
  const boletos = useWatch({ control, name: 'monthlyBoletos' }) ?? 0;
  const needsOps = useWatch({ control, name: 'needsOps' });
  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg font-bold">Volume Operacional</CardTitle>
        <div className="flex items-center space-x-2">
          <Label className="text-xs text-muted-foreground">Necessita BPO?</Label>
          <Switch checked={!!needsOps} onCheckedChange={(val) => setValue('needsOps', val)} />
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-4">
          <div className="flex justify-between">
            <Label>Agendamentos Bancários/Mês</Label>
            <span className="font-mono font-bold text-blue-600">{bank}</span>
          </div>
          <Slider value={[bank]} max={200} step={5} onValueChange={(v) => setValue('manualBankSchedules', v[0])} />
        </div>
        <div className="space-y-4">
          <div className="flex justify-between">
            <Label>Emissões de NFSe/Mês</Label>
            <span className="font-mono font-bold text-blue-600">{nfse}</span>
          </div>
          <Slider value={[nfse]} max={200} step={5} onValueChange={(v) => setValue('manualNFSe', v[0])} />
        </div>
        <div className="space-y-4">
          <div className="flex justify-between">
            <Label>Boletos Gerados/Mês</Label>
            <span className="font-mono font-bold text-blue-600">{boletos}</span>
          </div>
          <Slider value={[boletos]} max={200} step={5} onValueChange={(v) => setValue('monthlyBoletos', v[0])} />
        </div>
      </CardContent>
    </Card>
  );
}
export function StrategicSection({ control, setValue }: Pick<SectionProps, 'control' | 'setValue'>) {
  const needsStrategic = useWatch({ control, name: 'needsStrategic' });
  const allValues = useWatch({ control });
  const items = [
    { label: "Análise de DRE", name: "needsDRE" },
    { label: "Planejamento Orçamentário", name: "needsBudgeting" },
    { label: "Dashboards BI", name: "needsDashboards" },
    { label: "Controladoria", name: "needsControllership" },
    { label: "Reuniões Estratégicas", name: "needsStrategicMeetings" },
    { label: "Reuniões Analíticas", name: "needsAnalyticalMeetings" },
  ];
  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg font-bold">Necessidades Consultivas</CardTitle>
        <Switch checked={!!needsStrategic} onCheckedChange={(val) => setValue('needsStrategic', val)} />
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map(item => (
          <div key={item.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <Label className="text-sm">{item.label}</Label>
            <Switch
              disabled={!needsStrategic}
              checked={!!(allValues as any)[item.name]}
              onCheckedChange={(val) => setValue(item.name as any, val)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}