import React from 'react';
import { Control, UseFormRegister, useWatch } from 'react-hook-form';
import { DiagnosticInputs } from '@/lib/pricing-engine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
interface DiagnosticFormProps {
  register: UseFormRegister<DiagnosticInputs>;
  control: Control<DiagnosticInputs>;
  setValue: (name: keyof DiagnosticInputs, value: any) => void;
}
export function DiagnosticForm({ register, control, setValue }: DiagnosticFormProps) {
  const annualRevenue = useWatch({ control, name: 'annualRevenue' });
  const monthlyNFSe = useWatch({ control, name: 'monthlyNFSe' });
  const monthlyBankSchedules = useWatch({ control, name: 'monthlyBankSchedules' });
  return (
    <div className="space-y-8 pb-20">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">General Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input id="companyName" {...register('companyName')} placeholder="e.g. Acme Corp" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between">
              <Label>Annual Revenue: <span className="text-blue-600 font-bold">${annualRevenue.toLocaleString()}</span></Label>
            </div>
            <Slider
              value={[annualRevenue]}
              onValueChange={(vals) => setValue('annualRevenue', vals[0])}
              max={10000000}
              step={100000}
              className="py-4"
            />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Operational Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between">
              <Label>Monthly NFSe Emissions: <span className="font-bold">{monthlyNFSe}</span></Label>
            </div>
            <Slider
              value={[monthlyNFSe]}
              onValueChange={(vals) => setValue('monthlyNFSe', vals[0])}
              max={500}
              step={5}
              className="py-4"
            />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between">
              <Label>Bank Schedules/Month: <span className="font-bold">{monthlyBankSchedules}</span></Label>
            </div>
            <Slider
              value={[monthlyBankSchedules]}
              onValueChange={(vals) => setValue('monthlyBankSchedules', vals[0])}
              max={500}
              step={5}
              className="py-4"
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Manual NFSe Entry?</Label>
              <p className="text-xs text-muted-foreground">Is the process manual without ERP integration?</p>
            </div>
            <Switch 
              checked={useWatch({ control, name: 'manualNfseEntry' })}
              onCheckedChange={(val) => setValue('manualNfseEntry', val)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Inventory Management?</Label>
              <p className="text-xs text-muted-foreground">Does the client require stock control oversight?</p>
            </div>
            <Switch 
              checked={useWatch({ control, name: 'inventoryManagement' })}
              onCheckedChange={(val) => setValue('inventoryManagement', val)}
            />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Consultative & Strategic Needs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>DRE Analysis (P&L)</Label>
            <Switch 
              checked={useWatch({ control, name: 'needsDRE' })}
              onCheckedChange={(val) => setValue('needsDRE', val)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Cash Flow Management</Label>
            <Switch 
              checked={useWatch({ control, name: 'needsCashFlow' })}
              onCheckedChange={(val) => setValue('needsCashFlow', val)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Strategic Tax Planning</Label>
            <Switch 
              checked={useWatch({ control, name: 'needsTaxPlanning' })}
              onCheckedChange={(val) => setValue('needsTaxPlanning', val)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}