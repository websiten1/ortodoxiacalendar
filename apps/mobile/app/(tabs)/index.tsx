import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View
} from "react-native";
import { useAuth } from "../../lib/auth-context";
import { follow, isFollowing, Parish, searchParishes, unfollow } from "../../lib/parishes";
import { registerPushToken } from "../../lib/push";
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f7f8" }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <Text style={{ fontSize: 24, fontWeight: "700" }}>Descoperă</Text>
        <TextInput
          placeholder="Caută o parohie (nume, oraș, județ)"
          value={query}
          onChangeText={setQuery}
          style={{ backgroundColor: "#fff", padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#d5dbe7" }}
        />

        {loading ? <ActivityIndicator style={{ marginTop: 12 }} /> : null}
        {error ? <Text style={{ color: "#b42318" }}>{error}</Text> : null}

        {!loading && parishes.length === 0 ? (
          <Text style={{ color: "#576074", marginTop: 12 }}>
            Nu am găsit parohii pentru căutarea ta. Încearcă alt nume sau altă localitate.
          </Text>
        ) : null}

        {parishes.map((item) => {
          const following = followedIds.has(item.id);
          return (
            <Link href={`/parohie/${item.id}`} asChild key={item.id}>
              <Pressable style={{ backgroundColor: "#fff", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#e3e8f2" }}>
                <Text style={{ fontSize: 16, fontWeight: "700" }}>{item.nume}</Text>
                <Text style={{ color: "#576074", marginTop: 4 }}>
                  {item.localitate}, {item.judet}
                </Text>
                <Text style={{ color: "#576074", marginTop: 2 }}>Hram: {item.hram}</Text>
                <View style={{ marginTop: 10 }}>
                  <Pressable
                    onPress={(event) => {
                      event.stopPropagation();
                      void handleToggleFollow(item);
                    }}
                  >
                    <Text style={{ color: following ? "#067647" : "#1f6feb", fontWeight: "600" }}>
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
