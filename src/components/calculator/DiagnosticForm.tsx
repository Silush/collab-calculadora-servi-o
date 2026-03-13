import React from 'react';
import { UseFormRegister, Control, UseFormSetValue } from 'react-hook-form';
import { DiagnosticInputs } from '@shared/types';
import { GeneralInfoSection, OperationalSection, StrategicSection } from './FormSections';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
interface DiagnosticFormProps {
  register: UseFormRegister<DiagnosticInputs>;
  control: Control<DiagnosticInputs>;
  setValue: UseFormSetValue<DiagnosticInputs>;
}
export function DiagnosticForm({ register, control, setValue }: DiagnosticFormProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <GeneralInfoSection 
        register={register} 
        control={control} 
        setValue={(name, val) => setValue(name as any, val)} 
      />
      <OperationalSection 
        register={register} 
        control={control} 
        setValue={(name, val) => setValue(name as any, val)} 
      />
      <StrategicSection 
        control={control} 
        setValue={(name, val) => setValue(name as any, val)} 
      />
      <Card className="shadow-sm border-slate-200">
        <CardContent className="pt-6 space-y-2">
          <Label>Observações Adicionais</Label>
          <Textarea 
            {...register('notes')} 
            placeholder="Detalhes sobre equipe, ERP atual ou gargalos operacionais..." 
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>
    </div>
  );
}