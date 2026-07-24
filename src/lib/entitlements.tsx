import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Session } from "@supabase/supabase-js";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "./supabase";
import type { Profile, SubscriptionTier } from "../types";

const STORAGE_KEY = "tatil-asistani:subscriptionTier";
const VALID_TIERS: SubscriptionTier[] = ["free", "monthly", "yearly"];

/**
 * Entitlement provider. Real subscription billing isn't wired up yet
 * (Faz 2: iyzico), so `tier` is still a local AsyncStorage test override.
 * Every registered user also gets a 14-day free trial, tracked server-side
 * in the `profiles` table (`trial_ends_at`, set by a DB trigger on sign-up
 * so it can't be skipped or reset by the client) — `isPremium` is true
 * while either the test tier or the trial is active.
 */
interface SubscriptionContextValue {
  tier: SubscriptionTier;
  isPremium: boolean;
  isTrialActive: boolean;
  trialEndsAt: string | null;
  setTierForTesting: (tier: SubscriptionTier) => void;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(
  null
);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [tier, setTier] = useState<SubscriptionTier>("free");
  const [tierLoaded, setTierLoaded] = useState(false);
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored && VALID_TIERS.includes(stored as SubscriptionTier)) {
        setTier(stored as SubscriptionTier);
      }
      setTierLoaded(true);
    });
  }, []);

  useEffect(() => {
    const loadProfile = async (session: Session | null) => {
      if (!session) {
        setTrialEndsAt(null);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("trial_ends_at")
        .eq("id", session.user.id)
        .maybeSingle();
      setTrialEndsAt((data as Profile | null)?.trial_ends_at ?? null);
    };

    supabase.auth
      .getSession()
      .then(({ data }) => loadProfile(data.session))
      .finally(() => setInitializing(false));

    // Later auth events (sign in/out, token refresh) update trialEndsAt in
    // the background without re-gating the render below — otherwise every
    // auth event would unmount/remount the navigator and reset the user's
    // current tab back to the first screen.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      loadProfile(session);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const setTierForTesting = (newTier: SubscriptionTier) => {
    setTier(newTier);
    AsyncStorage.setItem(STORAGE_KEY, newTier);
  };

  // Wait for the stored tier + initial trial lookup before rendering
  // premium-gated screens, so a returning premium/trial user doesn't see a
  // paywall flash.
  if (!tierLoaded || initializing) return null;

  const isTrialActive = !!trialEndsAt && new Date(trialEndsAt) > new Date();

  const value: SubscriptionContextValue = {
    tier,
    isPremium: tier !== "free" || isTrialActive,
    isTrialActive,
    trialEndsAt,
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
