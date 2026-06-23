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

export default function DescoperaScreen() {
  const router = useRouter();
  const { session, requireAuth } = useAuth();
  const [query, setQuery] = useState("");
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());

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

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Descoperă</Text>
        <TextInput
          placeholder="Caută o parohie (nume, oraș, județ)"
          placeholderTextColor={colors.placeholder}
          value={query}
          onChangeText={setQuery}
          style={styles.search}
        />

        {loading ? <ActivityIndicator color={colors.crimson} style={{ marginTop: 12 }} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {!loading && parishes.length === 0 ? (
          <Text style={styles.emptyText}>
            Nu am găsit parohii pentru căutarea ta. Încearcă alt nume sau altă localitate.
          </Text>
        ) : null}

        {parishes.map((item) => {
          const following = followedIds.has(item.id);
          return (
            <Link href={`/parohie/${item.id}`} asChild key={item.id}>
              <Pressable style={styles.card}>
                <Text style={styles.cardTitle}>{item.nume}</Text>
                <Text style={styles.cardMeta}>
                  {item.localitate}, {item.judet}
                </Text>
                <Text style={styles.cardMeta}>Hram: {item.hram}</Text>
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
              </Pressable>
            </Link>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.parchment },
  content: { padding: spacing.md, gap: spacing.sm },
  heading: { fontFamily: fonts.display, fontSize: 28, color: colors.ink },
  search: {
    backgroundColor: colors.surface,
    padding: 13,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    fontFamily: fonts.body,
    color: colors.inkMuted
  },
  error: { fontFamily: fonts.body, color: colors.sundayRed },
  emptyText: { fontFamily: fonts.body, color: colors.inkMuted, marginTop: spacing.sm },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderAlt
  },
  cardTitle: { fontFamily: fonts.display, fontSize: 18, color: colors.ink },
  cardMeta: { fontFamily: fonts.body, color: colors.inkMuted, marginTop: 4 },
  followRow: { marginTop: 10, minHeight: 28 },
  followText: { fontFamily: fonts.bodyBold, color: colors.crimson },
  followTextActive: { color: "#067647" }
});
