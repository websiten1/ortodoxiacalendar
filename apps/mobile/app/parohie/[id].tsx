import { Link, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../lib/auth-context";
import {
  getParish,
  getProgramRecurent,
  getUpcomingEvents,
  isFollowing,
  Parish,
  follow,
  unfollow
} from "../../lib/parishes";
import { registerPushToken } from "../../lib/push";
import { colors, fonts, radii, shadows, spacing } from "../../lib/theme";

const weekdayLabels: Record<string, string> = {
  luni: "Luni",
  marti: "Marți",
  miercuri: "Miercuri",
  joi: "Joi",
  vineri: "Vineri",
  sambata: "Sâmbătă",
  duminica: "Duminică"
};

type Tab = "despre" | "evenimente" | "program";

export default function ProfilParohieScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session, requireAuth } = useAuth();
  const [parish, setParish] = useState<Parish | null>(null);
  const [program, setProgram] = useState<{ id: string; titlu: string; zi_saptamana: string; ora: string }[]>([]);
  const [events, setEvents] = useState<{ id: string; titlu: string; data: string; ora: string | null }[]>([]);
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("evenimente");

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const [parishData, programData, eventsData] = await Promise.all([
        getParish(id),
        getProgramRecurent(id),
        getUpcomingEvents(id, 10)
      ]);

      setParish(parishData);
      setProgram(programData);
      setEvents(eventsData);

      if (session?.user.id) {
        setFollowing(await isFollowing(session.user.id, id));
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Eroare la încărcare parohie.");
    } finally {
      setLoading(false);
    }
  }, [id, session?.user.id]);

  useEffect(() => {
    void load();
  }, [load]);

  function handleToggleFollow() {
    requireAuth(async () => {
      if (!session || !id) return;
      const userId = session.user.id;

      if (following) {
        await unfollow(userId, id);
        setFollowing(false);
      } else {
        await follow(userId, id);
        setFollowing(true);
        void registerPushToken(userId);
      }
    });
  }

  function openInMaps() {
    if (!parish) return;
    const query = encodeURIComponent(`${parish.adresa}, ${parish.localitate}`);
    Linking.openURL(`https://maps.google.com/?q=${query}`);
  }

  function callParish() {
    if (parish?.contact_telefon_public) {
      Linking.openURL(`tel:${parish.contact_telefon_public}`);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator color={colors.crimson} />
      </SafeAreaView>
    );
  }

  if (error || !parish) {
    return (
      <SafeAreaView style={styles.screen}>
        <Text style={styles.error}>{error || "Parohia nu a fost găsită."}</Text>
      </SafeAreaView>
    );
  }

  const groupedProgram = Object.entries(weekdayLabels).map(([key, label]) => ({
    key,
    label,
    entries: program.filter((p) => p.zi_saptamana === key)
  }));

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.hero} />

        <View style={styles.identity}>
          <View style={styles.logoCircle}>
            <Text style={{ color: colors.crimson, fontSize: 20 }}>✝</Text>
          </View>
          <Text style={styles.parishName}>{parish.nume}</Text>
          <Text style={styles.meta}>
            {parish.localitate} · Hram {parish.data_hram ? parish.data_hram.slice(5).split("-").reverse().join("/") : parish.hram}
          </Text>

          <View style={styles.actionRow}>
            <Pressable
              onPress={handleToggleFollow}
              style={[styles.followButton, following ? styles.followButtonActive : null]}
            >
              <Text style={[styles.followButtonText, following ? styles.followButtonTextActive : null]}>
                {following ? "Urmărit ✓" : "＋ Urmărește"}
              </Text>
            </Pressable>
            <Pressable onPress={openInMaps} style={styles.iconButton}>
              <Text style={{ color: colors.crimson, fontSize: 16 }}>⌖</Text>
            </Pressable>
            {parish.contact_telefon_public ? (
              <Pressable onPress={callParish} style={styles.iconButton}>
                <Text style={{ color: colors.crimson, fontSize: 16 }}>☎</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        <View style={styles.tabRow}>
          <Pressable onPress={() => setTab("despre")}>
            <Text style={[styles.tabText, tab === "despre" ? styles.tabTextActive : null]}>Despre</Text>
          </Pressable>
          <Pressable onPress={() => setTab("evenimente")}>
            <Text style={[styles.tabText, tab === "evenimente" ? styles.tabTextActive : null]}>Evenimente</Text>
          </Pressable>
          <Pressable onPress={() => setTab("program")}>
            <Text style={[styles.tabText, tab === "program" ? styles.tabTextActive : null]}>Program</Text>
          </Pressable>
        </View>

        <View style={styles.tabContent}>
          {tab === "despre" ? (
            <View style={{ gap: 14 }}>
              {parish.descriere ? <Text style={styles.bodyText}>{parish.descriere}</Text> : null}
              <View>
                <Text style={styles.sectionLabel}>Adresă</Text>
                <Text style={styles.bodyText}>
                  {parish.adresa}, {parish.localitate}, {parish.judet}
                </Text>
              </View>
              {parish.contact_telefon_public || parish.contact_email_public ? (
                <View>
                  <Text style={styles.sectionLabel}>Contact</Text>
                  {parish.contact_telefon_public ? (
                    <Text style={styles.bodyText}>{parish.contact_telefon_public}</Text>
                  ) : null}
                  {parish.contact_email_public ? (
                    <Text style={styles.bodyText}>{parish.contact_email_public}</Text>
                  ) : null}
                </View>
              ) : null}
            </View>
          ) : null}

          {tab === "evenimente" ? (
            <View style={{ gap: 10 }}>
              <Text style={styles.sectionLabel}>Următoarele evenimente</Text>
              {events.length === 0 ? <Text style={styles.muted}>Niciun eveniment programat.</Text> : null}
              {events.map((event) => (
                <Link key={event.id} href={`/eveniment/${event.id}`} asChild>
                  <Pressable style={styles.eventRow}>
                    <View style={styles.eventDate}>
                      <Text style={styles.eventDateText}>{event.data.slice(8, 10)}</Text>
                      <Text style={styles.eventMonthText}>{event.data.slice(5, 7)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.eventTitle}>{event.titlu}</Text>
                      <Text style={styles.muted}>{event.ora ? event.ora.slice(0, 5) : "Toată ziua"}</Text>
                    </View>
                    <Text style={styles.chevron}>›</Text>
                  </Pressable>
                </Link>
              ))}
            </View>
          ) : null}

          {tab === "program" ? (
            <View style={{ gap: 10 }}>
              <Text style={styles.sectionLabel}>Programul săptămânal</Text>
              {groupedProgram.map((group) =>
                group.entries.length > 0 ? (
                  <View key={group.key}>
                    <Text style={styles.dayLabel}>{group.label}</Text>
                    {group.entries.map((entry) => (
                      <Text key={entry.id} style={styles.bodyText}>
                        {entry.titlu} — {entry.ora.slice(0, 5)}
                      </Text>
                    ))}
                  </View>
                ) : null
              )}
              {program.length === 0 ? <Text style={styles.muted}>Niciun program recurent adăugat.</Text> : null}
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.screenBg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.screenBg },
  error: { fontFamily: fonts.body, color: colors.sundayRed, margin: spacing.md },
  hero: { height: 120, backgroundColor: colors.crimson },
  identity: { paddingHorizontal: spacing.md, marginTop: -32 },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fff",
    borderWidth: 3,
    borderColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.actionGlow,
    shadowOpacity: 0.12
  },
  parishName: { fontFamily: fonts.display, fontSize: 22, color: colors.ink, marginTop: 10 },
  meta: { fontFamily: fonts.body, color: colors.inkFaintAlt, fontSize: 12, marginTop: 4 },
  actionRow: { flexDirection: "row", gap: 9, marginTop: 14 },
  followButton: {
    flex: 1,
    backgroundColor: colors.crimson,
    borderRadius: radii.md,
    paddingVertical: 11,
    alignItems: "center"
  },
  followButtonActive: { backgroundColor: "#eefbf2" },
  followButtonText: { fontFamily: fonts.bodyBold, color: colors.crimsonTextOn, fontSize: 13 },
  followButtonTextActive: { color: "#067647" },
  iconButton: {
    width: 46,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center"
  },
  tabRow: {
    flexDirection: "row",
    gap: 24,
    paddingHorizontal: spacing.md,
    marginTop: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderAlt,
    paddingBottom: 10
  },
  tabText: { fontFamily: fonts.body, fontSize: 13, color: colors.inkFaint },
  tabTextActive: { fontFamily: fonts.bodyBold, color: colors.crimson },
  tabContent: { padding: spacing.md },
  sectionLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: colors.inkFaint,
    marginBottom: 8
  },
  bodyText: { fontFamily: fonts.body, color: colors.inkMuted, fontSize: 13.5, lineHeight: 20 },
  muted: { fontFamily: fonts.body, color: colors.inkFaint, fontSize: 13 },
  dayLabel: { fontFamily: fonts.bodySemiBold, color: colors.ink, marginTop: 6, marginBottom: 2 },
  eventRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.borderAlt,
    borderRadius: radii.md,
    padding: 11
  },
  eventDate: {
    width: 44,
    height: 48,
    backgroundColor: colors.crimson,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  eventDateText: { fontFamily: fonts.bodyExtraBold, color: "#fff", fontSize: 17, lineHeight: 19 },
  eventMonthText: { fontFamily: fonts.body, color: "rgba(255,255,255,0.8)", fontSize: 9 },
  eventTitle: { fontFamily: fonts.bodyBold, color: colors.ink, fontSize: 14 },
  chevron: { color: colors.gold, fontSize: 18 }
});
