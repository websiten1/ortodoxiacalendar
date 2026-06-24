import { useCallback, useEffect, useState } from "react";
import { Link, useFocusEffect, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { useAuth } from "../../lib/auth-context";
import { CalendarDay, getCombinedCalendar, getFollowedParishesForCalendar } from "../../lib/calendar";
import { colors, fonts, radii, spacing } from "../../lib/theme";

const PAGE_SIZE = 14;
const WEEK_STRIP_SIZE = 7;
const weekdayShort = ["Dum", "Lun", "Mar", "Mie", "Joi", "Vin", "Sâm"];
const monthNames = [
  "Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie",
  "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"
];

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
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
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));

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

      const data = await getCombinedCalendar(session.user.id, startOfDay(new Date()), PAGE_SIZE, filterParishId);
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

  const today = startOfDay(new Date());
  const weekStrip = Array.from({ length: WEEK_STRIP_SIZE }, (_, i) => addDays(today, i));
  const todayIso = today.toISOString().slice(0, 10);
  const todayEntry = days.find((d) => d.data === todayIso);
  const upcomingDays = days.filter((d) => d.data !== todayIso);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerNav}>‹</Text>
          <View style={{ alignItems: "center" }}>
            <Text style={styles.headerMonth}>
              {monthNames[today.getMonth()]} {today.getFullYear()}
            </Text>
            <Text style={styles.headerSubtitle}>Calendar creștin ortodox</Text>
          </View>
          <Text style={styles.headerNav}>›</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.weekStrip}>
        {weekStrip.map((date) => {
          const iso = date.toISOString().slice(0, 10);
          const isToday = iso === todayIso;
          return (
            <Link key={iso} href={`/zi/${iso}`} asChild>
              <Pressable style={[styles.weekChip, isToday ? styles.weekChipActive : null]}>
                <Text style={[styles.weekChipDay, isToday ? styles.weekChipDayActive : null]}>
                  {weekdayShort[date.getDay()]}
                </Text>
                <Text style={[styles.weekChipDate, isToday ? styles.weekChipDateActive : null]}>
                  {date.getDate()}
                </Text>
              </Pressable>
            </Link>
          );
        })}
      </ScrollView>

      {followed.length > 1 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
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
        </ScrollView>
      ) : null}

      <ScrollView
        contentContainerStyle={styles.list}
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 200) {
            loadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {todayEntry && todayEntry.items.length > 0 ? (
          <Link href={`/zi/${todayEntry.data}`} asChild>
            <Pressable style={styles.featuredCard}>
              <View style={styles.featuredStripe} />
              <View style={styles.featuredBody}>
                <View style={styles.badgeRow}>
                  <View style={[styles.badge, { backgroundColor: colors.crimsonTint }]}>
                    <Text style={[styles.badgeText, { color: colors.crimson }]}>
                      AZI · {today.getDate()} {monthNames[today.getMonth()].toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.featuredTitle}>
                  {todayEntry.items.find((i) => i.sursa === "global")?.titlu ?? "Zi liturgică"}
                </Text>
                {todayEntry.items
                  .filter((i) => i.sursa !== "global")
                  .slice(0, 2)
                  .map((item, index) => (
                    <Text key={index} style={styles.featuredMeta}>
                      {item.titlu}
                      {item.ora ? ` · ${item.ora.slice(0, 5)}` : ""}
                    </Text>
                  ))}
              </View>
            </Pressable>
          </Link>
        ) : null}

        <Text style={styles.sectionLabel}>Zilele următoare</Text>

        {upcomingDays.map((day) => {
          const dateObj = new Date(`${day.data}T00:00:00`);
          const isSunday = dateObj.getDay() === 0;
          const feast = day.items.find((i) => i.sursa === "global");
          const localCount = day.items.filter((i) => i.sursa !== "global").length;

          if (!feast && localCount === 0) return null;

          return (
            <Link key={day.data} href={`/zi/${day.data}`} asChild>
              <Pressable style={styles.dayRow}>
                <View style={styles.dayNumberBox}>
                  <Text style={[styles.dayNumber, isSunday ? { color: colors.sundayRed } : null]}>
                    {dateObj.getDate()}
                  </Text>
                  <Text style={[styles.dayLabel, isSunday ? { color: colors.sundayRed } : null]}>
                    {weekdayShort[dateObj.getDay()]}
                  </Text>
                </View>
                <View style={[styles.dayStripe, { backgroundColor: isSunday ? colors.sundayRed : colors.ordinaryBlue }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.dayTitle}>{feast?.titlu ?? "Zi liturgică"}</Text>
                  {localCount > 0 ? (
                    <Text style={styles.dayMeta}>{localCount} {localCount === 1 ? "slujbă" : "slujbe"} la parohiile tale</Text>
                  ) : null}
                </View>
              </Pressable>
            </Link>
          );
        })}

        {loadingMore ? <ActivityIndicator color={colors.crimson} style={{ marginTop: 12 }} /> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.screenBg },
  centerScreen: {
    flex: 1,
    backgroundColor: colors.screenBg,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    gap: spacing.md
  },
  header: { backgroundColor: colors.crimson, paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.md },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerNav: { color: "#fff", fontSize: 20, width: 30, textAlign: "center" },
  headerMonth: { fontFamily: fonts.display, fontSize: 22, color: "#fff" },
  headerSubtitle: { fontFamily: fonts.bodySemiBold, fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginTop: 3 },
  weekStrip: { gap: 8, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.borderAlt },
  weekChip: { width: 46, alignItems: "center", paddingVertical: 6, borderRadius: 10, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.borderAlt },
  weekChipActive: { backgroundColor: colors.crimson, borderColor: colors.crimson },
  weekChipDay: { fontFamily: fonts.bodySemiBold, fontSize: 9, textTransform: "uppercase", color: colors.inkFaint },
  weekChipDayActive: { color: "rgba(255,255,255,0.8)" },
  weekChipDate: { fontFamily: fonts.reading, fontSize: 18, fontWeight: "700", color: colors.ink, marginTop: 2 },
  weekChipDateActive: { color: "#fff" },
  filterRow: { gap: 8, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radii.pill, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.crimson, borderColor: colors.crimson },
  chipText: { fontFamily: fonts.bodySemiBold, color: colors.inkMuted, fontSize: 13 },
  chipTextActive: { color: colors.crimsonTextOn },
  list: { padding: spacing.md, paddingBottom: 100 },
  error: { fontFamily: fonts.body, color: colors.sundayRed, marginBottom: 10 },
  featuredCard: { flexDirection: "row", backgroundColor: colors.surface, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.borderAlt, overflow: "hidden", marginBottom: 16 },
  featuredStripe: { width: 6, backgroundColor: colors.crimson },
  featuredBody: { flex: 1, padding: 14 },
  badgeRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontFamily: fonts.bodyExtraBold, fontSize: 10, letterSpacing: 0.5 },
  featuredTitle: { fontFamily: fonts.reading, fontSize: 18, color: colors.ink, lineHeight: 24 },
  featuredMeta: { fontFamily: fonts.body, fontSize: 12, color: colors.inkFaintAlt, marginTop: 4 },
  sectionLabel: { fontFamily: fonts.bodySemiBold, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: colors.inkFaint, marginBottom: 8 },
  dayRow: { flexDirection: "row", gap: 12, alignItems: "center", paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: colors.borderAlt },
  dayNumberBox: { width: 34, alignItems: "center" },
  dayNumber: { fontFamily: fonts.reading, fontSize: 20, color: colors.ink, lineHeight: 22 },
  dayLabel: { fontFamily: fonts.bodySemiBold, fontSize: 9, textTransform: "uppercase", color: colors.inkFaint },
  dayStripe: { width: 3, height: 30, borderRadius: 2 },
  dayTitle: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink },
  dayMeta: { fontFamily: fonts.body, fontSize: 11.5, color: colors.inkFaintAlt, marginTop: 2 },
  promptTitle: { fontFamily: fonts.display, fontSize: 20, color: colors.ink, textAlign: "center" },
  promptBody: { fontFamily: fonts.body, color: colors.inkMuted, textAlign: "center" },
  primaryButton: { backgroundColor: colors.crimson, borderRadius: radii.md, paddingVertical: 14, paddingHorizontal: 24, alignItems: "center" },
  primaryButtonText: { fontFamily: fonts.bodyBold, color: colors.crimsonTextOn, fontSize: 15 }
});
