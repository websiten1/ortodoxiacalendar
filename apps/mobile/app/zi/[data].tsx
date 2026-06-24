import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../lib/auth-context";
import { DaySarbatoare, getCombinedCalendar, getDaySarbatoare } from "../../lib/calendar";
import { colors, fonts, radii, spacing } from "../../lib/theme";

const weekdayNames = ["Duminică", "Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă"];
const monthNames = [
  "ianuarie", "februarie", "martie", "aprilie", "mai", "iunie",
  "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"
];

type LocalItem = {
  titlu: string;
  ora: string | null;
  parohieNume?: string;
  eventId?: string;
  sursa: "local_eveniment" | "local_recurent";
};

export default function DayDetailScreen() {
  const { data } = useLocalSearchParams<{ data: string }>();
  const router = useRouter();
  const { session } = useAuth();
  const [sarbatoare, setSarbatoare] = useState<DaySarbatoare | null>(null);
  const [localItems, setLocalItems] = useState<LocalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!data) return;
    setLoading(true);
    setError("");
    try {
      const sarbatoareData = await getDaySarbatoare(data);
      setSarbatoare(sarbatoareData);

      if (session?.user.id) {
        const days = await getCombinedCalendar(session.user.id, new Date(`${data}T00:00:00`), 1);
        const items = (days[0]?.items ?? []).filter(
          (item): item is LocalItem => item.sursa === "local_eveniment" || item.sursa === "local_recurent"
        );
        setLocalItems(items);
      } else {
        setLocalItems([]);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Eroare la încărcare zi.");
    } finally {
      setLoading(false);
    }
  }, [data, session?.user.id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!data) return null;

  const dateObj = new Date(`${data}T00:00:00`);
  const weekday = weekdayNames[dateObj.getDay()];
  const monthLabel = `${monthNames[dateObj.getMonth()]} ${dateObj.getFullYear()}`;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>‹ {monthLabel}</Text>
        </Pressable>
        <Text style={styles.weekday}>{weekday}</Text>
        <Text style={styles.dateTitle}>
          {dateObj.getDate()} {monthNames[dateObj.getMonth()]} {dateObj.getFullYear()}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? <ActivityIndicator color={colors.crimson} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {!loading && sarbatoare ? (
          <>
            <View style={styles.badgeRow}>
              {sarbatoare.tip === "post_incepe" ? (
                <View style={[styles.badge, { backgroundColor: colors.fastBg }]}>
                  <Text style={[styles.badgeText, { color: colors.fastText }]}>Zi de post</Text>
                </View>
              ) : null}
              {sarbatoare.zi_libera ? (
                <View style={[styles.badge, { backgroundColor: colors.crimsonTint }]}>
                  <Text style={[styles.badgeText, { color: colors.crimson }]}>Sărbătoare</Text>
                </View>
              ) : null}
            </View>

            <Text style={styles.sectionLabel}>Sfântul zilei</Text>
            <Text style={styles.feastTitle}>{sarbatoare.nume_sarbatoare}</Text>
            {sarbatoare.subtitlu ? <Text style={styles.feastSubtitle}>{sarbatoare.subtitlu}</Text> : null}
            {sarbatoare.sinaxar_text ? <Text style={styles.bodyText}>{sarbatoare.sinaxar_text}</Text> : null}
          </>
        ) : null}

        {!loading && !sarbatoare ? (
          <Text style={styles.bodyText}>Nu am date liturgice pentru această zi.</Text>
        ) : null}

        <View style={styles.divider} />
        <Text style={styles.sectionLabel}>Slujbe în parohia ta</Text>
        {!session ? (
          <Text style={styles.muted}>Autentifică-te și urmărește o parohie ca să vezi programul ei aici.</Text>
        ) : null}
        {session && localItems.length === 0 ? (
          <Text style={styles.muted}>Nicio slujbă programată în această zi la parohiile urmărite.</Text>
        ) : null}
        {localItems.map((item, index) => {
          const row = (
            <View style={styles.eventRow}>
              <View style={styles.eventTime}>
                <Text style={styles.eventTimeText}>{item.ora ? item.ora.slice(0, 5) : "—"}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.eventTitle}>{item.titlu}</Text>
                {item.parohieNume ? <Text style={styles.muted}>{item.parohieNume}</Text> : null}
              </View>
              {item.eventId ? <Text style={styles.chevron}>›</Text> : null}
            </View>
          );

          return item.eventId ? (
            <Link key={index} href={`/eveniment/${item.eventId}`} asChild>
              <Pressable>{row}</Pressable>
            </Link>
          ) : (
            <View key={index}>{row}</View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.screenBg },
  header: { backgroundColor: colors.crimson, padding: spacing.md, paddingTop: spacing.sm, gap: 4 },
  backLink: { fontFamily: fonts.body, fontSize: 13, color: "rgba(255,255,255,0.85)" },
  weekday: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.6)",
    marginTop: 8
  },
  dateTitle: { fontFamily: fonts.display, fontSize: 28, color: "#fff", marginTop: 2 },
  content: { padding: spacing.md, paddingBottom: 40 },
  error: { fontFamily: fonts.body, color: colors.sundayRed },
  badgeRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  badge: { borderRadius: 7, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontFamily: fonts.bodyBold, fontSize: 11 },
  sectionLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: colors.inkFaint,
    marginBottom: 6
  },
  feastTitle: { fontFamily: fonts.reading, fontSize: 23, color: colors.ink, lineHeight: 30 },
  feastSubtitle: { fontFamily: fonts.body, fontSize: 13, color: colors.inkFaintAlt, marginTop: 4 },
  bodyText: { fontFamily: fonts.body, fontSize: 13.5, color: colors.inkMuted, lineHeight: 22, marginTop: 10 },
  muted: { fontFamily: fonts.body, color: colors.inkFaint, fontSize: 13 },
  divider: { height: 1, backgroundColor: colors.borderAlt, marginVertical: 20 },
  eventRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderAlt,
    borderRadius: radii.md,
    padding: 12,
    marginBottom: 10
  },
  eventTime: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.crimsonTint,
    alignItems: "center",
    justifyContent: "center"
  },
  eventTimeText: { fontFamily: fonts.bodyBold, color: colors.crimson, fontSize: 13 },
  eventTitle: { fontFamily: fonts.bodyBold, color: colors.ink, fontSize: 14 },
  chevron: { color: colors.gold, fontSize: 18 }
});
