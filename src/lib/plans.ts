export const PLANS = {
  essential: {
    name: "Essential BPO",
    baseFee: 1621,
    setupFee: 1800,
    revenueCap: 200000, // Monthly
    limits: {
      bankSchedules: 20,
      nfse: 20,
      boletos: 20,
    },
    addonUnit: 15,
    meetingUnit: 500,
  },
  business: {
    name: "Business CFO",
    baseFee: 4730,
    setupFee: 0,
    annualRevenueMin: 4800000,
    revenueTierUnit: 1000, // per 1M extra
    limits: {
      bankSchedules: 0,
      nfse: 0,
      boletos: 0,
    },
    addonUnit: 0,
    meetingUnit: 500,
  },
  premium: {
    name: "Premium Finance",
    baseFee: 5970,
    setupFee: 3200,
    limits: {
      bankSchedules: 40,
      nfse: 40,
      boletos: 40,
    },
    addonUnit: 10,
    meetingUnit: 300,
    revenueTierUnit: 800, // per 1M extra
  }
} as const;
export const SEGMENTS = [
  "E-commerce",
  "Indústria",
  "Serviços",
  "Varejo",
  "Tecnologia",
  "Saúde",
  "Outros"
];