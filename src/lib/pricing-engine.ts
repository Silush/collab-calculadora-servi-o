import { DiagnosticInputs, PricingResult, PlanType } from "@shared/types";
import { PLANS } from "./plans";
export function calculatePricing(inputs: DiagnosticInputs): PricingResult {
  const {
    monthlyRevenue,
    annualRevenue,
    needsOps,
    needsStrategic,
    manualBankSchedules,
    manualNFSe,
    monthlyBoletos,
    meetingHours,
    needsStrategicMeetings,
    needsAnalyticalMeetings
  } = inputs;
  // 1. Recommendation Logic
  let recommendedPlan: PlanType = 'essential';
  if (needsOps && needsStrategic) {
    recommendedPlan = 'premium';
  } else if (needsStrategic || annualRevenue > 4800000) {
    recommendedPlan = 'business';
  } else if (needsOps && monthlyRevenue <= 200000) {
    recommendedPlan = 'essential';
  } else if (needsOps) {
    recommendedPlan = 'premium'; // If ops needed but revenue high, premium is safer
  }
  const plan = PLANS[recommendedPlan];
  const breakdown: PricingResult['breakdown'] = [];
  // 2. Base & Setup
  const baseFee = plan.baseFee;
  const setupFee = plan.setupFee;
  breakdown.push({ label: "Plano Base", value: baseFee, type: 'base' });
  if (setupFee > 0) breakdown.push({ label: "Taxa de Implantação", value: setupFee, type: 'setup' });
  // 3. Operational Overages
  let overageFees = 0;
  if (recommendedPlan !== 'business') {
    const p = plan as typeof PLANS.essential | typeof PLANS.premium;
    const bankOver = Math.max(0, manualBankSchedules - p.limits.bankSchedules);
    const nfseOver = Math.max(0, manualNFSe - p.limits.nfse);
    const boletoOver = Math.max(0, monthlyBoletos - p.limits.boletos);
    const bankCost = bankOver * p.addonUnit;
    const nfseCost = nfseOver * p.addonUnit;
    const boletoCost = boletoOver * p.addonUnit;
    overageFees = bankCost + nfseCost + boletoCost;
    if (overageFees > 0) {
      breakdown.push({ label: "Excedentes Operacionais", value: overageFees, type: 'addon' });
    }
  }
  // 4. Revenue Tiers (Business & Premium)
  let revenueSurcharge = 0;
  if (recommendedPlan === 'business' || recommendedPlan === 'premium') {
    const p = plan as typeof PLANS.business | typeof PLANS.premium;
    const excessRevenue = Math.max(0, annualRevenue - 4800000);
    const tiers = Math.ceil(excessRevenue / 1000000);
    revenueSurcharge = tiers * p.revenueTierUnit;
    if (revenueSurcharge > 0) {
      breakdown.push({ label: "Adicional por Faturamento", value: revenueSurcharge, type: 'addon' });
    }
  }
  // 5. Meeting Hours
  const totalMeetings = meetingHours + (needsStrategicMeetings ? 2 : 0) + (needsAnalyticalMeetings ? 2 : 0);
  const meetingFees = totalMeetings * plan.meetingUnit;
  if (meetingFees > 0) {
    breakdown.push({ label: "Horas de Consultoria", value: meetingFees, type: 'addon' });
  }
  // 6. Savings Calculation (Premium bundle vs separate)
  let savingsVsIndividual: number | undefined;
  if (recommendedPlan === 'premium') {
    const separateCost = PLANS.essential.baseFee + PLANS.business.baseFee;
    savingsVsIndividual = separateCost - PLANS.premium.baseFee;
  }
  // 7. Sales Arguments & Alerts
  const arguments_list: string[] = [];
  const alerts: string[] = [];
  if (recommendedPlan === 'premium') {
    arguments_list.push("Visão 360º: Operacional eficiente + Estratégico consultivo.");
    arguments_list.push("Redução de riscos fiscais e trabalhistas com BPO completo.");
    if (savingsVsIndividual && savingsVsIndividual > 0) {
      arguments_list.push(`Economia de R$ ${savingsVsIndividual.toLocaleString()} ao unificar serviços.`);
    }
  } else if (recommendedPlan === 'business') {
    arguments_list.push("Foco total em inteligência financeira e suporte à decisão.");
    arguments_list.push("Ideal para empresas que já possuem operação interna madura.");
  }
  if (monthlyRevenue > 200000 && recommendedPlan === 'essential') {
    alerts.push("Faturamento acima do limite do plano Essential. Risco de desenquadramento.");
  }
  if (inputs.hasERP === 'no' && inputs.needsOps) {
    alerts.push("Sem ERP: Recomenda-se implantação do ERP Collab para automação.");
  }
  const totalMonthly = baseFee + overageFees + revenueSurcharge + meetingFees;
  return {
    recommendedPlan,
    baseFee,
    setupFee,
    overageFees,
    revenueSurcharge,
    meetingFees,
    totalMonthly,
    totalInitial: totalMonthly + setupFee,
    savingsVsIndividual,
    arguments: arguments_list,
    alerts,
    breakdown
  };
}