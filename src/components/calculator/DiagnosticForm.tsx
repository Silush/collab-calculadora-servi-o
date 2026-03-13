import React from 'react';
import { useFormContext } from 'react-hook-form';
import { DiagnosticInputs } from '@shared/types';
import { GeneralInfoSection, OperationalSection, StrategicSection } from './FormSections';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function DiagnosticForm() {
  const { register, control, setValue } = useFormContext<DiagnosticInputs>();
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <GeneralInfoSection />
      <OperationalSection />
      <StrategicSection />
      <Card className="shadow-sm border-slate-200">
        <CardContent className="pt-6 space-y-2">
          <Label>Observações Adicionais</Label>
          <Textarea
            {...register('notes')}
            placeholder="Gargalos operacionais, prazos, equipe atual, ERP em uso ou outras necessidades específicas..."
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>
    </div>
  );
}