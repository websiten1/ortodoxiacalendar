import { useCallback, useEffect, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  Text,
  View
} from "react-native";
import { useAuth } from "../../lib/auth-context";
import { CalendarDay, getCombinedCalendar, getFollowedParishesForCalendar } from "../../lib/calendar";

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
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f7f8", padding: 16, justifyContent: "center", gap: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: "700", textAlign: "center" }}>
          Autentifică-te ca să vezi calendarul tău
        </Text>
        <Pressable
          style={{ backgroundColor: "#1f6feb", borderRadius: 10, paddingVertical: 14, alignItems: "center" }}
          onPress={() => requireAuth(() => loadInitial())}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Autentifică-te</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (followed.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f7f8", padding: 16, justifyContent: "center", gap: 12 }}>
        <Text style={{ textAlign: "center", color: "#3c4456" }}>
          Nu urmărești încă nicio parohie. Caută una în tab-ul Descoperă.
        </Text>
        <Pressable
          style={{ backgroundColor: "#1f6feb", borderRadius: 10, paddingVertical: 14, alignItems: "center" }}
          onPress={() => router.push("/(tabs)")}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Descoperă parohii</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f7f8" }}>
      <View style={{ padding: 16, paddingBottom: 0, gap: 10 }}>
        <Text style={{ fontSize: 24, fontWeight: "700" }}>Calendarul meu</Text>
        {error ? <Text style={{ color: "#b42318" }}>{error}</Text> : null}
        {followed.length > 1 ? (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            <Pressable
              onPress={() => setFilterParishId(undefined)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
                backgroundColor: !filterParishId ? "#1f6feb" : "#eceff4"
              }}
            >
              <Text style={{ color: !filterParishId ? "#fff" : "#1a2233", fontWeight: "600" }}>Toate</Text>
            </Pressable>
            {followed.map((parish) => (
              <Pressable
                key={parish.id}
                onPress={() => setFilterParishId(parish.id)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                  backgroundColor: filterParishId === parish.id ? "#1f6feb" : "#eceff4"
                }}
              >
                <Text style={{ color: filterParishId === parish.id ? "#fff" : "#1a2233", fontWeight: "600" }}>
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
        contentContainerStyle={{ padding: 16, gap: 12 }}
        onEndReachedThreshold={0.4}
        onEndReached={loadMore}
        ListFooterComponent={loadingMore ? <ActivityIndicator style={{ marginTop: 12 }} /> : null}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontWeight: "700", marginBottom: 6, textTransform: "capitalize" }}>
              {formatDayLabel(item.data)}
            </Text>
            {item.items.length === 0 ? null : (
              <View style={{ backgroundColor: "#fff", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#e3e8f2", gap: 8 }}>
                {item.items.map((calItem, index) => (
                  <View key={index} style={{ flexDirection: "row", gap: 8, alignItems: "flex-start" }}>
                    <Text>{calItem.sursa === "global" ? "✝️" : "📌"}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: calItem.sursa === "global" ? "#3c4456" : "#1f6feb" }}>
                        {calItem.titlu}
                      </Text>
                      {calItem.parohieNume ? (
                        <Text style={{ color: "#8a93a6", fontSize: 12 }}>
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
