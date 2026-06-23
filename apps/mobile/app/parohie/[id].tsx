import { useLocalSearchParams } from "expo-router";
import { SafeAreaView, Text, View } from "react-native";

export default function ProfilParohieScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f7f8", padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 12 }}>Profil parohie</Text>
      <View style={{ backgroundColor: "#fff", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#e3e8f2", gap: 8 }}>
        <Text style={{ color: "#576074" }}>Parohie ID: {id}</Text>
        <Text>Nume parohie</Text>
        <Text>Adresă + contact + program + evenimente viitoare</Text>
        <Text style={{ marginTop: 6, color: "#1f6feb", fontWeight: "600" }}>Urmărește</Text>
      </View>
    </SafeAreaView>
  );
}
