import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase yapılandırılmadı: .env dosyasına EXPO_PUBLIC_SUPABASE_URL ve " +
      "EXPO_PUBLIC_SUPABASE_ANON_KEY ekleyin (.env.example örneğine bakın). " +
      "Auth istekleri başarısız olacak ama uygulamanın geri kalanı çalışır."
  );
}

// createClient throws synchronously on an empty URL, which would crash the
// whole app before any screen renders. Fall back to a placeholder so the
// rest of the UI stays testable before Supabase is configured.
const resolvedUrl = supabaseUrl || "https://placeholder.supabase.co";
const resolvedAnonKey = supabaseAnonKey || "placeholder-anon-key";

export const supabase = createClient(resolvedUrl, resolvedAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
