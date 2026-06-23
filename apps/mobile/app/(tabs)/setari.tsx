import { SafeAreaView, Switch, Text, View } from "react-native";

export default function SetariScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f7f8", padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 12 }}>Setări</Text>
      <View style={{ backgroundColor: "#fff", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#e3e8f2", gap: 12 }}>
        <Text style={{ fontWeight: "600" }}>Notificări generale</Text>
        <Switch value />
        <Text style={{ color: "#576074" }}>Parohiile mele și toggles individuale vor fi adăugate în pasul de auth + urmăriri.</Text>
      </View>
    </SafeAreaView>
  );
}
