import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/Colors";

interface GrowthChartHeaderProps {
  type: "height" | "weight";
  selectedMode: "yearly" | "half-yearly";
  whoDataUnavailable: boolean;
  onModeChange: (mode: "yearly" | "half-yearly") => void;
}

const GrowthChartHeader: React.FC<GrowthChartHeaderProps> = ({
  type,
  selectedMode,
  whoDataUnavailable,
  onModeChange,
}) => {
  return (
    <View style={styles.chartHeader}>
      <MaterialIcons
        name={type === "height" ? "trending-up" : "fitness-center"}
        size={24}
        color={Colors.light.primary}
      />
      <Text style={styles.chartTitle}>
        {type === "height" ? "Height" : "Weight"} Growth Chart
      </Text>
      <Text style={styles.chartSubtitle}>
        {whoDataUnavailable 
          ? `Age 0-10 years - WHO standards unavailable (${selectedMode} intervals)`
          : `Age 0-10 years with WHO growth standards (${selectedMode} intervals)`
        }
      </Text>
      <View style={styles.modeSelection}>
        <TouchableOpacity
          style={[
            styles.modeButton,
            selectedMode === "yearly" && styles.selectedModeButton,
          ]}
          onPress={() => onModeChange("yearly")}
        >
          <Text
            style={[
              styles.modeButtonText,
              selectedMode === "yearly" && styles.selectedModeText,
            ]}
          >
            Yearly
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.modeButton,
            selectedMode === "half-yearly" && styles.selectedModeButton,
          ]}
          onPress={() => onModeChange("half-yearly")}
        >
          <Text
            style={[
              styles.modeButtonText,
              selectedMode === "half-yearly" && styles.selectedModeText,
            ]}
          >
            Half-Yearly
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chartHeader: {
    marginBottom: 20,
    alignItems: "center",
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.light.text,
    marginTop: 8,
    textAlign: "center",
  },
  chartSubtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 4,
    textAlign: "center",
  },
  modeSelection: {
    flexDirection: "row",
    marginTop: 10,
    backgroundColor: Colors.light.card,
    borderRadius: 10,
    padding: 5,
    borderWidth: 1,
    borderColor: Colors.light.card,
  },
  modeButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  selectedModeButton: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
    borderWidth: 1,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.textSecondary,
  },
  selectedModeText: {
    color: Colors.light.background,
  },
});

export default GrowthChartHeader; 