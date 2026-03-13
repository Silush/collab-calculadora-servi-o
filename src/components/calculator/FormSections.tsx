import React from 'react';
import { useWatch, Controller, useFormContext, UseFormRegister } from 'react-hook-form';
import { DiagnosticInputs } from '@shared/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { SEGMENT_GROUPS } from '@/lib/plans';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, Minus, Plus, Wand2 } from 'lucide-react';
import { NumericFormat } from 'react-number-format';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
  CommandItem,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';

export const GeneralInfoSection = React.memo(() => {
  const { control, setValue, register } = useFormContext<DiagnosticInputs>();
  const hasERP = useWatch({ name: 'hasERP' });
  const monthlyRevenue = useWatch({ name: 'monthlyRevenue' }) || 0;
  const annualRevenue = useWatch({ name: 'annualRevenue' }) || 0;
  const [open, setOpen] = React.useState(false);
  const syncAnnualRevenue = () => {
    if (monthlyRevenue > 0) {
      setValue('annualRevenue', monthlyRevenue * 12, { shouldDirty: true, shouldValidate: true });
    }
  };
  return (
    <Card className="shadow-md border-slate-200 transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-black text-slate-800">Dados Gerais do Lead</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <Label className="font-bold text-slate-700">Nome da Empresa</Label>
          <Input {...register('companyName')} placeholder="Ex: Collab Tecnologia LTDA" className="bg-slate-50/50" />
        </div>
        <div className="space-y-2 flex flex-col">
          <Label className="mb-2 font-bold text-slate-700">Segmento</Label>
          <Controller
            control={control}
            name="segment"
            render={({ field }) => (
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                      "w-full justify-between font-normal text-left transition-colors bg-slate-50/50",
                      !field.value && "text-muted-foreground",
                      field.value && "border-blue-200 bg-blue-50/20 dark:bg-blue-900/10"
                    )}
                  >
                    <span className="truncate">
                      {field.value ? `Segmento: ${field.value}` : "Escolha o segmento..."}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[var(--radix-popover-trigger-width)] p-0 bg-background/95 backdrop-blur-md border shadow-2xl z-50 rounded-lg overflow-hidden"
                  align="start"
                  sideOffset={4}
                >
                  <Command className="bg-card text-card-foreground">
                    <CommandInput placeholder="Buscar segmento..." className="h-11" />
                    <CommandList className="max-h-72 overflow-y-auto border-t border-muted/50">
                      <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                        Nenhum segmento encontrado.
                      </CommandEmpty>
                      {SEGMENT_GROUPS.map((group) => (
                        <CommandGroup
                          key={group.label}
                          heading={group.label}
                          className="px-2 text-muted-foreground/80 font-bold"
                        >
                          {group.items.map((item) => (
                            <CommandItem
                              key={item}
                              value={item}
                              onSelect={() => {
                                field.onChange(item);
                                setOpen(false);
                              }}
                              className="aria-selected:bg-blue-500 aria-selected:text-white cursor-pointer transition-colors py-2 px-3 rounded-md"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === item ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <span className="font-medium">{item}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
          />
        </div>
        <div className="space-y-2">
          <Label className="font-bold text-slate-700">Nome do Lead</Label>
          <Input {...register('leadName')} placeholder="Ex: João Silva" className="bg-slate-50/50" />
        </div>
        <div className="space-y-2">
          <Label className="font-bold text-slate-700">Cargo / Função</Label>
          <Input {...register('leadRole')} placeholder="Ex: CFO, Diretor Financeiro" className="bg-slate-50/50" />
        </div>
        <div className="space-y-2">
          <Label className="font-bold text-slate-700">Faturamento Mensal (R$)</Label>
          <Controller
            control={control}
            name="monthlyRevenue"
            render={({ field: { ref, onChange, value, ...rest } }) => (
              <NumericFormat
                {...rest}
                getInputRef={ref}
                value={value}
                onValueChange={(v) => onChange(v.floatValue ?? 0)}
                thousandSeparator="."
                decimalSeparator=","
                prefix="R$ "
                decimalScale={2}
                fixedDecimalScale={true}
                placeholder="R$ 0,00"
                customInput={Input}
                className="bg-slate-50/50"
              />
            )}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="font-bold text-slate-700">Faturamento Anual (R$)</Label>
            {monthlyRevenue > 0 && annualRevenue === 0 && (
              <button 
                type="button" 
                onClick={syncAnnualRevenue}
                className="text-[10px] flex items-center gap-1 text-blue-600 hover:text-blue-700 font-bold uppercase"
              >
                <Wand2 className="w-3 h-3" /> Sugerir (12x)
              </button>
            )}
          </div>
          <Controller
            control={control}
            name="annualRevenue"
            render={({ field: { ref, onChange, value, ...rest } }) => (
              <NumericFormat
                {...rest}
                getInputRef={ref}
                value={value}
                onValueChange={(v) => onChange(v.floatValue ?? 0)}
                thousandSeparator="."
                decimalSeparator=","
                prefix="R$ "
                decimalScale={2}
                fixedDecimalScale={true}
                placeholder="R$ 0,00"
                customInput={Input}
                className="bg-slate-50/50"
              />
            )}
          />
        </div>
        <div className="space-y-3">
          <Label className="font-bold text-slate-700">Já possui ERP?</Label>
          <Controller
            control={control}
            name="hasERP"
            render={({ field }) => (
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
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
            )}
          />
        </div>
        <div className="space-y-3">
          <Label className="font-bold text-slate-700">Possui equipe de operação própria?</Label>
          <Controller
            control={control}
            name="internalOpsTeam"
            render={({ field }) => (
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                className="flex items-center space-x-4 pt-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="ops-yes" />
                  <Label htmlFor="ops-yes" className="font-normal">Sim</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="ops-no" />
                  <Label htmlFor="ops-no" className="font-normal">Não</Label>
                </div>
              </RadioGroup>
            )}
          />
        </div>
        <AnimatePresence mode="wait">
          {hasERP === 'yes' ? (
            <motion.div
              key="erp-name"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 overflow-hidden md:col-span-2"
            >
              <Label className="font-bold text-slate-700">Nome do ERP Atual</Label>
              <Input {...register('erpName')} placeholder="Ex: SAP, Totvs, Omie..." className="bg-slate-50/50" />
            </motion.div>
          ) : (
            <motion.div
              key="collab-erp"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 overflow-hidden md:col-span-2"
            >
              <Label className="font-bold text-slate-700">Deseja implantar o ERP parceiro Collab?</Label>
              <Controller
                control={control}
                name="needsCollabERP"
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="flex items-center space-x-4 pt-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="collab-erp-yes" />
                      <Label htmlFor="collab-erp-yes" className="font-normal">Sim</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="collab-erp-no" />
                      <Label htmlFor="collab-erp-no" className="font-normal">Não</Label>
                    </div>
                  </RadioGroup>
                )}
              />
            </motion.div>
          )}
        </AnimatePresence>
        <div className="space-y-2 md:col-span-2 pt-2 border-t">
          <Label className="font-bold text-slate-700">Responsável Comercial (Collab)</Label>
          <Input
            {...register('commercialRep')}
            placeholder="Seu nome para a assinatura da proposta"
            className="bg-blue-50/30 border-blue-100 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
      </CardContent>
    </Card>
  );
});
GeneralInfoSection.displayName = "GeneralInfoSection";
interface VolumeControlProps {
  label: string;
  name: keyof DiagnosticInputs;
  suffix: string;
}
const VolumeControl = ({ label, name, suffix }: VolumeControlProps) => {
  const { control, setValue } = useFormContext<DiagnosticInputs>();
  const value = useWatch({ name: name as any }) || 0;
  const updateValue = (newVal: number) => {
    setValue(name as any, Math.max(0, newVal), { shouldDirty: true, shouldTouch: true });
  };
  return (
    <div className="space-y-4 p-5 bg-slate-50/80 rounded-2xl border border-slate-200/60 transition-all hover:bg-slate-100/50">
      <div className="flex justify-between items-center">
        <Label className="font-bold text-slate-800 text-sm">{label}</Label>
        <span className="text-[10px] font-black tracking-wider uppercase text-blue-600 bg-blue-100/50 px-2.5 py-1 rounded-full border border-blue-200">
          {value} {suffix}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-11 w-11 shrink-0 border-slate-300 shadow-sm bg-white hover:bg-slate-50 active:scale-95 transition-all"
          onClick={() => updateValue(value - 1)}
          disabled={value <= 0}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Input
          type="number"
          className="text-center font-mono font-black text-xl h-11 border-slate-300 focus-visible:ring-blue-500 bg-white"
          value={value}
          onChange={(e) => {
            const val = parseInt(e.target.value);
            updateValue(isNaN(val) ? 0 : val);
          }}
          min={0}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-11 w-11 shrink-0 border-slate-300 shadow-sm bg-white hover:bg-slate-50 active:scale-95 transition-all"
          onClick={() => updateValue(value + 1)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
export const OperationalSection = React.memo(() => {
  const { control, setValue } = useFormContext<DiagnosticInputs>();
  const needsOps = useWatch({ name: 'needsOps' });
  return (
    <Card className="shadow-md border-slate-200 transition-all duration-300 hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xl font-black text-slate-800">Volume Operacional</CardTitle>
        <div className="flex items-center space-x-2">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-tight">Ativar BPO?</Label>
          <Switch checked={!!needsOps} onCheckedChange={(val) => setValue('needsOps', val, { shouldDirty: true })} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        <VolumeControl
          label="Agendamentos Bancários/Mês"
          name="manualBankSchedules"
          suffix="agendamentos"
        />
        <VolumeControl
          label="Emissões de NFSe/Mês"
          name="manualNFSe"
          suffix="notas"
        />
        <VolumeControl
          label="Boletos Gerados/Mês"
          name="monthlyBoletos"
          suffix="boletos"
        />
      </CardContent>
    </Card>
  );
});
OperationalSection.displayName = "OperationalSection";
export const StrategicSection = React.memo(() => {
  const { control, setValue } = useFormContext<DiagnosticInputs>();
  const needsStrategic = useWatch({ name: 'needsStrategic' });
  const allValues = useWatch();
  const items = [
    { label: "Análise de DRE", name: "needsDRE" },
    { label: "Planejamento Orçamentário", name: "needsBudgeting" },
    { label: "Dashboards BI", name: "needsDashboards" },
    { label: "Controladoria", name: "needsControllership" },
    { label: "Reuniões Estratégicas", name: "needsStrategicMeetings" },
    { label: "Reuniões Analíticas", name: "needsAnalyticalMeetings" },
  ];
  return (
    <Card className="shadow-md border-slate-200 transition-all duration-300 hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-black text-slate-800">Necessidades Consultivas</CardTitle>
        <div className="flex items-center space-x-2">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-tight">Ativar CFO?</Label>
          <Switch checked={!!needsStrategic} onCheckedChange={(val) => setValue('needsStrategic', val, { shouldDirty: true })} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(item => (
            <div key={item.name} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-200/60 hover:border-blue-200 transition-colors">
              <Label className="text-sm font-bold text-slate-700">{item.label}</Label>
              <Switch
                disabled={!needsStrategic}
                checked={!!(allValues as any)[item.name]}
                onCheckedChange={(val) => setValue(item.name as any, val, { shouldDirty: true })}
              />
            </div>
          ))}
        </div>
        <div className="border-t pt-6 space-y-6">
          <div className="flex items-center justify-between bg-blue-50/20 p-4 rounded-2xl border border-blue-100/50">
            <Label className="text-sm font-black text-slate-800">Equipe Financeira Interna?</Label>
            <Controller
              control={control}
              name="internalFinanceTeam"
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="flex items-center space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="fin-yes" />
                    <Label htmlFor="fin-yes" className="text-xs font-normal">Sim</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="fin-no" />
                    <Label htmlFor="fin-no" className="text-xs font-normal">Não</Label>
                  </div>
                </RadioGroup>
              )}
            />
          </div>
          <VolumeControl
            label="Horas de Consultoria Adicionais/Mês"
            name="meetingHours"
            suffix="horas"
          />
        </div>
      </CardContent>
    </Card>
  );
});
StrategicSection.displayName = "StrategicSection";