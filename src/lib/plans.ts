export const PLANS = {
  essential: {
    name: "Essential BPO",
    baseFee: 1621,
    setupFee: 1800,
    revenueCap: 200000,
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
    revenueTierUnit: 1000,
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
    revenueTierUnit: 800,
  }
} as const;
export const SEGMENT_GROUPS = [
  {
    label: "Tecnologia / Software",
    items: [
      "Startup de Tecnologia",
      "SaaS (Software como Serviço)",
      "Empresa de TI / Suporte Tecnológico",
      "Desenvolvimento Web / Sistemas",
    ]
  },
  {
    label: "Consultoria",
    items: [
      "Consultoria Empresarial",
      "Consultoria Estratégica",
      "Consultoria Financeira",
      "Consultoria Especializada",
      "Engenharia Consultiva",
    ]
  },
  {
    label: "Educação / Conteúdo",
    items: [
      "Treinamento Corporativo",
      "Educação / Capacitação Profissional",
      "Edtech (Tecnologia Educacional)",
      "Infoprodutor / Produtos Digitais",
      "Palestrante / Especialista",
    ]
  },
  {
    label: "Marketing / Criativo",
    items: [
      "Agência de Marketing",
      "Agência de Marketing Digital",
      "Agência de Publicidade",
      "Agência de Branding / Design",
      "Agência de Tráfego Pago",
      "Produção de Conteúdo",
      "Produtora Audiovisual",
      "Design / Projetos Criativos",
      "Arquitetura / Projetos",
    ]
  },
  {
    label: "Saúde",
    items: [
      "Clínica Médica",
      "Clínica de Fisioterapia",
      "Clínica Multidisciplinar",
      "Clínica Odontológica",
      "Clínica de Estética",
    ]
  },
  {
    label: "Serviços Gerais",
    items: [
      "Logística (Prestação de Serviços)",
      "Transportadora",
      "Empresa de Eventos",
      "Coworking",
      "Escritório Profissional Especializado",
      "Outros Serviços",
    ]
  }
] as const;
export const SEGMENTS = SEGMENT_GROUPS.flatMap(group => group.items);