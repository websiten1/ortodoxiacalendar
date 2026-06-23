import { SafeAreaView, Text, View } from "react-native";

export default function CalendarulMeuScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f7f8", padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 12 }}>Calendarul meu</Text>
      <View style={{ backgroundColor: "#fff", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#e3e8f2" }}>
        <Text>Nu urmărești încă nicio parohie.</Text>
        <Text style={{ marginTop: 8, color: "#4e5970" }}>Caută una în tab-ul Descoperă.</Text>
      </View>
    </SafeAreaView>
  );
}
