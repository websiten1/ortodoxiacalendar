import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { useAuth } from "../../lib/auth-context";
import { follow, isFollowing, Parish, searchParishes, unfollow } from "../../lib/parishes";
import { registerPushToken } from "../../lib/push";
import { colors, fonts, radii, spacing } from "../../lib/theme";
import { ONBOARDING_KEY } from "../onboarding";

type Filter = "toate" | "urmarite" | "hram-azi";

function hasHramToday(parish: Parish) {
  if (!parish.data_hram) return false;
  const today = new Date();
  const hram = new Date(`${parish.data_hram}T00:00:00`);
  return hram.getMonth() === today.getMonth() && hram.getDate() === today.getDate();
}

export default function DescoperaScreen() {
  const router = useRouter();
  const { session, requireAuth } = useAuth();
  const [query, setQuery] = useState("");
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<Filter>("toate");

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((value) => {
      if (!value) {
        router.replace("/onboarding");
      }
    });
  }, [router]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await searchParishes(query);
      setParishes(data);

      if (session?.user.id) {
        const states = await Promise.all(data.map((p) => isFollowing(session.user.id, p.id)));
        setFollowedIds(new Set(data.filter((_, i) => states[i]).map((p) => p.id)));
      } else {
        setFollowedIds(new Set());
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Eroare la căutare.");
    } finally {
      setLoading(false);
    }
  }, [query, session?.user.id]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  async function handleToggleFollow(parish: Parish) {
    requireAuth(async () => {
      if (!session) return;
      const userId = session.user.id;
      const alreadyFollowing = followedIds.has(parish.id);

      if (alreadyFollowing) {
        await unfollow(userId, parish.id);
        setFollowedIds((prev) => {
          const next = new Set(prev);
          next.delete(parish.id);
          return next;
        });
      } else {
        await follow(userId, parish.id);
        setFollowedIds((prev) => new Set(prev).add(parish.id));
        void registerPushToken(userId);
      }
    });
  }

  const visibleParishes = parishes.filter((p) => {
    if (filter === "urmarite") return followedIds.has(p.id);
    if (filter === "hram-azi") return hasHramToday(p);
    return true;
  });

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.heading}>Parohii</Text>
        <View style={styles.search}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            placeholder="Caută parohie sau oraș…"
            placeholderTextColor={colors.placeholder}
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          <Pressable onPress={() => setFilter("toate")} style={[styles.chip, filter === "toate" ? styles.chipActive : null]}>
            <Text style={[styles.chipText, filter === "toate" ? styles.chipTextActive : null]}>Toate</Text>
          </Pressable>
          <Pressable onPress={() => setFilter("urmarite")} style={[styles.chip, filter === "urmarite" ? styles.chipActive : null]}>
            <Text style={[styles.chipText, filter === "urmarite" ? styles.chipTextActive : null]}>Urmărite</Text>
          </Pressable>
          <Pressable onPress={() => setFilter("hram-azi")} style={[styles.chip, filter === "hram-azi" ? styles.chipActive : null]}>
            <Text style={[styles.chipText, filter === "hram-azi" ? styles.chipTextActive : null]}>Cu hram azi</Text>
          </Pressable>
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {loading ? <ActivityIndicator color={colors.crimson} style={{ marginTop: 12 }} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {!loading && visibleParishes.length === 0 ? (
          <Text style={styles.emptyText}>
            {filter === "toate"
              ? "Nu am găsit parohii pentru căutarea ta. Încearcă alt nume sau altă localitate."
              : "Nicio parohie nu corespunde acestui filtru momentan."}
          </Text>
        ) : null}

        {visibleParishes.map((item) => {
          const following = followedIds.has(item.id);
          return (
            <Link href={`/parohie/${item.id}`} asChild key={item.id}>
              <Pressable style={styles.card}>
                <View style={styles.cardIcon}>
                  <Text style={{ color: colors.crimson, fontSize: 18 }}>✝</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.nume}</Text>
                  <Text style={styles.cardMeta}>
                    {item.localitate}, {item.judet}
                  </Text>
                  {hasHramToday(item) ? (
                    <Text style={styles.hramBadge}>● Hram astăzi</Text>
                  ) : (
                    <Text style={styles.cardMeta}>Hram: {item.hram}</Text>
                  )}
                  <Pressable
                    onPress={(event) => {
                      event.stopPropagation();
                      void handleToggleFollow(item);
                    }}
                    style={styles.followRow}
                  >
                    <Text style={[styles.followText, following ? styles.followTextActive : null]}>
                      {following ? "Urmărit ✓" : "Urmărește"}
                    </Text>
                  </Pressable>
                </View>
              </Pressable>
            </Link>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.screenBg },
  header: { padding: spacing.md, gap: spacing.sm },
  heading: { fontFamily: fonts.display, fontSize: 27, color: colors.ink },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 13,
    paddingVertical: 11
  },
  searchIcon: { color: colors.placeholder },
  searchInput: { flex: 1, fontFamily: fonts.body, fontSize: 13.5, color: colors.ink },
  filterRow: { gap: 8 },
  chip: { paddingHorizontal: 13, paddingVertical: 7, borderRadius: radii.pill, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.crimson, borderColor: colors.crimson },
  chipText: { fontFamily: fonts.bodySemiBold, color: colors.inkMuted, fontSize: 12 },
  chipTextActive: { color: colors.crimsonTextOn },
  list: { padding: spacing.md, paddingTop: 0, gap: spacing.sm },
  error: { fontFamily: fonts.body, color: colors.sundayRed },
  emptyText: { fontFamily: fonts.body, color: colors.inkMuted, marginTop: 12 },
  card: {
    flexDirection: "row",
    gap: 13,
    alignItems: "flex-start",
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 13,
    borderWidth: 1,
    borderColor: colors.borderAlt
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 13,
    backgroundColor: colors.crimsonTint,
    alignItems: "center",
    justifyContent: "center"
  },
  cardTitle: { fontFamily: fonts.reading, fontSize: 15, fontWeight: "700", color: colors.ink },
  cardMeta: { fontFamily: fonts.body, color: colors.inkFaintAlt, fontSize: 12, marginTop: 2 },
  hramBadge: { fontFamily: fonts.bodySemiBold, color: colors.sundayRed, fontSize: 11, marginTop: 4 },
  followRow: { marginTop: 8, minHeight: 24 },
  followText: { fontFamily: fonts.bodyBold, color: colors.crimson, fontSize: 13 },
  followTextActive: { color: "#067647" }
});
