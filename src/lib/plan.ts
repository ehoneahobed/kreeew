// Price IDs for the different plans
export const STRIPE_PRICE_IDS = {
  starter: process.env.STRIPE_STARTER_PRICE_ID || "price_starter_monthly",
  pro: process.env.STRIPE_PRO_PRICE_ID || "price_pro_monthly",
} as const

// Plan configurations
export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    priceId: null,
    features: {
      connectedAccounts: 1,
      bookingLinks: 1,
    },
  },
  starter: {
    name: "Starter",
    price: 500, // $5.00 in cents
    priceId: STRIPE_PRICE_IDS.starter,
    features: {
      connectedAccounts: 5,
      bookingLinks: 3,
    },
  },
  pro: {
    name: "Pro",
    price: 1200, // $12.00 in cents
    priceId: STRIPE_PRICE_IDS.pro,
    features: {
      connectedAccounts: -1, // -1 means unlimited
      bookingLinks: -1, // -1 means unlimited
    },
  },
} as const

export type PlanName = keyof typeof PLANS
