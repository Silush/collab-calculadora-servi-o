import React from 'react';
import { UseFormRegister, Control, useWatch, UseFormSetValue, Controller } from 'react-hook-form';
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
import { Check, ChevronsUpDown, Minus, Plus } from 'lucide-react';
import { NumericFormat } from 'react-number-format';
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
export const GeneralInfoSection = React.memo(({ register, control, setValue }: SectionProps) => {
  const hasERP = useWatch({ control, name: 'hasERP' });
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
                    className="w-full justify-between font-normal"
                  >
                    {field.value ? field.value : "Selecione o segmento..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar segmento..." />
                    <CommandList>
                      <CommandEmpty>Nenhum segmento encontrado.</CommandEmpty>
                      {SEGMENT_GROUPS.map((group) => (
                        <CommandGroup key={group.label} heading={group.label}>
                          {group.items.map((item) => (
                            <CommandItem
                              key={item}
                              value={item}
                              onSelect={() => {
                                field.onChange(item);
                                setOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === item ? "opacity-100" : "opacity-0"
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
            )}
          />
        </div>
        <div className="space-y-2">
          <Label>Faturamento Mensal (R$)</Label>
          <Controller
            control={control}
            name="monthlyRevenue"
            render={({ field }) => (
              <NumericFormat
                thousandSeparator="."
                decimalSeparator=","
                prefix="R$ "
                decimalScale={2}
                fixedDecimalScale
                placeholder="R$ 0,00"
                value={field.value}
                onValueChange={(values) => field.onChange(values.floatValue || 0)}
                customInput={(props) => <Input {...props} />}
              />
            )}
          />
        </div>
        <div className="space-y-2">
          <Label>Faturamento Anual Últ. 12m (R$)</Label>
          <Controller
            control={control}
            name="annualRevenue"
            render={({ field }) => (
              <NumericFormat
                thousandSeparator="."
                decimalSeparator=","
                prefix="R$ "
                decimalScale={2}
                fixedDecimalScale
                placeholder="R$ 0,00"
                value={field.value}
                onValueChange={(values) => field.onChange(values.floatValue || 0)}
                customInput={(props) => <Input {...props} />}
              />
            )}
          />
        </div>
        <div className="space-y-2">
          <Label>Responsável Comercial (para assinatura)</Label>
          <Input {...register('commercialRep')} placeholder="Seu nome para assinatura" />
        </div>
        <div className="space-y-3">
          <Label>Já possui ERP?</Label>
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
});
GeneralInfoSection.displayName = "GeneralInfoSection";
interface VolumeControlProps {
  label: string;
  name: keyof DiagnosticInputs;
  control: Control<DiagnosticInputs>;
  setValue: UseFormSetValue<DiagnosticInputs>;
  suffix: string;
}
const VolumeControl = ({ label, name, control, setValue, suffix }: VolumeControlProps) => {
  const value = useWatch({ control, name: name as any }) as number ?? 0;
  const updateValue = (newVal: number) => {
    setValue(name as any, Math.max(0, newVal));
  };
  return (
    <div className="space-y-4 p-4 bg-slate-50/50 rounded-xl border border-slate-100 transition-colors hover:bg-slate-50">
      <div className="flex justify-between items-center">
        <Label className="font-semibold text-slate-700">{label}</Label>
        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
          {value} {suffix}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-10 shrink-0 border-slate-200"
          onClick={() => updateValue(value - 1)}
          disabled={value <= 0}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Input
          type="number"
          className="text-center font-mono font-bold text-lg h-10 border-slate-200 focus-visible:ring-blue-500"
          value={value}
          onChange={(e) => updateValue(parseInt(e.target.value) || 0)}
          min={0}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-10 shrink-0 border-slate-200"
          onClick={() => updateValue(value + 1)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
export const OperationalSection = React.memo(({ control, setValue }: Pick<SectionProps, 'control' | 'setValue'>) => {
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
      <CardContent className="space-y-4">
        <VolumeControl
          label="Agendamentos Bancários/Mês"
          name="manualBankSchedules"
          control={control}
          setValue={setValue}
          suffix="agendamentos"
        />
        <VolumeControl
          label="Emissões de NFSe/Mês"
          name="manualNFSe"
          control={control}
          setValue={setValue}
          suffix="notas"
        />
        <VolumeControl
          label="Boletos Gerados/Mês"
          name="monthlyBoletos"
          control={control}
          setValue={setValue}
          suffix="boletos"
        />
      </CardContent>
    </Card>
  );
});
OperationalSection.displayName = "OperationalSection";
export const StrategicSection = React.memo(({ control, setValue }: Pick<SectionProps, 'control' | 'setValue'>) => {
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
          <div key={item.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
            <Label className="text-sm font-medium">{item.label}</Label>
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
});
StrategicSection.displayName = "StrategicSection";