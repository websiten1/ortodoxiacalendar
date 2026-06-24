import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { updatePriestParish, usePriestParish } from "../../lib/priest";
import { colors, fonts, radii, shadows, spacing } from "../../lib/theme";

export default function PreotProfilScreen() {
  const router = useRouter();
  const { parish, loading } = usePriestParish();
  const [form, setForm] = useState({
    nume: "",
    hram: "",
    adresa: "",
    localitate: "",
    judet: "",
    tara: "România",
    descriere: "",
    contact_telefon_public: "",
    contact_email_public: ""
  });
  const [originalStil, setOriginalStil] = useState<"nou" | "vechi">("nou");
  const [stil, setStil] = useState<"nou" | "vechi">("nou");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!parish) return;
    setForm({
      nume: parish.nume ?? "",
      hram: parish.hram ?? "",
      adresa: parish.adresa ?? "",
      localitate: parish.localitate ?? "",
      judet: parish.judet ?? "",
      tara: parish.tara ?? "România",
      descriere: parish.descriere ?? "",
      contact_telefon_public: parish.contact_telefon_public ?? "",
      contact_email_public: parish.contact_email_public ?? ""
    });
    setStil(parish.stil ?? "nou");
    setOriginalStil(parish.stil ?? "nou");
  }, [parish]);

  async function handleSave() {
    if (!parish) return;
    setError("");
    setMessage("");

    if (stil !== originalStil) {
      const confirmed = await new Promise<boolean>((resolve) => {
        Alert.alert(
          "Ești sigur?",
          "Asta schimbă toate datele sărbătorilor afișate.",
          [
            { text: "Anulează", style: "cancel", onPress: () => resolve(false) },
            { text: "Continuă", onPress: () => resolve(true) }
          ]
        );
      });
      if (!confirmed) return;
    }

    setSaving(true);
    try {
      await updatePriestParish(parish.id, {
        nume: form.nume,
        hram: form.hram,
        adresa: form.adresa,
        localitate: form.localitate,
        judet: form.judet,
        tara: form.tara,
        descriere: form.descriere || null,
        contact_telefon_public: form.contact_telefon_public || null,
        contact_email_public: form.contact_email_public || null,
        stil
      });
      setOriginalStil(stil);
      setMessage("Modificările au fost salvate.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Eroare la salvare.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !parish) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator color={colors.crimson} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>‹ Panou preot</Text>
        </Pressable>
        <Text style={styles.title}>Profilul parohiei</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {(["nume", "hram", "adresa", "localitate", "judet", "tara"] as const).map((field) => (
          <View key={field}>
            <Text style={styles.fieldLabel}>{fieldLabels[field]}</Text>
            <TextInput
              style={styles.input}
              value={form[field]}
              onChangeText={(value) => setForm((prev) => ({ ...prev, [field]: value }))}
            />
          </View>
        ))}

        <Text style={styles.fieldLabel}>Stil calendaristic</Text>
        <View style={styles.tipRow}>
          <Pressable onPress={() => setStil("nou")} style={[styles.tipChip, stil === "nou" ? styles.tipChipActive : null]}>
            <Text style={[styles.tipChipText, stil === "nou" ? styles.tipChipTextActive : null]}>Stil nou</Text>
          </Pressable>
          <Pressable onPress={() => setStil("vechi")} style={[styles.tipChip, stil === "vechi" ? styles.tipChipActive : null]}>
            <Text style={[styles.tipChipText, stil === "vechi" ? styles.tipChipTextActive : null]}>Stil vechi</Text>
          </Pressable>
        </View>

        <Text style={styles.fieldLabel}>Descriere scurtă</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          value={form.descriere}
          onChangeText={(value) => setForm((prev) => ({ ...prev, descriere: value }))}
          multiline
          maxLength={300}
        />

        <Text style={styles.fieldLabel}>Telefon contact public</Text>
        <TextInput
          style={styles.input}
          value={form.contact_telefon_public}
          onChangeText={(value) => setForm((prev) => ({ ...prev, contact_telefon_public: value }))}
        />

        <Text style={styles.fieldLabel}>Email contact public</Text>
        <TextInput
          style={styles.input}
          value={form.contact_email_public}
          onChangeText={(value) => setForm((prev) => ({ ...prev, contact_email_public: value }))}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {message ? <Text style={styles.success}>{message}</Text> : null}

        <Pressable style={styles.primaryButton} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color={colors.crimsonTextOn} /> : <Text style={styles.primaryButtonText}>Salvează</Text>}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const fieldLabels: Record<string, string> = {
  nume: "Nume parohie",
  hram: "Hram",
  adresa: "Adresă completă",
  localitate: "Localitate",
  judet: "Județ / Regiune",
  tara: "Țară"
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.screenBg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.screenBg },
  header: { backgroundColor: colors.priestBg, padding: spacing.md, paddingTop: spacing.sm, gap: 4 },
  backLink: { fontFamily: fonts.body, fontSize: 13, color: "rgba(255,255,255,0.75)" },
  title: { fontFamily: fonts.display, fontSize: 22, color: "#fff", marginTop: 4 },
  content: { padding: spacing.md, gap: 10, paddingBottom: 40 },
  fieldLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: colors.inkFaint,
    marginTop: 4
  },
  input: {
    fontFamily: fonts.body,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: 13,
    fontSize: 14,
    color: colors.ink
  },
  tipRow: { flexDirection: "row", gap: 8 },
  tipChip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: radii.pill, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  tipChipActive: { backgroundColor: colors.crimson, borderColor: colors.crimson },
  tipChipText: { fontFamily: fonts.bodySemiBold, color: colors.inkMuted, fontSize: 13 },
  tipChipTextActive: { color: colors.crimsonTextOn },
  error: { fontFamily: fonts.body, color: colors.sundayRed },
  success: { fontFamily: fonts.body, color: "#067647" },
  primaryButton: { backgroundColor: colors.crimson, borderRadius: radii.md, paddingVertical: 14, alignItems: "center", marginTop: 6, ...shadows.actionGlow },
  primaryButtonText: { fontFamily: fonts.bodyBold, color: colors.crimsonTextOn, fontSize: 15 }
});
