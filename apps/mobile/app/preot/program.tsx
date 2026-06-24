import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { addPriestProgramEntry, deleteProgramEntry, getPriestProgram, toggleProgramEntry, usePriestParish } from "../../lib/priest";
import { colors, fonts, radii, spacing } from "../../lib/theme";

type ProgramItem = { id: string; titlu: string; zi_saptamana: string; ora: string; activ: boolean };

const weekdays = ["luni", "marti", "miercuri", "joi", "vineri", "sambata", "duminica"];
const weekdayLabels: Record<string, string> = {
  luni: "Luni", marti: "Marți", miercuri: "Miercuri", joi: "Joi", vineri: "Vineri", sambata: "Sâmbătă", duminica: "Duminică"
};

export default function PreotProgramScreen() {
  const router = useRouter();
  const { parish } = usePriestParish();
  const [entries, setEntries] = useState<ProgramItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [titlu, setTitlu] = useState("");
  const [ziSaptamana, setZiSaptamana] = useState("duminica");
  const [ora, setOra] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!parish) return;
    setLoading(true);
    try {
      const data = await getPriestProgram(parish.id);
      setEntries(
        data.sort((a, b) => {
          const dayDiff = weekdays.indexOf(a.zi_saptamana) - weekdays.indexOf(b.zi_saptamana);
          return dayDiff !== 0 ? dayDiff : a.ora.localeCompare(b.ora);
        })
      );
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Eroare la încărcare program.");
    } finally {
      setLoading(false);
    }
  }, [parish]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  async function handleAdd() {
    if (!parish || !titlu.trim() || !ora.trim()) {
      setError("Titlul și ora sunt obligatorii.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await addPriestProgramEntry({ parishId: parish.id, titlu: titlu.trim(), zi_saptamana: ziSaptamana, ora: ora.trim() });
      setTitlu("");
      setOra("");
      await load();
    } catch (addError) {
      setError(addError instanceof Error ? addError.message : "Eroare la salvare.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(item: ProgramItem) {
    await toggleProgramEntry(item.id, !item.activ);
    await load();
  }

  async function handleDelete(item: ProgramItem) {
    await deleteProgramEntry(item.id);
    await load();
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>‹ Panou preot</Text>
        </Pressable>
        <Text style={styles.title}>Program permanent</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.addCard}>
          <Text style={styles.fieldLabel}>Titlu</Text>
          <TextInput style={styles.input} value={titlu} onChangeText={setTitlu} placeholder="Sfânta Liturghie" placeholderTextColor={colors.placeholder} />
          <View style={styles.row}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={{ gap: 6 }}>
              {weekdays.map((day) => (
                <Pressable
                  key={day}
                  onPress={() => setZiSaptamana(day)}
                  style={[styles.dayChip, ziSaptamana === day ? styles.dayChipActive : null]}
                >
                  <Text style={[styles.dayChipText, ziSaptamana === day ? styles.dayChipTextActive : null]}>
                    {weekdayLabels[day].slice(0, 3)}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
          <TextInput style={styles.input} value={ora} onChangeText={setOra} placeholder="18:00" placeholderTextColor={colors.placeholder} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable style={styles.primaryButton} onPress={handleAdd} disabled={saving}>
            {saving ? <ActivityIndicator color={colors.crimsonTextOn} /> : <Text style={styles.primaryButtonText}>+ Adaugă</Text>}
          </Pressable>
        </View>

        {loading ? <ActivityIndicator color={colors.crimson} style={{ marginTop: 14 }} /> : null}

        {!loading && entries.length === 0 ? <Text style={styles.muted}>Niciun program adăugat.</Text> : null}

        {entries.map((item) => (
          <View key={item.id} style={styles.entryRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.entryTitle}>{item.titlu}</Text>
              <Text style={styles.muted}>{weekdayLabels[item.zi_saptamana]} la {item.ora.slice(0, 5)}</Text>
            </View>
            <Pressable onPress={() => handleToggle(item)}>
              <Text style={[styles.statusText, { color: item.activ ? "#067647" : colors.upcomingText }]}>
                {item.activ ? "Activ" : "Inactiv"}
              </Text>
            </Pressable>
            <Pressable onPress={() => handleDelete(item)}>
              <Text style={styles.deleteText}>Șterge</Text>
            </Pressable>
          </View>
        ))}
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
  addCard: { backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.borderAlt, borderRadius: radii.lg, padding: 14, gap: 8 },
  fieldLabel: { fontFamily: fonts.bodySemiBold, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: colors.inkFaint },
  input: { fontFamily: fonts.body, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, padding: 12, fontSize: 14, color: colors.ink },
  row: { flexDirection: "row" },
  dayChip: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: radii.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  dayChipActive: { backgroundColor: colors.crimson, borderColor: colors.crimson },
  dayChipText: { fontFamily: fonts.bodySemiBold, fontSize: 12, color: colors.inkMuted },
  dayChipTextActive: { color: colors.crimsonTextOn },
  error: { fontFamily: fonts.body, color: colors.sundayRed },
  primaryButton: { backgroundColor: colors.crimson, borderRadius: radii.md, paddingVertical: 12, alignItems: "center" },
  primaryButtonText: { fontFamily: fonts.bodyBold, color: colors.crimsonTextOn },
  muted: { fontFamily: fonts.body, color: colors.inkFaintAlt, fontSize: 12, marginTop: 2 },
  entryRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderAlt,
    borderRadius: radii.md,
    padding: 12
  },
  entryTitle: { fontFamily: fonts.bodyBold, color: colors.ink, fontSize: 14 },
  statusText: { fontFamily: fonts.bodySemiBold, fontSize: 12 },
  deleteText: { fontFamily: fonts.body, color: colors.sundayRed, fontSize: 12 }
});
