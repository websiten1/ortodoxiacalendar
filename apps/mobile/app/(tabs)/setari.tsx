import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Pressable, SafeAreaView, ScrollView, Switch, Text, View } from "react-native";
import { useAuth } from "../../lib/auth-context";
import { getFollowedParishes, setFollowNotifications, unfollow } from "../../lib/parishes";

type FollowedRow = {
  parohie_id: string;
  notificari_activate: boolean;
  parohii: { id: string; nume: string; localitate: string; judet: string } | null;
};

export default function SetariScreen() {
  const { session, requireAuth, signOut } = useAuth();
  const [followed, setFollowed] = useState<FollowedRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [generalEnabled, setGeneralEnabled] = useState(true);

  const load = useCallback(async () => {
    if (!session?.user.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const rows = (await getFollowedParishes(session.user.id)) as unknown as FollowedRow[];
    setFollowed(rows);
    setGeneralEnabled(rows.some((row) => row.notificari_activate) || rows.length === 0);
    setLoading(false);
  }, [session?.user.id]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  async function toggleParishNotifications(parishId: string, enabled: boolean) {
    if (!session?.user.id) return;
    await setFollowNotifications(session.user.id, parishId, enabled);
    setFollowed((prev) =>
      prev.map((row) => (row.parohie_id === parishId ? { ...row, notificari_activate: enabled } : row))
    );
  }

  async function handleUnfollow(parishId: string) {
    if (!session?.user.id) return;
    await unfollow(session.user.id, parishId);
    setFollowed((prev) => prev.filter((row) => row.parohie_id !== parishId));
  }

  async function toggleGeneral(value: boolean) {
    if (!session?.user.id) return;
    setGeneralEnabled(value);
    await Promise.all(
      followed.map((row) => setFollowNotifications(session.user.id, row.parohie_id, value))
    );
    setFollowed((prev) => prev.map((row) => ({ ...row, notificari_activate: value })));
  }

  function handleLogout() {
    Alert.alert("Delogare", "Sigur vrei să te delogezi? Parohiile urmărite rămân salvate pe acest cont.", [
      { text: "Anulează", style: "cancel" },
      { text: "Delogare", style: "destructive", onPress: () => void signOut() }
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f7f8" }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: "700" }}>Setări</Text>

        {!session ? (
          <View style={{ backgroundColor: "#fff", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#e3e8f2", gap: 10 }}>
            <Text style={{ color: "#576074" }}>Autentifică-te pentru a-ți gestiona parohiile urmărite.</Text>
            <Pressable
              style={{ backgroundColor: "#1f6feb", borderRadius: 10, paddingVertical: 12, alignItems: "center" }}
              onPress={() => requireAuth(() => load())}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Autentifică-te</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={{ backgroundColor: "#fff", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#e3e8f2", gap: 12 }}>
              <Text style={{ fontWeight: "700" }}>Parohiile mele</Text>
              {loading ? <ActivityIndicator /> : null}
              {!loading && followed.length === 0 ? (
                <Text style={{ color: "#8a93a6" }}>Nu urmărești încă nicio parohie.</Text>
              ) : null}
              {followed.map((row) => (
                <View key={row.parohie_id} style={{ gap: 6 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={{ fontWeight: "600" }}>{row.parohii?.nume}</Text>
                    <Switch
                      value={row.notificari_activate}
                      onValueChange={(value) => toggleParishNotifications(row.parohie_id, value)}
                    />
                  </View>
                  <Pressable onPress={() => handleUnfollow(row.parohie_id)}>
                    <Text style={{ color: "#b42318" }}>Nu mai urmări</Text>
                  </Pressable>
                </View>
              ))}
            </View>

            <View style={{ backgroundColor: "#fff", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#e3e8f2", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontWeight: "700" }}>Notificări (toate parohiile)</Text>
              <Switch value={generalEnabled} onValueChange={toggleGeneral} />
            </View>
          </>
        )}

        <View style={{ backgroundColor: "#fff", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#e3e8f2", gap: 6 }}>
          <Text style={{ fontWeight: "700" }}>Despre</Text>
          <Text style={{ color: "#576074" }}>Parohia Mea v0.1.0</Text>
        </View>

        {session ? (
          <Pressable
            style={{ backgroundColor: "#eceff4", borderRadius: 10, paddingVertical: 12, alignItems: "center" }}
            onPress={handleLogout}
          >
            <Text style={{ color: "#1a2233", fontWeight: "700" }}>Delogare</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
