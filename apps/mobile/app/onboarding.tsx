import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";

const { width } = Dimensions.get("window");

const slides = [
  { title: "Găsește parohia ta și urmărește-o" },
  { title: "Vezi calendarul liturgic și programul parohiei tale" },
  { title: "Primește notificări pentru evenimente — nu mai rata nimic" }
];

export const ONBOARDING_KEY = "parohia-mea:onboarding-complete";

export default function OnboardingScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setIndex(nextIndex);
  }

  async function finish() {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    router.replace("/(tabs)");
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {slides.map((slide) => (
          <View key={slide.title} style={[styles.slide, { width }]}>
            <Text style={styles.title}>Parohia Mea</Text>
            <Text style={styles.subtitle}>{slide.title}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dots}>
        {slides.map((slide, slideIndex) => (
          <View key={slide.title} style={[styles.dot, slideIndex === index ? styles.dotActive : null]} />
        ))}
      </View>

      <Pressable style={styles.button} onPress={finish}>
        <Text style={styles.buttonText}>Începe</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  slide: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 16
  },
  title: {
    fontSize: 28,
    fontWeight: "700"
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    color: "#3c4456"
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#d5dbe7"
  },
  dotActive: {
    backgroundColor: "#1f6feb",
    width: 20
  },
  button: {
    backgroundColor: "#1f6feb",
    borderRadius: 12,
    marginHorizontal: 24,
    marginBottom: 32,
    paddingVertical: 16,
    alignItems: "center"
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16
  }
});
