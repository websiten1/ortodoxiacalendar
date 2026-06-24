import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import { useAuth } from "../../lib/auth-context";
import { usePriestParish } from "../../lib/priest";
import { colors, fonts, radii, shadows, spacing } from "../../lib/theme";

export default function PreotLoginScreen() {
  const router = useRouter();
  const { session, signInWithPassword } = useAuth();
  const { parish, loading: loadingParish } = usePriestParish();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session && !loadingParish && parish) {
      router.replace("/preot");
    }
  }, [session, loadingParish, parish, router]);

  async function handleLogin() {
    setError("");
    if (!email.trim() || !password) {
      setError("Introdu emailul și parola contului parohiei.");
      return;
    }

    setSubmitting(true);
    const { error: loginError } = await signInWithPassword(email.trim(), password);
    setSubmitting(false);

    if (loginError) {
      setError(loginError);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.title}>Administrează parohia</Text>
        <Text style={styles.subtitle}>Intră cu emailul și parola cu care ai înregistrat parohia.</Text>

        <Text style={styles.fieldLabel}>Adresă de email</Text>
        <TextInput
          style={styles.input}
          placeholder="preot@parohie.ro"
          placeholderTextColor={colors.placeholder}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.fieldLabel}>Parolă</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor={colors.placeholder}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={styles.primaryButton} onPress={handleLogin} disabled={submitting}>
          {submitting ? (
            <ActivityIndicator color={colors.crimsonTextOn} />
          ) : (
            <Text style={styles.primaryButtonText}>Intră în cont</Text>
          )}
        </Pressable>

        <Pressable onPress={() => router.back()} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>‹ Înapoi</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.screenBg },
  content: { padding: spacing.lg, gap: spacing.sm, flex: 1, justifyContent: "center" },
  title: { fontFamily: fonts.display, fontSize: 26, color: colors.ink },
  subtitle: { fontFamily: fonts.body, color: colors.inkMuted, marginBottom: spacing.sm, lineHeight: 20 },
  fieldLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: colors.inkFaint,
    marginBottom: 6,
    marginTop: 6
  },
  input: {
    fontFamily: fonts.body,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: 13,
    fontSize: 15,
    color: colors.ink
  },
  error: { fontFamily: fonts.body, color: colors.sundayRed, marginTop: 8 },
  primaryButton: {
    backgroundColor: colors.crimson,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: spacing.sm,
    ...shadows.actionGlow
  },
  primaryButtonText: { fontFamily: fonts.bodyBold, color: colors.crimsonTextOn, fontSize: 15 },
  cancelButton: { alignItems: "center", paddingVertical: 16 },
  cancelButtonText: { fontFamily: fonts.body, color: colors.inkFaint }
});
