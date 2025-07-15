import { useRouter } from "expo-router";
import React from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAppSelector } from "./redux/hooks";

export default function Intro() {
  const router = useRouter();
  const { loading } = useAppSelector((state) => state.auth);

  // Show loading or don't render anything while checking auth state
  if (loading) {
    return null; // or a loading spinner
  }

  return (
    <ImageBackground
      source={require("./assets/images/backgroundMb.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.topSection}>
          <Text style={styles.title}>Growing Together</Text>
          <Text style={styles.subtitle}>
            Cherish every moment and milestone, and stay updated on your
            child&apos;s development journey.
          </Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/register")}
          >
            <Text style={styles.buttonText}>Create Account</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.secondaryButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.bottomSection}>
          <Text style={styles.sectionTitle}>About Growing Together</Text>
          <Text style={styles.description}>
            Growing Together is an app designed for parents to record, track,
            and engage with their child&apos;s growth. Reminisce over joyful
            memories, monitor health progress, ask thought-provoking questions,
            and set timely reminders. Our platform ensures a nurturing and
            connected parenting journey.
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  topSection: {
    marginTop: 80,
    marginBottom: 32,
    alignItems: "center",
  },
  title: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    textShadowColor: "#000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 8,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 20,
    color: "#fff",
    textAlign: "center",
    marginBottom: 32,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  buttonContainer: {
    marginBottom: 40,
    gap: 16,
  },
  button: {
    backgroundColor: "#2176FF",
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 48,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 48,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  secondaryButtonText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  bottomSection: {
    alignItems: "center",
    marginTop: 16,
    paddingHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
    textAlign: "center",
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  description: {
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
    lineHeight: 26,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
}); 