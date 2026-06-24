import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { addEventToDeviceCalendar } from "../../lib/device-calendar";
import { EventDetail, getEventDetail } from "../../lib/parishes";
import { colors, fonts, radii, spacing } from "../../lib/theme";

const weekdayNames = ["Duminică", "Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă"];
const monthNames = [
  "ianuarie", "februarie", "martie", "aprilie", "mai", "iunie",
  "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"
];

const tipLabels: Record<string, string> = {
  liturgic: "Liturgic",
  social: "Social",
  anunt: "Anunț"
};

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingToCalendar, setAddingToCalendar] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      setEvent(await getEventDetail(id));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Eroare la încărcare eveniment.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleAddToCalendar() {
    if (!event) return;
    setAddingToCalendar(true);
    try {
      const startDate = new Date(`${event.data}T${event.ora ?? "09:00"}:00`);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

      await addEventToDeviceCalendar({
        title: event.titlu,
        notes: event.descriere ?? undefined,
        location: event.parohii?.nume,
        startDate,
        endDate
      });

      Alert.alert("Adăugat", "Evenimentul a fost adăugat în calendarul telefonului.");
    } catch (addError) {
      Alert.alert("Eroare", addError instanceof Error ? addError.message : "Nu am putut adăuga evenimentul.");
    } finally {
      setAddingToCalendar(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator color={colors.crimson} />
      </SafeAreaView>
    );
  }

  if (error || !event) {
    return (
      <SafeAreaView style={styles.screen}>
        <Text style={styles.error}>{error || "Evenimentul nu a fost găsit."}</Text>
      </SafeAreaView>
    );
  }

  const dateObj = new Date(`${event.data}T00:00:00`);
  const weekday = weekdayNames[dateObj.getDay()];
  const dateLabel = `${dateObj.getDate()} ${monthNames[dateObj.getMonth()]}`;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>
          {weekday} · {dateLabel}
        </Text>
        <Text style={styles.title}>{event.titlu}</Text>
        <Text style={styles.subtitle}>{tipLabels[event.tip] ?? event.tip}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Ora</Text>
            <Text style={styles.statValue}>{event.ora ? event.ora.slice(0, 5) : "Toată ziua"}</Text>
          </View>
        </View>

        {event.parohii ? (
          <View style={styles.parishRow}>
            <View style={styles.parishIcon}>
              <Text style={{ color: colors.crimson }}>⌖</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.parishName}>{event.parohii.nume}</Text>
              <Text style={styles.muted}>Pr. {event.parohii.preot_nume}</Text>
            </View>
          </View>
        ) : null}

        {event.descriere ? <Text style={styles.bodyText}>{event.descriere}</Text> : null}

        <Pressable
          style={[styles.primaryButton, addingToCalendar ? { opacity: 0.6 } : null]}
          onPress={handleAddToCalendar}
          disabled={addingToCalendar}
        >
          <Text style={styles.primaryButtonText}>
            {addingToCalendar ? "Se adaugă..." : "Adaugă în calendar"}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.screenBg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.screenBg },
  header: { backgroundColor: colors.crimson, padding: spacing.md, paddingTop: spacing.sm, gap: 4 },
  eyebrow: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.65)"
  },
  title: { fontFamily: fonts.display, fontSize: 26, color: "#fff", marginTop: 4 },
  subtitle: { fontFamily: fonts.body, fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 4 },
  content: { padding: spacing.md, gap: spacing.sm, paddingBottom: 40 },
  error: { fontFamily: fonts.body, color: colors.sundayRed, margin: spacing.md },
  statRow: { flexDirection: "row", gap: 11 },
  statCard: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderAlt,
    borderRadius: radii.md,
    padding: 12
  },
  statLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.inkFaint
  },
  statValue: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.ink, marginTop: 3 },
  parishRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderAlt,
    borderRadius: radii.md,
    padding: 12
  },
  parishIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: colors.crimsonTint,
    alignItems: "center",
    justifyContent: "center"
  },
  parishName: { fontFamily: fonts.bodyBold, fontSize: 13.5, color: colors.ink },
  muted: { fontFamily: fonts.body, color: colors.inkFaintAlt, fontSize: 12 },
  bodyText: { fontFamily: fonts.body, fontSize: 13.5, color: colors.inkMuted, lineHeight: 22 },
  primaryButton: {
    backgroundColor: colors.crimson,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8
  },
  primaryButtonText: { fontFamily: fonts.bodyBold, color: colors.crimsonTextOn, fontSize: 14 }
});
