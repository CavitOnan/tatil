import { createContext, useContext, useState, type ReactNode } from "react";
import type { SubscriptionTier } from "../types";

/**
 * Placeholder entitlement provider. Faz 1'de gerçek abonelik durumu yok;
 * Stripe entegrasyonu geldiğinde bu context'in içi Stripe'tan gelen
 * abonelik durumuyla doldurulacak, dışa açılan `useSubscription()`
 * arayüzü aynı kalacak.
 */
interface SubscriptionContextValue {
  tier: SubscriptionTier;
  isPremium: boolean;
  setTierForTesting: (tier: SubscriptionTier) => void;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(
  null
);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [tier, setTier] = useState<SubscriptionTier>("free");

  const value: SubscriptionContextValue = {
    tier,
    isPremium: tier !== "free",
    setTierForTesting: setTier,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) {
    throw new Error("useSubscription, SubscriptionProvider içinde kullanılmalı");
  }
  return ctx;
}
