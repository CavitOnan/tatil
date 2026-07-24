import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";
import { useSubscription } from "../lib/entitlements";

export default function ProfileScreen() {
  const { tier, isTrialActive, trialEndsAt } = useSubscription();
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signingUp, setSigningUp] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [sendingMagicLink, setSendingMagicLink] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) =>
      setSession(s)
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  const signUp = async () => {
    if (!email || !password) return;
    setSigningUp(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setSigningUp(false);
    Alert.alert(
      error ? "Hata" : "Kayıt alındı",
      error
        ? error.message
        : `${email} adresine bir onay e-postası gönderildi. Onaylayınca şifrenle giriş yapabilirsin.`
    );
  };

  const signIn = async () => {
    if (!email || !password) return;
    setSigningIn(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setSigningIn(false);
    if (error) Alert.alert("Hata", error.message);
  };

  const sendMagicLink = async () => {
    if (!email) return;
    setSendingMagicLink(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    setSendingMagicLink(false);
    Alert.alert(
      error ? "Hata" : "Bağlantı gönderildi",
      error ? error.message : `${email} adresine giriş bağlantısı gönderildi.`
    );
  };

  if (session) {
    const trialDaysLeft = trialEndsAt
      ? Math.max(
          0,
          Math.ceil(
            (new Date(trialEndsAt).getTime() - Date.now()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : null;

    return (
      <View style={styles.container}>
        <Text style={styles.label}>Giriş yapıldı</Text>
        <Text style={styles.email}>{session.user.email}</Text>
        <Text style={styles.tier}>Plan: {tier}</Text>
        {isTrialActive && trialDaysLeft !== null && (
          <Text style={styles.trial}>
            Ücretsiz deneme: {trialDaysLeft} gün kaldı
          </Text>
        )}
        <TouchableOpacity
          style={styles.button}
          onPress={() => supabase.auth.signOut()}
        >
          <Text style={styles.buttonText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>E-posta ile kayıt ol / giriş yap</Text>
      <TextInput
        style={styles.input}
        placeholder="ornek@eposta.com"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Şifre"
        secureTextEntry
        autoCapitalize="none"
        value={password}
        onChangeText={setPassword}
      />
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.button, styles.rowButton]}
          onPress={signUp}
          disabled={signingUp}
        >
          <Text style={styles.buttonText}>
            {signingUp ? "Kayıt olunuyor..." : "Kayıt Ol"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.rowButton, styles.buttonSecondary]}
          onPress={signIn}
          disabled={signingIn}
        >
          <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
            {signingIn ? "Giriş yapılıyor..." : "Giriş Yap"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>veya</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity
        style={[styles.button, styles.buttonSecondary]}
        onPress={sendMagicLink}
        disabled={sendingMagicLink}
      >
        <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
          {sendingMagicLink ? "Gönderiliyor..." : "Giriş Bağlantısı Gönder"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#fff" },
  label: { fontSize: 18, fontWeight: "700", marginBottom: 16 },
  email: { fontSize: 16, marginBottom: 4 },
  tier: { color: "#6b7280", marginBottom: 4 },
  trial: { color: "#0f766e", fontWeight: "600", marginBottom: 24 },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 16,
  },
  row: { flexDirection: "row", gap: 12 },
  rowButton: { flex: 1 },
  button: {
    backgroundColor: "#0f766e",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonSecondary: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#0f766e",
  },
  buttonText: { color: "#fff", fontWeight: "700" },
  buttonTextSecondary: { color: "#0f766e" },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: "#d1d5db" },
  dividerText: { marginHorizontal: 10, color: "#9ca3af", fontSize: 13 },
});
