import { DiagnosticInputs, PricingResult, PlanType } from "@shared/types";
import { PLANS } from "./plans";
import { formatCurrency } from "./utils";
export function calculatePricing(inputs: DiagnosticInputs, forcePlan?: PlanType): PricingResult {
  // Safety fallback for partial/empty data to prevent UI crashes
  if (!inputs || Object.keys(inputs).length === 0) {
    const defaultPlan = forcePlan || 'essential';
    const p = PLANS[defaultPlan];
    return {
      recommendedPlan: defaultPlan,
      baseFee: p.baseFee,
      setupFee: p.setupFee,
      overageFees: 0,
      revenueSurcharge: 0,
      meetingFees: 0,
      totalMonthly: p.baseFee,
      totalInitial: p.baseFee + p.setupFee,
      arguments: ["Inicie o preenchimento para ver os argumentos."],
      alerts: [],
      breakdown: [{ label: "Plano Base", value: p.baseFee, type: 'base' }]
    };
  }
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
  const segment = inputs.segment || "";
  const erpName = (inputs.erpName || "").toLowerCase();
  const leadRole = (inputs.leadRole || "").toLowerCase();
  // 1. Recommendation Logic
  let recommendedPlan: PlanType = forcePlan || 'essential';
  if (!forcePlan) {
    if (needsOps && needsStrategic) {
      recommendedPlan = 'premium';
    } else if (needsStrategic || annualRevenue > 4800000) {
      recommendedPlan = 'business';
    } else if (needsOps && (monthlyRevenue <= 200000 && manualNFSe <= 20)) {
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
  if (setupFee > 0) {
    breakdown.push({ label: "Taxa de Implantação (Setup)", value: setupFee, type: 'setup' });
  }
  // 3. Operational Overages (Addons)
  let overageFees = 0;
  if (recommendedPlan === 'essential' || recommendedPlan === 'premium') {
    const p = plan as typeof PLANS.essential | typeof PLANS.premium;
    const bankOver = Math.max(0, manualBankSchedules - p.limits.bankSchedules);
    const nfseOver = Math.max(0, manualNFSe - p.limits.nfse);
    const boletoOver = Math.max(0, monthlyBoletos - p.limits.boletos);
    overageFees = (bankOver + nfseOver + boletoOver) * p.addonUnit;
    if (overageFees > 0) {
      breakdown.push({ label: "Excedentes Operacionais", value: overageFees, type: 'addon' });
    }
  }
  // 4. Revenue Tiers (Annual Revenue Threshold > 4.8M)
  let revenueSurcharge = 0;
  if (recommendedPlan === 'business' || recommendedPlan === 'premium') {
    const p = plan as typeof PLANS.business | typeof PLANS.premium;
    // Tiers calculated for every 1M above 4.8M
    // Fixed threshold logic: if revenue is exactly 4.8M, excess is 0. 
    // If it's 4.800.001, Math.ceil(1 / 1M) = 1.
    const excessRevenue = Math.max(0, annualRevenue - 4800000);
    const tiers = excessRevenue > 0 ? Math.ceil(excessRevenue / 1000000) : 0;
    revenueSurcharge = tiers * p.revenueTierUnit;
    if (revenueSurcharge > 0) {
      breakdown.push({ label: `Adicional Faturamento (+${tiers}M)`, value: revenueSurcharge, type: 'addon' });
    }
  }
  // 5. Consulting Hours
  // Strategic/Analytical meetings add 2 hours each to the base consultative workload
  const totalConsultingHours = meetingHours + (needsStrategicMeetings ? 2 : 0) + (needsAnalyticalMeetings ? 2 : 0);
  const meetingFees = totalConsultingHours * plan.meetingUnit;
  if (meetingFees > 0) {
    breakdown.push({ label: `Serviços Consultivos (${totalConsultingHours}h)`, value: meetingFees, type: 'addon' });
  }
  // 6. Savings Check (Premium Plan Efficiency)
  let savingsVsIndividual: number | undefined;
  if (recommendedPlan === 'premium') {
    const separateCost = PLANS.essential.baseFee + PLANS.business.baseFee;
    savingsVsIndividual = separateCost - PLANS.premium.baseFee;
  }
  // 7. Contextual Arguments
  const arguments_list: string[] = [];
  const alerts: string[] = [];
  if (segment.includes("SaaS") || segment.includes("Tecnologia")) {
    arguments_list.push("Foco em métricas SaaS: Acompanhamento de CAC, LTV e Churn no DRE.");
  } else if (segment.includes("Saúde") || segment.includes("Clínica")) {
    arguments_list.push("Compliance Setorial: Gestão de DMED e fluxos específicos de convênio.");
  } else {
    arguments_list.push("Profissionalização imediata: Processos financeiros validados para escala.");
  }
  if (leadRole.includes("cfo") || leadRole.includes("diretor")) {
    arguments_list.push("Suporte à Decisão: Reportes estratégicos prontos para análise executiva.");
  }
  if (recommendedPlan === 'premium') {
    arguments_list.push("Visão 360: Unificação das camadas operacional e estratégica.");
    if (savingsVsIndividual && savingsVsIndividual > 0) {
      arguments_list.push(`Eficiência Financeira: Unificação gera economia direta de ${formatCurrency(savingsVsIndividual)}.`);
    }
  }
  // 8. Alerts
  if (erpName.includes("sap") || erpName.includes("totvs") || erpName.includes("senior")) {
    alerts.push(`ERP Robustez (${erpName.toUpperCase()}): Requer validação técnica de API para integrações.`);
  }
  if (manualNFSe > 50 && recommendedPlan === 'essential') {
    alerts.push("Volume Crítico: O volume de notas atual pode onerar o plano Essential em excesso.");
  }
  if (annualRevenue > 12000000) {
    alerts.push("Escala Industrial: Recomendamos acompanhamento de controladoria quinzenal.");
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