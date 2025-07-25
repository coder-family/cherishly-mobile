import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/Colors";

interface GrowthChartLegendProps {
  whoDataAvailable: boolean;
  userDataAvailable: boolean;
  selectedMode: "yearly" | "half-yearly";
}

const GrowthChartLegend: React.FC<GrowthChartLegendProps> = ({
  whoDataAvailable,
  userDataAvailable,
  selectedMode,
}) => {
  return (
    <View style={styles.legendContainer}>
      <Text style={styles.legendTitle}>Chart Legend</Text>
      <View style={styles.legendItems}>
        {whoDataAvailable && (
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendLine,
                { backgroundColor: "rgb(0, 128, 0)" },
              ]}
            />
            <Text style={styles.legendText}>
              🟢 WHO Standard (Average growth)
            </Text>
          </View>
        )}
        {userDataAvailable && (
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendLine,
                { backgroundColor: "rgb(255, 0, 0)" },
              ]}
            />
            <Text style={styles.legendText}>
              🔴 Your child&apos;s measurements
            </Text>
          </View>
        )}
        {!whoDataAvailable && !userDataAvailable && (
          <Text style={styles.legendText}>No data available</Text>
        )}
      </View>
      {/* <Text style={styles.legendNote}>
        {!whoDataAvailable
          ? "⚠️ WHO standards not available - showing child data only. Please check your backend API for WHO standards data."
          : `🟢 WHO Standard: Complete green line (0-10 years, ${selectedMode} intervals). 🔴 Your child: Red dots and lines only where measurements exist. No connections across missing data periods.`}
      </Text> */}
    </View>
  );
};

const styles = StyleSheet.create({
  legendContainer: {
    marginBottom: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.light.card,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 12,
  },
  legendItems: {
    gap: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  legendLine: {
    width: 20,
    height: 3,
    borderRadius: 2,
    marginRight: 12,
  },
  legendText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  legendNote: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
  },
});

export default GrowthChartLegend; 