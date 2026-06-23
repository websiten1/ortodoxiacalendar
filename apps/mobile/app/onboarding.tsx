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
import { colors, fonts, radii, shadows, spacing } from "../lib/theme";

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
            <View style={styles.divider} />
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
    backgroundColor: colors.parchment
  },
  slide: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.md
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 40,
    color: colors.crimson
  },
  divider: {
    width: 36,
    height: 1,
    backgroundColor: colors.gold
  },
  subtitle: {
    fontFamily: fonts.reading,
    fontSize: 19,
    textAlign: "center",
    color: colors.ink,
    lineHeight: 26
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: spacing.md
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border
  },
  dotActive: {
    backgroundColor: colors.crimson,
    width: 20
  },
  button: {
    backgroundColor: colors.crimson,
    borderRadius: radii.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    paddingVertical: 16,
    alignItems: "center",
    ...shadows.actionGlow
  },
  buttonText: {
    fontFamily: fonts.bodyBold,
    color: colors.crimsonTextOn,
    fontSize: 16
  }
});
