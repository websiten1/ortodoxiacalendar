import type { Session } from "@supabase/supabase-js";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { isSupabaseConfigured, supabase } from "./supabase";
import { colors, fonts, radii, shadows, spacing } from "./theme";

type AuthContextValue = {
  session: Session | null;
  loading: boolean;
  requireAuth: (onAuthenticated: () => void | Promise<void>) => void;
  signOut: () => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<{ error: string | null }>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type Step = "closed" | "phone" | "otp";

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>("closed");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const pendingAction = useRef<(() => void | Promise<void>) | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    return { error: signInError?.message ?? null };
  }, []);

  const requireAuth = useCallback(
    (onAuthenticated: () => void | Promise<void>) => {
      if (session) {
        void onAuthenticated();
        return;
      }

      pendingAction.current = onAuthenticated;
      setStep("phone");
      setPhone("");
      setCode("");
      setError("");
    },
    [session]
  );

  async function handleSendCode() {
    setError("");
    if (!phone.trim()) {
      setError("Introdu un număr de telefon valid.");
      return;
    }

    setSubmitting(true);
    const { error: otpError } = await supabase.auth.signInWithOtp({ phone: phone.trim() });
    setSubmitting(false);

    if (otpError) {
      setError(otpError.message);
      return;
    }

    setStep("otp");
  }

  async function handleConfirmCode() {
    setError("");
    if (!code.trim()) {
      setError("Introdu codul primit prin SMS.");
      return;
    }

    setSubmitting(true);
    const { error: verifyError } = await supabase.auth.verifyOtp({
      phone: phone.trim(),
      token: code.trim(),
      type: "sms"
    });
    setSubmitting(false);

    if (verifyError) {
      setError(verifyError.message);
      return;
    }

    setStep("closed");
    const action = pendingAction.current;
    pendingAction.current = null;
    if (action) {
      void action();
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  function closeModal() {
    setStep("closed");
    pendingAction.current = null;
  }

  return (
    <AuthContext.Provider value={{ session, loading, requireAuth, signOut, signInWithPassword }}>
      {children}

      <Modal visible={step !== "closed"} animationType="slide" transparent onRequestClose={closeModal}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            {step === "phone" ? (
              <>
                <Text style={styles.title}>Autentificare</Text>
                <Text style={styles.subtitle}>Introdu numărul de telefon ca să continui.</Text>
                <Text style={styles.fieldLabel}>Număr de telefon</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+40 7xx xxx xxx"
                  placeholderTextColor={colors.placeholder}
                  keyboardType="phone-pad"
                  autoFocus
                  value={phone}
                  onChangeText={setPhone}
                />
                {error ? <Text style={styles.error}>{error}</Text> : null}
                <Pressable style={styles.primaryButton} onPress={handleSendCode} disabled={submitting}>
                  {submitting ? (
                    <ActivityIndicator color={colors.crimsonTextOn} />
                  ) : (
                    <Text style={styles.primaryButtonText}>Trimite cod</Text>
                  )}
                </Pressable>
                <Pressable onPress={closeModal} style={styles.cancelButton}>
                  <Text style={styles.cancelButtonText}>Anulează</Text>
                </Pressable>
              </>
            ) : null}

            {step === "otp" ? (
              <>
                <Text style={styles.title}>Confirmă codul</Text>
                <Text style={styles.subtitle}>Am trimis un cod de 6 cifre la {phone}.</Text>
                <Text style={styles.fieldLabel}>Cod de confirmare</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123456"
                  placeholderTextColor={colors.placeholder}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                  value={code}
                  onChangeText={setCode}
                />
                {error ? <Text style={styles.error}>{error}</Text> : null}
                <Pressable style={styles.primaryButton} onPress={handleConfirmCode} disabled={submitting}>
                  {submitting ? (
                    <ActivityIndicator color={colors.crimsonTextOn} />
                  ) : (
                    <Text style={styles.primaryButtonText}>Confirmă</Text>
                  )}
                </Pressable>
                <Pressable onPress={closeModal} style={styles.cancelButton}>
                  <Text style={styles.cancelButtonText}>Anulează</Text>
                </Pressable>
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth trebuie folosit în interiorul AuthProvider.");
  }
  return context;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(44, 38, 32, 0.5)",
    justifyContent: "flex-end"
  },
  sheet: {
    backgroundColor: colors.parchment,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.ink
  },
  subtitle: {
    fontFamily: fonts.body,
    color: colors.inkMuted,
    marginBottom: spacing.xs
  },
  fieldLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: colors.inkFaint,
    marginBottom: 6
  },
  input: {
    fontFamily: fonts.body,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: 13,
    fontSize: 16,
    color: colors.inkMuted
  },
  error: {
    fontFamily: fonts.body,
    color: colors.sundayRed
  },
  primaryButton: {
    backgroundColor: colors.crimson,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: spacing.xs,
    ...shadows.actionGlow
  },
  primaryButtonText: {
    fontFamily: fonts.bodyBold,
    color: colors.crimsonTextOn,
    fontSize: 15
  },
  cancelButton: {
    alignItems: "center",
    paddingVertical: 8
  },
  cancelButtonText: {
    fontFamily: fonts.body,
    color: colors.inkFaint
  }
});
