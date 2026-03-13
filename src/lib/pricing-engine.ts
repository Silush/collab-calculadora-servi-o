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
  const segment = inputs.segment || "";
  const erpName = (inputs.erpName || "").toLowerCase();
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
  if (setupFee > 0) breakdown.push({ label: "Taxa de Implantação", value: setupFee, type: 'setup' });
  // 3. Operational Overages
  let overageFees = 0;
  if (recommendedPlan === 'essential' || recommendedPlan === 'premium') {
    const p = plan as typeof PLANS.essential | typeof PLANS.premium;
    const bankOver = Math.max(0, manualBankSchedules - p.limits.bankSchedules);
    const nfseOver = Math.max(0, manualNFSe - p.limits.nfse);
    const boletoOver = Math.max(0, monthlyBoletos - p.limits.boletos);
    overageFees = (bankOver + nfseOver + boletoOver) * p.addonUnit;
    if (overageFees > 0) breakdown.push({ label: "Excedentes Operacionais", value: overageFees, type: 'addon' });
  }
  // 4. Revenue Tiers
  let revenueSurcharge = 0;
  if (recommendedPlan === 'business' || recommendedPlan === 'premium') {
    const p = plan as typeof PLANS.business | typeof PLANS.premium;
    const excessRevenue = Math.max(0, annualRevenue - 4800000);
    const tiers = Math.ceil(excessRevenue / 1000000);
    revenueSurcharge = tiers * p.revenueTierUnit;
    if (revenueSurcharge > 0) breakdown.push({ label: "Adicional por Faturamento", value: revenueSurcharge, type: 'addon' });
  }
  // 5. Meeting Hours
  const totalMeetings = meetingHours + (needsStrategicMeetings ? 2 : 0) + (needsAnalyticalMeetings ? 2 : 0);
  const meetingFees = totalMeetings * plan.meetingUnit;
  if (meetingFees > 0) breakdown.push({ label: "Horas de Consultoria", value: meetingFees, type: 'addon' });
  // 6. Savings
  let savingsVsIndividual: number | undefined;
  if (recommendedPlan === 'premium') {
    const separateCost = PLANS.essential.baseFee + PLANS.business.baseFee;
    savingsVsIndividual = separateCost - PLANS.premium.baseFee;
  }
  // 7. Advanced Arguments & Alerts
  const arguments_list: string[] = [];
  const alerts: string[] = [];
  // -- Contextual Arguments --
  if (segment.includes("SaaS") || segment.includes("Tecnologia")) {
    arguments_list.push("Foco em métricas de crescimento: CAC, LTV e Churn integrados ao DRE.");
  } else if (segment.includes("Saúde") || segment.includes("Clínica")) {
    arguments_list.push("Compliance rigoroso: Gestão de DMED e fluxo de caixa por convênios.");
  } else {
    arguments_list.push("Profissionalização imediata da gestão financeira com processos validados.");
  }
  if (recommendedPlan === 'premium') {
    arguments_list.push("Unificação Operacional e Estratégica: Visão ponta a ponta do negócio.");
    if (savingsVsIndividual && savingsVsIndividual > 0) {
      arguments_list.push(`Eficiência Financeira: Economia de ${formatCurrency(savingsVsIndividual)} na unificação.`);
    }
  }
  if (inputs.internalFinanceTeam === 'yes') {
    arguments_list.push("Apoio à Equipe Interna: Atuação como camada de auditoria e inteligência.");
  }
  if (inputs.hasERP === 'no') {
    arguments_list.push("Implantação Zero-to-One: Configuração completa do ERP parceiro Collab.");
  }
  // -- Advanced Alerts --
  if (erpName.includes("totvs") || erpName.includes("sap")) {
    alerts.push(`ERP ${erpName.toUpperCase()} detectado: Requer validação técnica de API para integração automática.`);
  }
  if (manualNFSe > 50 && recommendedPlan !== 'premium') {
    alerts.push("Volume de Notas alto: O plano Premium oferece custo por excedente reduzido.");
  }
  if (monthlyRevenue > 200000 && recommendedPlan === 'essential') {
    alerts.push("Alerta de Escala: O faturamento atual sugere necessidade de controles do plano Business/Premium.");
  }
  if (inputs.internalOpsTeam === 'yes' && recommendedPlan === 'essential') {
    alerts.push("Equipe de Operação Própria: Avalie se o foco não deve ser apenas estratégico (CFO).");
  }
  if (annualRevenue > 10000000) {
    alerts.push("Faturamento > 10M: Recomendamos auditoria trimestral de controladoria.");
  }
  if (inputs.needsBudgeting && !inputs.needsDRE) {
    alerts.push("Inconsistência: Planejamento orçamentário requer acompanhamento via DRE.");
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