import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { createPriestEvent, usePriestParish } from "../../lib/priest";
import { colors, fonts, radii, shadows, spacing } from "../../lib/theme";

const tipOptions: { value: "liturgic" | "social" | "anunt"; label: string }[] = [
  { value: "liturgic", label: "Liturgic" },
  { value: "social", label: "Social" },
  { value: "anunt", label: "Anunț" }
];

export default function EvenimentNouScreen() {
  const router = useRouter();
  const { parish } = usePriestParish();
  const [titlu, setTitlu] = useState("");
  const [descriere, setDescriere] = useState("");
  const [data, setData] = useState("");
  const [ora, setOra] = useState("");
  const [tip, setTip] = useState<"liturgic" | "social" | "anunt">("liturgic");
  const [trimiteNotificare, setTrimiteNotificare] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setError("");
    if (!parish) return;
    if (!titlu.trim() || !data.trim()) {
      setError("Titlul și data sunt obligatorii (format dată: AAAA-LL-ZZ).");
      return;
    }

    setSubmitting(true);
    try {
      await createPriestEvent({
        parishId: parish.id,
        titlu: titlu.trim(),
        descriere: descriere.trim() || undefined,
        data: data.trim(),
        ora: ora.trim() || undefined,
        tip,
        trimiteNotificare
      });
      router.back();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Eroare la salvare eveniment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>‹ Panou preot</Text>
        </Pressable>
        <Text style={styles.title}>Adaugă eveniment</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.fieldLabel}>Titlu</Text>
        <TextInput style={styles.input} value={titlu} onChangeText={setTitlu} placeholder="Sfânta Liturghie" placeholderTextColor={colors.placeholder} />

        <Text style={styles.fieldLabel}>Descriere (opțional)</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          value={descriere}
          onChangeText={setDescriere}
          placeholder="Detalii despre eveniment"
          placeholderTextColor={colors.placeholder}
          multiline
        />

        <Text style={styles.fieldLabel}>Data (AAAA-LL-ZZ)</Text>
        <TextInput style={styles.input} value={data} onChangeText={setData} placeholder="2026-06-28" placeholderTextColor={colors.placeholder} />

        <Text style={styles.fieldLabel}>Ora (opțional, HH:MM)</Text>
        <TextInput style={styles.input} value={ora} onChangeText={setOra} placeholder="09:00" placeholderTextColor={colors.placeholder} />

        <Text style={styles.fieldLabel}>Tip</Text>
        <View style={styles.tipRow}>
          {tipOptions.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => setTip(option.value)}
              style={[styles.tipChip, tip === option.value ? styles.tipChipActive : null]}
            >
              <Text style={[styles.tipChipText, tip === option.value ? styles.tipChipTextActive : null]}>{option.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Trimite notificare push urmăritorilor</Text>
          <Switch
            value={trimiteNotificare}
            onValueChange={setTrimiteNotificare}
            trackColor={{ false: colors.border, true: colors.crimson }}
            thumbColor={colors.surface}
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={styles.primaryButton} onPress={handleSubmit} disabled={submitting}>
          {submitting ? <ActivityIndicator color={colors.crimsonTextOn} /> : <Text style={styles.primaryButtonText}>Salvează</Text>}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.screenBg },
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
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  switchLabel: { flex: 1, fontFamily: fonts.body, color: colors.ink, fontSize: 13.5, marginRight: 10 },
  error: { fontFamily: fonts.body, color: colors.sundayRed },
  primaryButton: { backgroundColor: colors.crimson, borderRadius: radii.md, paddingVertical: 14, alignItems: "center", marginTop: 6, ...shadows.actionGlow },
  primaryButtonText: { fontFamily: fonts.bodyBold, color: colors.crimsonTextOn, fontSize: 15 }
});
