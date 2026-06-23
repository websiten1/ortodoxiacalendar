import { Link } from "expo-router";
import { Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from "react-native";

const demoParohii = [
  { id: "1", nume: "Parohia Sfântul Nicolae", localitate: "București", judet: "București" },
  { id: "2", nume: "Parohia Sfântul Gheorghe", localitate: "Iași", judet: "Iași" }
];

export default function DescoperaScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f7f8" }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <Text style={{ fontSize: 24, fontWeight: "700" }}>Descoperă</Text>
        <TextInput
          placeholder="Caută o parohie (nume, oraș, județ)"
          style={{ backgroundColor: "#fff", padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#d5dbe7" }}
        />

        {demoParohii.map((item) => (
          <Link href={`/parohie/${item.id}`} asChild key={item.id}>
            <Pressable style={{ backgroundColor: "#fff", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#e3e8f2" }}>
              <Text style={{ fontSize: 16, fontWeight: "700" }}>{item.nume}</Text>
              <Text style={{ color: "#576074", marginTop: 4 }}>
                {item.localitate}, {item.judet}
              </Text>
              <View style={{ marginTop: 10 }}>
                <Text style={{ color: "#1f6feb", fontWeight: "600" }}>Urmărește</Text>
              </View>
            </Pressable>
          </Link>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
