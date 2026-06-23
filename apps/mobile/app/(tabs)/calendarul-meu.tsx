import { useCallback, useEffect, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { useAuth } from "../../lib/auth-context";
import { CalendarDay, getCombinedCalendar, getFollowedParishesForCalendar } from "../../lib/calendar";
import { colors, fonts, radii, shadows, spacing } from "../../lib/theme";

const PAGE_SIZE = 14;

function formatDayLabel(iso: string) {
  const date = new Date(`${iso}T00:00:00`);
  return date.toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "long" });
}

export default function CalendarulMeuScreen() {
  const router = useRouter();
  const { session, requireAuth } = useAuth();
  const [days, setDays] = useState<CalendarDay[]>([]);
  const [followed, setFollowed] = useState<{ id: string; nume: string }[]>([]);
  const [filterParishId, setFilterParishId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const loadInitial = useCallback(async () => {
    if (!session?.user.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const parishes = await getFollowedParishesForCalendar(session.user.id);
      setFollowed(parishes);

      const data = await getCombinedCalendar(session.user.id, new Date(), PAGE_SIZE, filterParishId);
      setDays(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Eroare la încărcare calendar.");
    } finally {
      setLoading(false);
    }
  }, [session?.user.id, filterParishId]);

  useFocusEffect(
    useCallback(() => {
      void loadInitial();
    }, [loadInitial])
  );

  async function loadMore() {
    if (!session?.user.id || loadingMore || days.length === 0) return;
    setLoadingMore(true);
    try {
      const lastDate = new Date(`${days[days.length - 1].data}T00:00:00`);
      lastDate.setDate(lastDate.getDate() + 1);
      const more = await getCombinedCalendar(session.user.id, lastDate, PAGE_SIZE, filterParishId);
      setDays((prev) => [...prev, ...more]);
    } catch {
      // ignore pagination errors, user can retry by scrolling again
    } finally {
      setLoadingMore(false);
    }
  }

  if (!session) {
    return (
      <SafeAreaView style={styles.centerScreen}>
        <Text style={styles.promptTitle}>Autentifică-te ca să vezi calendarul tău</Text>
        <Pressable style={styles.primaryButton} onPress={() => requireAuth(() => loadInitial())}>
          <Text style={styles.primaryButtonText}>Autentifică-te</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.centerScreen}>
        <ActivityIndicator color={colors.crimson} />
      </SafeAreaView>
    );
  }

  if (followed.length === 0) {
    return (
      <SafeAreaView style={styles.centerScreen}>
        <Text style={styles.promptBody}>Nu urmărești încă nicio parohie. Caută una în tab-ul Descoperă.</Text>
        <Pressable style={styles.primaryButton} onPress={() => router.push("/(tabs)")}>
          <Text style={styles.primaryButtonText}>Descoperă parohii</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.heading}>Calendarul meu</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {followed.length > 1 ? (
          <View style={styles.filterRow}>
            <Pressable
              onPress={() => setFilterParishId(undefined)}
              style={[styles.chip, !filterParishId ? styles.chipActive : null]}
            >
              <Text style={[styles.chipText, !filterParishId ? styles.chipTextActive : null]}>Toate</Text>
            </Pressable>
            {followed.map((parish) => (
              <Pressable
                key={parish.id}
                onPress={() => setFilterParishId(parish.id)}
                style={[styles.chip, filterParishId === parish.id ? styles.chipActive : null]}
              >
                <Text style={[styles.chipText, filterParishId === parish.id ? styles.chipTextActive : null]}>
                  {parish.nume}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>

      <FlatList
        data={days}
        keyExtractor={(item) => item.data}
        contentContainerStyle={styles.list}
        onEndReachedThreshold={0.4}
        onEndReached={loadMore}
        ListFooterComponent={loadingMore ? <ActivityIndicator color={colors.crimson} style={{ marginTop: 12 }} /> : null}
        renderItem={({ item }) => (
          <View style={styles.dayBlock}>
            <Text style={styles.dayHeading}>{formatDayLabel(item.data)}</Text>
            {item.items.length === 0 ? null : (
              <View style={styles.dayCard}>
                {item.items.map((calItem, index) => (
                  <View key={index} style={styles.eventRow}>
                    <Text>{calItem.sursa === "global" ? "✝" : "◆"}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={calItem.sursa === "global" ? styles.feastText : styles.eventText}>
                        {calItem.titlu}
                      </Text>
                      {calItem.parohieNume ? (
                        <Text style={styles.eventMeta}>
                          {calItem.parohieNume}
                          {calItem.ora ? ` • ${calItem.ora.slice(0, 5)}` : ""}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.parchment },
  centerScreen: {
    flex: 1,
    backgroundColor: colors.parchment,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    gap: spacing.md
  },
  header: { padding: spacing.md, paddingBottom: 0, gap: spacing.sm },
  heading: { fontFamily: fonts.display, fontSize: 28, color: colors.ink },
  error: { fontFamily: fonts.body, color: colors.sundayRed },
  promptTitle: { fontFamily: fonts.display, fontSize: 20, color: colors.ink, textAlign: "center" },
  promptBody: { fontFamily: fonts.body, color: colors.inkMuted, textAlign: "center" },
  primaryButton: {
    backgroundColor: colors.crimson,
    borderRadius: radii.md,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    ...shadows.actionGlow
  },
  primaryButtonText: { fontFamily: fonts.bodyBold, color: colors.crimsonTextOn, fontSize: 15 },
  filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
  },
  chipActive: { backgroundColor: colors.crimson, borderColor: colors.crimson },
  chipText: { fontFamily: fonts.bodySemiBold, color: colors.inkMuted, fontSize: 13 },
  chipTextActive: { color: colors.crimsonTextOn },
  list: { padding: spacing.md, gap: spacing.sm },
  dayBlock: { marginBottom: 12 },
  dayHeading: { fontFamily: fonts.bodySemiBold, color: colors.ink, marginBottom: 6, textTransform: "capitalize" },
  dayCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderAlt,
    gap: 10
  },
  eventRow: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  feastText: { fontFamily: fonts.reading, color: colors.crimson, fontSize: 15 },
  eventText: { fontFamily: fonts.bodyMedium, color: colors.ink, fontSize: 14 },
  eventMeta: { fontFamily: fonts.body, color: colors.inkFaint, fontSize: 12 }
});
