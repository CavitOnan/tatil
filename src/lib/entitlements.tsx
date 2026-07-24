import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { SubscriptionTier } from "../types";

const STORAGE_KEY = "tatil-asistani:subscriptionTier";
const VALID_TIERS: SubscriptionTier[] = ["free", "monthly", "yearly"];

/**
 * Placeholder entitlement provider. Faz 1'de gerçek abonelik durumu yok
 * (bilinçli olarak kapsam dışı); tier, cihazda AsyncStorage'da tutulur ki
 * test aboneliği sayfa yenilenince sıfırlanmasın. Faz 2'de iyzico
 * entegrasyonu geldiğinde bu context'in içi iyzico'dan gelen abonelik
 * durumuyla doldurulacak, dışa açılan `useSubscription()` arayüzü aynı
 * kalacak.
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
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored && VALID_TIERS.includes(stored as SubscriptionTier)) {
        setTier(stored as SubscriptionTier);
      }
      setLoaded(true);
    });
  }, []);

  const setTierForTesting = (newTier: SubscriptionTier) => {
    setTier(newTier);
    AsyncStorage.setItem(STORAGE_KEY, newTier);
  };

  // Wait for the stored tier before rendering premium-gated screens, so a
  // returning premium tester doesn't see a flash of the paywall.
  if (!loaded) return null;

  const value: SubscriptionContextValue = {
    tier,
    isPremium: tier !== "free",
    setTierForTesting,
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
