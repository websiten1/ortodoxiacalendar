import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useAuth } from "../../lib/auth-context";
import { getFollowedParishes, setFollowNotifications, unfollow } from "../../lib/parishes";
import { colors, fonts, radii, spacing } from "../../lib/theme";

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
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Setări</Text>

        {!session ? (
          <View style={styles.card}>
            <Text style={styles.body}>Autentifică-te pentru a-ți gestiona parohiile urmărite.</Text>
            <Pressable style={styles.primaryButton} onPress={() => requireAuth(() => load())}>
              <Text style={styles.primaryButtonText}>Autentifică-te</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Parohiile mele</Text>
              {loading ? <ActivityIndicator color={colors.crimson} /> : null}
              {!loading && followed.length === 0 ? (
                <Text style={styles.muted}>Nu urmărești încă nicio parohie.</Text>
              ) : null}
              {followed.map((row) => (
                <View key={row.parohie_id} style={{ gap: 6 }}>
                  <View style={styles.parishRow}>
                    <Text style={styles.parishName}>{row.parohii?.nume}</Text>
                    <Switch
                      value={row.notificari_activate}
                      onValueChange={(value) => toggleParishNotifications(row.parohie_id, value)}
                      trackColor={{ false: colors.border, true: colors.crimson }}
                      thumbColor={colors.surface}
                    />
                  </View>
                  <Pressable onPress={() => handleUnfollow(row.parohie_id)}>
                    <Text style={styles.unfollowText}>Nu mai urmări</Text>
                  </Pressable>
                </View>
              ))}
            </View>

            <View style={[styles.card, styles.rowCard]}>
              <Text style={styles.cardLabel}>Notificări (toate parohiile)</Text>
              <Switch
                value={generalEnabled}
                onValueChange={toggleGeneral}
                trackColor={{ false: colors.border, true: colors.crimson }}
                thumbColor={colors.surface}
              />
            </View>
          </>
        )}

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Despre</Text>
          <Text style={styles.muted}>Parohia Mea v0.1.0</Text>
        </View>

        {session ? (
          <Pressable style={styles.secondaryButton} onPress={handleLogout}>
            <Text style={styles.secondaryButtonText}>Delogare</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.parchment },
  content: { padding: spacing.md, gap: spacing.md },
  heading: { fontFamily: fonts.display, fontSize: 28, color: colors.ink },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderAlt,
    gap: spacing.sm
  },
  rowCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardLabel: { fontFamily: fonts.bodyBold, color: colors.ink, fontSize: 15 },
  body: { fontFamily: fonts.body, color: colors.inkMuted },
  muted: { fontFamily: fonts.body, color: colors.inkFaint },
  parishRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  parishName: { fontFamily: fonts.bodySemiBold, color: colors.ink },
  unfollowText: { fontFamily: fonts.body, color: colors.sundayRed },
  primaryButton: {
    backgroundColor: colors.crimson,
    borderRadius: radii.md,
    paddingVertical: 12,
    alignItems: "center"
  },
  primaryButtonText: { fontFamily: fonts.bodyBold, color: colors.crimsonTextOn },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingVertical: 12,
    alignItems: "center"
  },
  secondaryButtonText: { fontFamily: fonts.bodyBold, color: colors.crimson }
});
