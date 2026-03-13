import { DiagnosticInputs, PricingResult, PlanType } from "@shared/types";
import { PLANS } from "./plans";
import { formatCurrency } from "./utils";
export function calculatePricing(inputs: DiagnosticInputs, forcePlan?: PlanType): PricingResult {
  const monthlyRevenue = Number(inputs.monthlyRevenue) || 0;
  const annualRevenue = Number(inputs.annualRevenue) || 0;
  const needsOps = Boolean(inputs.needsOps);
  const needsStrategic = Boolean(inputs.needsStrategic);
  const manualBankSchedules = Number(inputs.manualBankSchedules) || 0;
  const manualNFSe = Number(inputs.manualNFSe) || 0;
  const monthlyBoletos = Number(inputs.monthlyBoletos) || 0;
  const meetingHours = Number(inputs.meetingHours) || 0;
  const needsStrategicMeetings = Boolean(inputs.needsStrategicMeetings);
  const needsAnalyticalMeetings = Boolean(inputs.needsAnalyticalMeetings);
  // 1. Recommendation Logic (skipped if forcePlan is provided)
  let recommendedPlan: PlanType = forcePlan || 'essential';
  if (!forcePlan) {
    if (needsOps && needsStrategic) {
      recommendedPlan = 'premium';
    } else if (needsStrategic || annualRevenue > 4800000) {
      recommendedPlan = 'business';
    } else if (needsOps && monthlyRevenue <= 200000) {
      recommendedPlan = 'essential';
    } else if (needsOps) {
      recommendedPlan = 'premium';
    }
  }
  const plan = PLANS[recommendedPlan];
  const breakdown: PricingResult['breakdown'] = [];
  // 2. Base & Setup
  const baseFee = plan.baseFee;
  const setupFee = plan.setupFee;
  breakdown.push({ label: "Plano Base", value: baseFee, type: 'base' });
  if (setupFee > 0) breakdown.push({ label: "Taxa de Implantação", value: setupFee, type: 'setup' });
  // 3. Operational Overages (Applied to Essential and Premium)
  let overageFees = 0;
  if (recommendedPlan === 'essential' || recommendedPlan === 'premium') {
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
  // 4. Revenue Tiers (Applied to Business and Premium)
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
  // 5. Meeting Hours (Uses the specific plan's meetingUnit)
  const totalMeetings = meetingHours + (needsStrategicMeetings ? 2 : 0) + (needsAnalyticalMeetings ? 2 : 0);
  const meetingFees = totalMeetings * plan.meetingUnit;
  if (meetingFees > 0) {
    breakdown.push({ label: "Horas de Consultoria", value: meetingFees, type: 'addon' });
  }
  // 6. Savings Calculation
  let savingsVsIndividual: number | undefined;
  if (recommendedPlan === 'premium') {
    const separateCost = PLANS.essential.baseFee + PLANS.business.baseFee;
    savingsVsIndividual = separateCost - PLANS.premium.baseFee;
  }
  // 7. Sales Arguments & Alerts
  const arguments_list: string[] = [];
  const alerts: string[] = [];
  if (recommendedPlan === 'premium') {
    arguments_list.push("Visão 360º: Operação eficiente combinada com inteligência estratégica.");
    arguments_list.push("Redução de riscos fiscais e trabalhistas com BPO financeiro completo.");
    if (savingsVsIndividual && savingsVsIndividual > 0) {
      arguments_list.push(`Economia direta de ${formatCurrency(savingsVsIndividual)} ao unificar os serviços.`);
    }
  } else if (recommendedPlan === 'business') {
    arguments_list.push("Foco total em inteligência financeira e suporte à tomada de decisão.");
    arguments_list.push("Ideal para empresas que já possuem operação interna madura.");
  } else {
    arguments_list.push("Regularização do fluxo de caixa e agendamentos com baixo custo.");
  }
  if (monthlyRevenue > 200000 && recommendedPlan === 'essential') {
    alerts.push("Faturamento mensal acima do limite sugerido para o plano Essential.");
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