import { Link, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../lib/auth-context";
import { getPriestEvents, getPriestStats, sendEventNotification, usePriestParish } from "../../lib/priest";
import { colors, fonts, radii, spacing } from "../../lib/theme";

type Stats = { followers: number; eventsThisMonth: number; eventsThisWeek: number };
type EventRow = { id: string; titlu: string; data: string; ora: string | null; tip: string; notificare_trimisa: boolean };

export default function PreotPanelScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { parish, loading, error } = usePriestParish();
  const [stats, setStats] = useState<Stats>({ followers: 0, eventsThisMonth: 0, eventsThisWeek: 0 });
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const load = useCallback(async () => {
    if (!parish) return;
    setLoadingEvents(true);
    try {
      const [statsData, eventsData] = await Promise.all([getPriestStats(parish.id), getPriestEvents(parish.id)]);
      setStats(statsData);
      setEvents(eventsData);
    } finally {
      setLoadingEvents(false);
    }
  }, [parish]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  async function handleSendNotification(eventId: string) {
    try {
      await sendEventNotification(eventId);
      void load();
    } catch (sendError) {
      Alert.alert("Eroare", sendError instanceof Error ? sendError.message : "Nu am putut trimite notificarea.");
    }
  }

  function handleLogout() {
    Alert.alert("Ieși din cont", "Sigur vrei să te delogezi din panoul de preot?", [
      { text: "Anulează", style: "cancel" },
      { text: "Ieși din cont", style: "destructive", onPress: () => void signOut().then(() => router.replace("/preot/login")) }
    ]);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator color={colors.gold} />
      </SafeAreaView>
    );
  }

  if (error || !parish) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={() => router.replace("/preot/login")} style={styles.errorButton}>
            <Text style={styles.errorButtonText}>Înapoi la autentificare</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerEyebrow}>Panou preot</Text>
        <Text style={styles.headerTitle}>{parish.nume}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.followers}</Text>
            <Text style={styles.statLabel}>Urmăritori</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.eventsThisMonth}</Text>
            <Text style={styles.statLabel}>Luna asta</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.eventsThisWeek}</Text>
            <Text style={styles.statLabel}>Săpt. asta</Text>
          </View>
        </View>

        <Link href="/preot/eveniment-nou" asChild>
          <Pressable style={styles.ctaCard}>
            <View style={styles.ctaIcon}>
              <Text style={{ color: "#fff", fontSize: 22 }}>＋</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.ctaTitle}>Adaugă un eveniment</Text>
              <Text style={styles.ctaSubtitle}>Slujbă, spovedanie, hram, agapă…</Text>
            </View>
            <Text style={styles.ctaChevron}>›</Text>
          </Pressable>
        </Link>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>Evenimente programate</Text>
        </View>

        {loadingEvents ? <ActivityIndicator color={colors.crimson} /> : null}
        {!loadingEvents && events.length === 0 ? (
          <Text style={styles.muted}>Niciun eveniment programat.</Text>
        ) : null}
        {events.map((event) => (
          <View key={event.id} style={styles.eventCard}>
            <View style={styles.eventDate}>
              <Text style={styles.eventDateText}>{event.data.slice(8, 10)}</Text>
              <Text style={styles.eventMonthText}>{event.data.slice(5, 7)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.eventTitle}>{event.titlu}</Text>
              <Text style={styles.muted}>
                {event.ora ? event.ora.slice(0, 5) : "Toată ziua"} ·{" "}
                {event.notificare_trimisa ? "notificare trimisă" : "fără notificare"}
              </Text>
            </View>
            {!event.notificare_trimisa ? (
              <Pressable onPress={() => handleSendNotification(event.id)}>
                <Text style={styles.sendLink}>Trimite</Text>
              </Pressable>
            ) : null}
          </View>
        ))}

        <View style={styles.menuCard}>
          <Link href="/preot/profil" asChild>
            <Pressable style={styles.menuRow}>
              <Text style={styles.menuIcon}>✎</Text>
              <Text style={styles.menuText}>Editează profilul parohiei</Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          </Link>
          <Link href="/preot/program" asChild>
            <Pressable style={[styles.menuRow, styles.menuRowBorder]}>
              <Text style={styles.menuIcon}>◷</Text>
              <Text style={styles.menuText}>Program permanent al slujbelor</Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          </Link>
          <Pressable style={styles.menuRow} onPress={() => router.push("/(tabs)")}>
            <Text style={styles.menuIcon}>▦</Text>
            <Text style={styles.menuText}>Vezi aplicația ca enoriaș</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        </View>

        <Pressable onPress={handleLogout} style={styles.logoutLink}>
          <Text style={styles.logoutText}>Ieși din cont</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.parchment },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.priestBg },
  errorBox: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg, gap: spacing.sm },
  errorText: { fontFamily: fonts.body, color: colors.sundayRed, textAlign: "center" },
  errorButton: { backgroundColor: colors.crimson, borderRadius: radii.md, paddingHorizontal: 18, paddingVertical: 12 },
  errorButtonText: { fontFamily: fonts.bodyBold, color: colors.crimsonTextOn },
  header: { backgroundColor: colors.priestBg, padding: spacing.md, paddingTop: spacing.sm },
  headerEyebrow: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.55)"
  },
  headerTitle: { fontFamily: fonts.display, fontSize: 22, color: "#fff", marginTop: 4 },
  content: { padding: spacing.md, gap: spacing.sm, paddingBottom: 50 },
  statRow: { flexDirection: "row", gap: 11, marginBottom: 6 },
  statCard: { flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderAlt, borderRadius: radii.lg, padding: 13 },
  statValue: { fontFamily: fonts.display, fontSize: 24, color: colors.crimson },
  statLabel: { fontFamily: fonts.body, color: colors.inkFaintAlt, fontSize: 11, marginTop: 1 },
  ctaCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colors.crimson,
    borderRadius: radii.lg,
    padding: 16
  },
  ctaIcon: { width: 46, height: 46, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.16)", alignItems: "center", justifyContent: "center" },
  ctaTitle: { fontFamily: fonts.bodyBold, color: "#fff", fontSize: 15 },
  ctaSubtitle: { fontFamily: fonts.body, color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 2 },
  ctaChevron: { color: "#fff", fontSize: 18 },
  sectionHeaderRow: { marginTop: 8, marginBottom: 2 },
  sectionLabel: { fontFamily: fonts.bodySemiBold, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: colors.inkFaint },
  muted: { fontFamily: fonts.body, color: colors.inkFaintAlt, fontSize: 12, marginTop: 2 },
  eventCard: {
    flexDirection: "row",
    gap: 13,
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderAlt,
    borderRadius: radii.lg,
    padding: 13
  },
  eventDate: { width: 44, height: 50, backgroundColor: colors.crimsonTint, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  eventDateText: { fontFamily: fonts.bodyExtraBold, color: colors.crimson, fontSize: 16, lineHeight: 18 },
  eventMonthText: { fontFamily: fonts.body, color: colors.crimson, fontSize: 9 },
  eventTitle: { fontFamily: fonts.bodyBold, color: colors.ink, fontSize: 14 },
  sendLink: { fontFamily: fonts.bodyBold, color: colors.crimson, fontSize: 12 },
  menuCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderAlt, borderRadius: radii.lg, overflow: "hidden", marginTop: 10 },
  menuRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  menuRowBorder: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.borderAlt },
  menuIcon: { color: colors.crimson },
  menuText: { flex: 1, fontFamily: fonts.body, fontSize: 13.5, color: colors.ink },
  chevron: { color: colors.gold, fontSize: 18 },
  logoutLink: { alignItems: "center", marginTop: 18 },
  logoutText: { fontFamily: fonts.body, color: colors.sundayRed, fontSize: 13 }
});
