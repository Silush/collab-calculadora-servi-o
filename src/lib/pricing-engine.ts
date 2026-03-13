export type PlanType = 'essential' | 'business' | 'premium';
export interface DiagnosticInputs {
  companyName: string;
  annualRevenue: number;
  monthlyNFSe: number;
  monthlyBankSchedules: number;
  needsDRE: boolean;
  needsCashFlow: boolean;
  needsTaxPlanning: boolean;
  manualNfseEntry: boolean;
  inventoryManagement: boolean;
}
export interface PricingResult {
  recommendedPlan: PlanType;
  baseFee: number;
  setupFee: number;
  overageFees: number;
  totalMonthly: number;
  savingsVsIndividual?: number;
  arguments: string[];
  alerts: string[];
}
const REVENUE_TIERS = [
  { limit: 1000000, essential: 1500, business: 3500, premium: 4500 },
  { limit: 2500000, essential: 2500, business: 5500, premium: 7000 },
  { limit: 5000000, essential: 4000, business: 8500, premium: 11000 },
  { limit: Infinity, essential: 6000, business: 12000, premium: 16000 },
];
export function calculatePricing(inputs: DiagnosticInputs): PricingResult {
  const { 
    annualRevenue, 
    monthlyNFSe, 
    monthlyBankSchedules, 
    needsDRE, 
    needsCashFlow, 
    needsTaxPlanning,
    manualNfseEntry,
    inventoryManagement
  } = inputs;
  // Determine Recommendation Logic
  let recommendedPlan: PlanType = 'essential';
  if (needsTaxPlanning || inventoryManagement || (needsDRE && needsCashFlow)) {
    recommendedPlan = 'premium';
  } else if (needsDRE || needsCashFlow || annualRevenue > 2500000) {
    recommendedPlan = 'business';
  }
  // Get Base Fee from Tiers
  const tier = REVENUE_TIERS.find(t => annualRevenue <= t.limit) || REVENUE_TIERS[REVENUE_TIERS.length - 1];
  const baseFee = tier[recommendedPlan];
  // Calculate Overages
  // Essential: 20 NFSe/Schedules limit, Business: 50, Premium: 100
  const limits = { essential: 20, business: 50, premium: 100 };
  const currentLimit = limits[recommendedPlan];
  const nfseOver = Math.max(0, monthlyNFSe - currentLimit);
  const scheduleOver = Math.max(0, monthlyBankSchedules - currentLimit);
  const nfseCost = nfseOver * 5; // $5 per extra NFSe
  const scheduleCost = scheduleOver * 10; // $10 per extra schedule
  const manualEntryPenalty = manualNfseEntry ? 200 : 0;
  const overageFees = nfseCost + scheduleCost + manualEntryPenalty;
  const setupFee = baseFee * 0.5; // Standard setup is 50% of monthly base
  // Sales Arguments
  const args: string[] = [];
  if (recommendedPlan === 'premium') {
    args.push("Complete financial outsourcing with strategic CFO advisory.");
    args.push("Includes tax planning and inventory oversight to maximize margins.");
    const savings = (tier.essential + tier.business) - tier.premium;
    if (savings > 0) args.push(`Save $${savings.toLocaleString()} by bundling BPO and CFO services.`);
  } else if (recommendedPlan === 'business') {
    args.push("Focus on management reporting (DRE) for better decision making.");
    args.push("Scalable support for growing companies exceeding $2.5M revenue.");
  } else {
    args.push("Cost-effective foundation for operational financial control.");
    args.push("Perfect for high-efficiency startups with low transaction volume.");
  }
  // Alerts
  const alerts: string[] = [];
  if (monthlyNFSe > 100 && recommendedPlan !== 'premium') {
    alerts.push("High transaction volume detected. Consider Premium to avoid excessive overage fees.");
  }
  if (manualNfseEntry) {
    alerts.push("Manual NFSe entry adds operational risk and overhead costs.");
  }
  return {
    recommendedPlan,
    baseFee,
    setupFee,
    overageFees,
    totalMonthly: baseFee + overageFees,
    savingsVsIndividual: recommendedPlan === 'premium' ? (tier.essential + tier.business) - tier.premium : undefined,
    arguments: args,
    alerts
  };
}