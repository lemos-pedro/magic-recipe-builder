// Stripe Plans Configuration for Ngola Suite

export const STRIPE_PLANS = {
  basic: {
    id: 'basic',
    name: 'Básico',
    description: 'Para pequenas equipas',
    price: 12000, // 12.000 AOA per user
    priceId: 'price_1SxArkFxWGAIH3NjzXxlmk7Y',
    productId: 'prod_Tv0tsFmy8S2qyY',
    popular: false,
    features: [
      'Até 3 projectos',
      'Até 5 membros por equipa',
      'Gestão básica de tarefas',
      'Relatórios simples',
      'Suporte por email',
    ],
    limits: {
      maxProjects: 3,
      maxTeamMembers: 5,
      hasAdvancedReports: false,
      hasChat: false,
      hasVideoCall: false,
      hasApiAccess: false,
    },
  },
  professional: {
    id: 'professional',
    name: 'Profissional',
    description: 'Para equipas médias',
    price: 24000, // 24.000 AOA per user
    priceId: 'price_1SxAtGFxWGAIH3Nj8osZT8pQ',
    productId: 'prod_Tv0vGzZXyKzPmq',
    popular: true,
    features: [
      'Projectos ilimitados',
      'Até 15 membros por equipa',
      'Gestão avançada de tarefas',
      'Relatórios detalhados',
      'Chat interno da equipa',
      'Integrações externas (Teams/Meet)',
      'Suporte prioritário',
    ],
    limits: {
      maxProjects: -1, // unlimited
      maxTeamMembers: 15,
      hasAdvancedReports: true,
      hasChat: true,
      hasVideoCall: true,
      hasApiAccess: false,
    },
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Para grandes organizações',
    price: 48000, // 48.000 AOA per user
    popular: false,
    priceId: 'price_1SxAtzFxWGAIH3NjP8SC016i',
    productId: 'prod_Tv0vx6GeOAeqKC',
    features: [
      'Tudo ilimitado',
      'Membros ilimitados',
      'Todas as funcionalidades',
      'Relatórios personalizados',
      'Chat e videochamadas',
      'Todas as integrações',
      'API completa',
      'Suporte 24/7 dedicado',
      'Gestor de conta dedicado',
    ],
    limits: {
      maxProjects: -1,
      maxTeamMembers: -1,
      hasAdvancedReports: true,
      hasChat: true,
      hasVideoCall: true,
      hasApiAccess: true,
    },
  },
} as const;

export type PlanId = keyof typeof STRIPE_PLANS;
export type Plan = typeof STRIPE_PLANS[PlanId];

export const getPlanByProductId = (productId: string): Plan | null => {
  const plan = Object.values(STRIPE_PLANS).find(p => p.productId === productId);
  return plan || null;
};

export const getPlanByPriceId = (priceId: string): Plan | null => {
  const plan = Object.values(STRIPE_PLANS).find(p => p.priceId === priceId);
  return plan || null;
};

export const formatPrice = (price: number, perUser = true): string => {
  const formatted = new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    maximumFractionDigits: 0,
  }).format(price);
  return perUser ? `${formatted}/utilizador` : formatted;
};
