export interface LoyaltyTierConfig {
  tier: "Bronze" | "Silver" | "Gold" | "Platinum";
  minSpendThreshold: number;
  pointsMultiplier: number;
  perksDescription: string;
}

export const LOYALTY_TIERS: Record<string, LoyaltyTierConfig> = {
  Bronze: {
    tier: "Bronze",
    minSpendThreshold: 0,
    pointsMultiplier: 1.0,
    perksDescription: "1 pt per ₹100 spent",
  },
  Silver: {
    tier: "Silver",
    minSpendThreshold: 10000,
    pointsMultiplier: 1.25,
    perksDescription: "1.25x points + Birthday dessert on the house",
  },
  Gold: {
    tier: "Gold",
    minSpendThreshold: 25000,
    pointsMultiplier: 1.5,
    perksDescription: "1.5x points + Priority table reservation + 5% bill discount",
  },
  Platinum: {
    tier: "Platinum",
    minSpendThreshold: 50000,
    pointsMultiplier: 2.0,
    perksDescription: "2x points + VIP chef table priority + 10% bill discount",
  },
};

/**
 * Determine loyalty tier based on cumulative spending
 */
export function determineLoyaltyTier(lifetimeSpend: number): "Bronze" | "Silver" | "Gold" | "Platinum" {
  if (lifetimeSpend >= LOYALTY_TIERS.Platinum.minSpendThreshold) return "Platinum";
  if (lifetimeSpend >= LOYALTY_TIERS.Gold.minSpendThreshold) return "Gold";
  if (lifetimeSpend >= LOYALTY_TIERS.Silver.minSpendThreshold) return "Silver";
  return "Bronze";
}

/**
 * Calculate loyalty points earned on a purchase bill
 */
export function calculatePointsEarned(subtotalAmount: number, currentTier: string = "Bronze"): number {
  const config = LOYALTY_TIERS[currentTier] || LOYALTY_TIERS.Bronze;
  const basePoints = Math.floor(subtotalAmount / 100); // 1 point per 100 Rs
  return Math.floor(basePoints * config.pointsMultiplier);
}

/**
 * Calculate max redeemable points and rupee discount for an order
 */
export function calculatePointRedemption(
  availablePoints: number,
  billSubtotal: number,
  pointsToRedeem: number
): {
  pointsRedeemed: number;
  rupeeDiscount: number;
  remainingPoints: number;
} {
  // Max 50% of subtotal can be paid via loyalty points
  const maxRedeemableRupees = Math.floor(billSubtotal * 0.5);
  const eligiblePoints = Math.min(availablePoints, maxRedeemableRupees, pointsToRedeem);

  const rupeeDiscount = Math.max(0, eligiblePoints); // 1 point = ₹1
  const remainingPoints = Math.max(0, availablePoints - eligiblePoints);

  return {
    pointsRedeemed: eligiblePoints,
    rupeeDiscount,
    remainingPoints,
  };
}
