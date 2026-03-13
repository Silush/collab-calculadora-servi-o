import React from 'react';
import { UseFormRegister, Control, useWatch } from 'react-hook-form';
import { DiagnosticInputs } from '@shared/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { SEGMENTS } from '@/lib/plans';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
interface SectionProps {
  register: UseFormRegister<DiagnosticInputs>;
  control: Control<DiagnosticInputs>;
  setValue: (name: keyof DiagnosticInputs, value: any) => void;
}
export function GeneralInfoSection({ register, control, setValue }: SectionProps) {
  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader>
        <CardTitle className="text-lg">Dados Gerais do Lead</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Nome da Empresa</Label>
          <Input {...register('companyName')} placeholder="Ex: Collab Tech" />
        </div>
        <div className="space-y-2">
          <Label>Segmento</Label>
          <Select onValueChange={(val) => setValue('segment', val)}>
            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
            <SelectContent>
              {SEGMENTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Faturamento Mensal (R$)</Label>
          <Input type="number" {...register('monthlyRevenue', { valueAsNumber: true })} />
        </div>
        <div className="space-y-2">
          <Label>Faturamento Anual (R$)</Label>
          <Input type="number" {...register('annualRevenue', { valueAsNumber: true })} />
        </div>
        <div className="space-y-3">
          <Label>Possui ERP?</Label>
          <RadioGroup defaultValue="no" onValueChange={(val) => setValue('hasERP', val as "yes" | "no")}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="erp-yes" /><Label htmlFor="erp-yes">Sim</Label>
              <RadioGroupItem value="no" id="erp-no" /><Label htmlFor="erp-no">Não</Label>
            </div>
          </RadioGroup>
        </div>
        <div className="space-y-3">
          <Label>Equipe Financeira Interna?</Label>
          <RadioGroup defaultValue="no" onValueChange={(val) => setValue('internalFinanceTeam', val as "yes" | "no")}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="fin-yes" /><Label htmlFor="fin-yes">Sim</Label>
              <RadioGroupItem value="no" id="fin-no" /><Label htmlFor="fin-no">Não</Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
}
export function OperationalSection({ register, control, setValue }: SectionProps) {
  const bank = useWatch({ control, name: 'manualBankSchedules' });
  const nfse = useWatch({ control, name: 'manualNFSe' });
  const boletos = useWatch({ control, name: 'monthlyBoletos' });
  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg">Volume Operacional</CardTitle>
        <div className="flex items-center space-x-2">
          <Label className="text-xs text-muted-foreground">Necessita BPO?</Label>
          <Switch checked={useWatch({ control, name: 'needsOps' })} onCheckedChange={(val) => setValue('needsOps', val)} />
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-4">
          <div className="flex justify-between"><Label>Agendamentos Bancários/Mês</Label><span className="font-mono font-bold text-blue-600">{bank}</span></div>
          <Slider value={[bank]} max={200} step={5} onValueChange={(v) => setValue('manualBankSchedules', v[0])} />
        </div>
        <div className="space-y-4">
          <div className="flex justify-between"><Label>Emissões de NFSe/Mês</Label><span className="font-mono font-bold text-blue-600">{nfse}</span></div>
          <Slider value={[nfse]} max={200} step={5} onValueChange={(v) => setValue('manualNFSe', v[0])} />
        </div>
        <div className="space-y-4">
          <div className="flex justify-between"><Label>Boletos Gerados/Mês</Label><span className="font-mono font-bold text-blue-600">{boletos}</span></div>
          <Slider value={[boletos]} max={200} step={5} onValueChange={(v) => setValue('monthlyBoletos', v[0])} />
        </div>
      </CardContent>
    </Card>
  );
}
export function StrategicSection({ control, setValue }: Omit<SectionProps, 'register'>) {
  const needsStrategic = useWatch({ control, name: 'needsStrategic' });
  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg">Necessidades Estratégicas</CardTitle>
        <Switch checked={needsStrategic} onCheckedChange={(val) => setValue('needsStrategic', val)} />
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: "Análise de DRE", name: "needsDRE" },
          { label: "Planejamento Orçamentário", name: "needsBudgeting" },
          { label: "Dashboards BI", name: "needsDashboards" },
          { label: "Controladoria", name: "needsControllership" },
          { label: "Reuniões Estratégicas", name: "needsStrategicMeetings" },
          { label: "Reuniões Analíticas", name: "needsAnalyticalMeetings" },
        ].map(item => (
          <div key={item.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <Label className="text-sm">{item.label}</Label>
            <Switch 
              disabled={!needsStrategic}
              checked={useWatch({ control, name: item.name as any })} 
              onCheckedChange={(val) => setValue(item.name as any, val)} 
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}