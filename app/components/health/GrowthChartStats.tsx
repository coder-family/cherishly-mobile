import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/Colors";

interface GrowthChartStatsProps {
  type: "height" | "weight";
  userChartData: Array<{
    value: number;
    ageInMonths: number;
    date: string;
  }>;
  selectedMode: "yearly" | "half-yearly";
}

const GrowthChartStats: React.FC<GrowthChartStatsProps> = ({
  type,
  userChartData,
  selectedMode,
}) => {
  return (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>Latest {type}</Text>
        <Text style={styles.statValue}>
          {userChartData[userChartData.length - 1]?.value.toFixed(1) || "0"}{" "}
          {type === "weight" ? "kg" : "cm"}
        </Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>Measurements</Text>
        <Text style={styles.statValue}>{userChartData.length}</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>Display Mode</Text>
        <Text style={styles.statValue}>{selectedMode}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.light.card,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: 4,
    textAlign: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.light.text,
    textAlign: "center",
  },
});

export default GrowthChartStats; 