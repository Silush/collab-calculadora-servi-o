export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export interface User {
  id: string;
  name: string;
}
export interface Chat {
  id: string;
  title: string;
}
export interface ChatMessage {
  id: string;
  chatId: string;
  userId: string;
  text: string;
  ts: number;
}
export interface DiagnosticInputs {
  [key: string]: any; // Allow index signature for Zod/RHF compatibility
  companyName: string;
  segment: string;
  leadName: string;
  leadRole: string;
  monthlyRevenue: number;
  annualRevenue: number;
  hasERP: "yes" | "no";
  erpName?: string;
  needsCollabERP: "yes" | "no";
  internalFinanceTeam: "yes" | "no";
  internalOpsTeam: "yes" | "no";
  needsOps: boolean;
  needsStrategic: boolean;
  manualBankSchedules: number;
  manualNFSe: number;
  monthlyBoletos: number;
  needsAnalyticalMeetings: boolean;
  needsStrategicMeetings: boolean;
  needsDashboards: boolean;
  needsDRE: boolean;
  needsBudgeting: boolean;
  needsControllership: boolean;
  meetingHours: number;
  notes?: string;
}
export type PlanType = 'essential' | 'business' | 'premium';
export interface PricingResult {
  recommendedPlan: PlanType;
  baseFee: number;
  setupFee: number;
  overageFees: number;
  revenueSurcharge: number;
  meetingFees: number;
  totalMonthly: number;
  totalInitial: number;
  savingsVsIndividual?: number;
  arguments: string[];
  alerts: string[];
  breakdown: {
    label: string;
    value: number;
    type: 'base' | 'addon' | 'setup';
  }[];
}
export interface SimulationRecord {
  id: string;
  timestamp: number;
  inputs: DiagnosticInputs;
  result: PricingResult;
}