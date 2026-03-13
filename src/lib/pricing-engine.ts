import { DiagnosticInputs, PricingResult, PlanType } from "@shared/types";
import { PLANS } from "./plans";
import { formatCurrency } from "./utils";
export function calculatePricing(inputs: DiagnosticInputs): PricingResult {
  const {
    monthlyRevenue = 0,
    annualRevenue = 0,
    needsOps = false,
    needsStrategic = false,
    manualBankSchedules = 0,
    manualNFSe = 0,
    monthlyBoletos = 0,
    meetingHours = 0,
    needsStrategicMeetings = false,
    needsAnalyticalMeetings = false
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
    recommendedPlan = 'premium';
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
  if (inputs.hasERP === 'no' && (inputs.needsOps || inputs.needsCollabERP === 'yes')) {
    alerts.push("Recomendado: Implantação do ERP Collab para garantir automação e compliance.");
  }
  if (manualBankSchedules > 100 || manualNFSe > 100) {
    alerts.push("Alto volume operacional identificado: Recomenda-se revisão de processos para escalabilidade.");
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