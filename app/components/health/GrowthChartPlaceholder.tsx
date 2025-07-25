import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/Colors";

interface GrowthChartPlaceholderProps {
  type: "height" | "weight";
  loading?: boolean;
}

const GrowthChartPlaceholder: React.FC<GrowthChartPlaceholderProps> = ({
  type,
  loading = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.chartPlaceholder}>
        <MaterialIcons
          name={loading ? "refresh" : (type === "height" ? "trending-up" : "fitness-center")}
          size={48}
          color={Colors.light.textSecondary}
        />
        <Text style={styles.placeholderText}>
          {loading 
            ? "Loading growth chart..." 
            : `No ${type} data available`
          }
        </Text>
        {!loading && (
          <Text style={styles.placeholderSubtext}>
            Add your first {type} measurement to see the chart
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartPlaceholder: {
    height: 300,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.light.textSecondary,
    marginTop: 8,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: "center",
    marginTop: 4,
  },
});

export default GrowthChartPlaceholder; 