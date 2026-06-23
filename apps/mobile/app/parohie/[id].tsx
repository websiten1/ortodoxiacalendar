import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { useAuth } from "../../lib/auth-context";
import {
  follow,
  getParish,
  getProgramRecurent,
  getUpcomingEvents,
  isFollowing,
  Parish,
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

export default function ProfilParohieScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session, requireAuth } = useAuth();
  const [parish, setParish] = useState<Parish | null>(null);
  const [program, setProgram] = useState<{ id: string; titlu: string; zi_saptamana: string; ora: string }[]>([]);
  const [events, setEvents] = useState<{ id: string; titlu: string; data: string; ora: string | null }[]>([]);
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const [parishData, programData, eventsData] = await Promise.all([
        getParish(id),
        getProgramRecurent(id),
        getUpcomingEvents(id)
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
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.parishName}>{parish.nume}</Text>
          <Text style={styles.meta}>
            Hram: {parish.hram}
            {parish.data_hram ? ` (${parish.data_hram})` : ""}
          </Text>
          <Pressable
            onPress={handleToggleFollow}
            style={[styles.followButton, following ? styles.followButtonActive : null]}
          >
            <Text style={[styles.followButtonText, following ? styles.followButtonTextActive : null]}>
              {following ? "Urmărit ✓ · Nu mai urmări" : "Urmărește"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Adresă</Text>
          <Text style={styles.body}>
            {parish.adresa}, {parish.localitate}, {parish.judet}
          </Text>
          <Pressable onPress={openInMaps}>
            <Text style={styles.link}>Deschide în Maps</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Contact</Text>
          {parish.contact_telefon_public ? (
            <Pressable onPress={() => Linking.openURL(`tel:${parish.contact_telefon_public}`)}>
              <Text style={styles.link}>{parish.contact_telefon_public}</Text>
            </Pressable>
          ) : null}
          {parish.contact_email_public ? (
            <Pressable onPress={() => Linking.openURL(`mailto:${parish.contact_email_public}`)}>
              <Text style={styles.link}>{parish.contact_email_public}</Text>
            </Pressable>
          ) : null}
          {!parish.contact_telefon_public && !parish.contact_email_public ? (
            <Text style={styles.muted}>Niciun contact public adăugat.</Text>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Programul săptămânal</Text>
          {groupedProgram.map((group) =>
            group.entries.length > 0 ? (
              <View key={group.key} style={{ marginTop: 8 }}>
                <Text style={styles.dayLabel}>{group.label}</Text>
                {group.entries.map((entry) => (
                  <Text key={entry.id} style={styles.body}>
                    {entry.titlu} — {entry.ora.slice(0, 5)}
                  </Text>
                ))}
              </View>
            ) : null
          )}
          {program.length === 0 ? <Text style={styles.muted}>Niciun program recurent adăugat.</Text> : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Evenimente viitoare</Text>
          {events.length === 0 ? <Text style={styles.muted}>Niciun eveniment programat.</Text> : null}
          {events.map((event) => (
            <Text key={event.id} style={styles.reading}>
              {event.data}
              {event.ora ? ` • ${event.ora.slice(0, 5)}` : ""} — {event.titlu}
            </Text>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.parchment },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.parchment },
  content: { padding: spacing.md, gap: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderAlt,
    gap: 6
  },
  parishName: { fontFamily: fonts.display, fontSize: 22, color: colors.ink },
  meta: { fontFamily: fonts.body, color: colors.inkMuted },
  body: { fontFamily: fonts.body, color: colors.inkMuted },
  muted: { fontFamily: fonts.body, color: colors.inkFaint },
  reading: { fontFamily: fonts.reading, color: colors.inkMuted, fontSize: 15 },
  cardLabel: { fontFamily: fonts.bodyBold, color: colors.ink, fontSize: 15 },
  dayLabel: { fontFamily: fonts.bodySemiBold, color: colors.ink, marginTop: 4 },
  link: { fontFamily: fonts.bodySemiBold, color: colors.crimson },
  error: { fontFamily: fonts.body, color: colors.sundayRed, margin: spacing.md },
  followButton: {
    marginTop: 10,
    alignSelf: "flex-start",
    backgroundColor: colors.crimson,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.md,
    ...shadows.actionGlow
  },
  followButtonActive: {
    backgroundColor: "#eefbf2",
    shadowOpacity: 0
  },
  followButtonText: { fontFamily: fonts.bodyBold, color: colors.crimsonTextOn },
  followButtonTextActive: { color: "#067647" }
});
