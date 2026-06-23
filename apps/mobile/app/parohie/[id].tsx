import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Linking, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { useAuth } from "../../lib/auth-context";
import {
  getParish,
  getProgramRecurent,
  getUpcomingEvents,
  isFollowing,
  Parish,
  follow,
  unfollow
} from "../../lib/parishes";
import { registerPushToken } from "../../lib/push";

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
      <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (error || !parish) {
    return (
      <SafeAreaView style={{ flex: 1, padding: 16 }}>
        <Text style={{ color: "#b42318" }}>{error || "Parohia nu a fost găsită."}</Text>
      </SafeAreaView>
    );
  }

  const groupedProgram = Object.entries(weekdayLabels).map(([key, label]) => ({
    key,
    label,
    entries: program.filter((p) => p.zi_saptamana === key)
  }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f7f8" }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <View style={{ backgroundColor: "#fff", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#e3e8f2", gap: 6 }}>
          <Text style={{ fontSize: 22, fontWeight: "700" }}>{parish.nume}</Text>
          <Text style={{ color: "#576074" }}>
            Hram: {parish.hram}
            {parish.data_hram ? ` (${parish.data_hram})` : ""}
          </Text>
          <Pressable
            onPress={handleToggleFollow}
            style={{
              marginTop: 10,
              alignSelf: "flex-start",
              backgroundColor: following ? "#eefbf2" : "#1f6feb",
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 10
            }}
          >
            <Text style={{ color: following ? "#067647" : "#fff", fontWeight: "700" }}>
              {following ? "Urmărit ✓ · Nu mai urmări" : "Urmărește"}
            </Text>
          </Pressable>
        </View>

        <View style={{ backgroundColor: "#fff", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#e3e8f2", gap: 8 }}>
          <Text style={{ fontWeight: "700" }}>Adresă</Text>
          <Text>{parish.adresa}, {parish.localitate}, {parish.judet}</Text>
          <Pressable onPress={openInMaps}>
            <Text style={{ color: "#1f6feb", fontWeight: "600" }}>Deschide în Maps</Text>
          </Pressable>
        </View>

        <View style={{ backgroundColor: "#fff", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#e3e8f2", gap: 8 }}>
          <Text style={{ fontWeight: "700" }}>Contact</Text>
          {parish.contact_telefon_public ? (
            <Pressable onPress={() => Linking.openURL(`tel:${parish.contact_telefon_public}`)}>
              <Text style={{ color: "#1f6feb" }}>{parish.contact_telefon_public}</Text>
            </Pressable>
          ) : null}
          {parish.contact_email_public ? (
            <Pressable onPress={() => Linking.openURL(`mailto:${parish.contact_email_public}`)}>
              <Text style={{ color: "#1f6feb" }}>{parish.contact_email_public}</Text>
            </Pressable>
          ) : null}
          {!parish.contact_telefon_public && !parish.contact_email_public ? (
            <Text style={{ color: "#8a93a6" }}>Niciun contact public adăugat.</Text>
          ) : null}
        </View>

        <View style={{ backgroundColor: "#fff", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#e3e8f2", gap: 10 }}>
          <Text style={{ fontWeight: "700" }}>Programul săptămânal</Text>
          {groupedProgram.map((group) =>
            group.entries.length > 0 ? (
              <View key={group.key}>
                <Text style={{ fontWeight: "600", marginTop: 6 }}>{group.label}</Text>
                {group.entries.map((entry) => (
                  <Text key={entry.id} style={{ color: "#576074" }}>
                    {entry.titlu} — {entry.ora.slice(0, 5)}
                  </Text>
                ))}
              </View>
            ) : null
          )}
          {program.length === 0 ? <Text style={{ color: "#8a93a6" }}>Niciun program recurent adăugat.</Text> : null}
        </View>

        <View style={{ backgroundColor: "#fff", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#e3e8f2", gap: 8 }}>
          <Text style={{ fontWeight: "700" }}>Evenimente viitoare</Text>
          {events.length === 0 ? <Text style={{ color: "#8a93a6" }}>Niciun eveniment programat.</Text> : null}
          {events.map((event) => (
            <Text key={event.id} style={{ color: "#576074" }}>
              {event.data}
              {event.ora ? ` • ${event.ora.slice(0, 5)}` : ""} — {event.titlu}
            </Text>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
