import React from 'react';
import { PricingResult } from '@/lib/pricing-engine';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, ArrowUpRight, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
interface ResultsPanelProps {
  result: PricingResult;
}
export function ResultsPanel({ result }: ResultsPanelProps) {
  const planColors = {
    essential: 'bg-slate-100 text-slate-800 border-slate-200',
    business: 'bg-blue-100 text-blue-800 border-blue-200',
    premium: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  };
  const planNames = {
    essential: 'Essential BPO',
    business: 'Business CFO',
    premium: 'Premium Finance',
  };
  return (
    <div className="sticky top-8 space-y-6">
      <Card className="overflow-hidden border-2 shadow-2xl">
        <div className={`h-2 w-full ${result.recommendedPlan === 'premium' ? 'bg-emerald-500' : result.recommendedPlan === 'business' ? 'bg-blue-500' : 'bg-slate-500'}`} />
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <Badge variant="outline" className={`capitalize px-3 py-1 text-sm font-semibold ${planColors[result.recommendedPlan]}`}>
              {planNames[result.recommendedPlan]}
            </Badge>
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Recommended Plan</span>
          </div>
          <CardTitle className="text-4xl font-bold pt-4">
            ${result.totalMonthly.toLocaleString()}
            <span className="text-lg font-normal text-muted-foreground ml-1">/mo</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Base Fee</span>
              <span className="font-semibold">${result.baseFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Setup Cost (One-time)</span>
              <span className="font-semibold">${result.setupFee.toLocaleString()}</span>
            </div>
            {result.overageFees > 0 && (
              <div className="flex justify-between text-sm text-amber-600">
                <span>Operational Overages</span>
                <span className="font-semibold">+${result.overageFees.toLocaleString()}</span>
              </div>
            )}
          </div>
          <AnimatePresence mode="wait">
            <motion.div 
              key={result.recommendedPlan}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-muted/50 p-4 rounded-lg space-y-3"
            >
              <h4 className="text-sm font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Sales Arguments
              </h4>
              <ul className="space-y-2">
                {result.arguments.map((arg, i) => (
                  <li key={i} className="text-xs leading-relaxed text-foreground/80 flex gap-2">
                    <span className="text-emerald-500 mt-0.5">•</span> {arg}
                  </li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
          {result.alerts.length > 0 && (
            <div className="space-y-2">
              {result.alerts.map((alert, i) => (
                <div key={i} className="flex gap-2 text-xs bg-amber-50 text-amber-800 p-2 rounded border border-amber-100">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{alert}</span>
                </div>
              ))}
            </div>
          )}
          {result.savingsVsIndividual && result.savingsVsIndividual > 0 && (
            <div className="bg-emerald-600 text-white p-3 rounded-lg text-center animate-pulse">
              <p className="text-xs font-bold uppercase tracking-tighter">Limited Bundle Savings</p>
              <p className="text-lg font-bold">Save ${result.savingsVsIndividual.toLocaleString()} total</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2 pt-0">
          <Button className="w-full btn-gradient py-6 text-lg" onClick={() => window.print()}>
            <ArrowUpRight className="mr-2 w-5 h-5" /> Generate Proposal
          </Button>
          <Button variant="ghost" className="w-full text-xs text-muted-foreground" onClick={() => {}}>
            <Copy className="mr-1 w-3 h-3" /> Copy Summary to Clipboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}