import React from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Colors } from "../../constants/Colors";

const { width } = Dimensions.get("window");

interface GrowthChartDisplayProps {
  chartData: {
    labels: string[];
    datasets: {
      data: number[];
      color: (opacity?: number) => string;
      strokeWidth: number;
      withDots?: boolean;
    }[];
  };
  type: "height" | "weight";
  selectedMode: "yearly" | "half-yearly";
}

const GrowthChartDisplay: React.FC<GrowthChartDisplayProps> = ({
  chartData,
  type,
  selectedMode,
}) => {
  // Calculate dynamic chart width based on filtered data length
  const chartWidth = Math.max(width - 60, chartData.labels.length * 40);

  // Chart configuration
  const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0, // No decimal places for cleaner axis labels
    color: (opacity = 1) => `rgba(100, 100, 100, ${opacity})`, // Default gray (should be overridden by dataset colors)
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "3", // Smaller dots for cleaner look
      strokeWidth: "2",
      stroke: "#ffffff",
    },
    propsForBackgroundLines: {
      strokeDasharray: "",
      stroke: "#e5e7eb", // Lighter grid lines
      strokeWidth: 1,
    },
    // Set appropriate number of horizontal grid lines
    segments: type === "weight" ? 5 : 8, // Weight: 5 segments (0-50); Height: 8 segments
    yAxisSuffix: "", // We'll add units in the axis title instead
    propsForLabels: {
      fontSize: 11,
    },
    // Let react-native-chart-kit handle the Y-axis naturally based on data range
    useShadowColorFromDataset: false,
    // Disable bezier curves and interpolation to show only actual data points
    bezier: false,
    withDots: true, // Ensure dots are visible for each data point
    withInnerLines: true, // Show grid lines
    withOuterLines: true, // Show outer boundary lines
    // Handle negative values properly - don't connect them or show dots
    connectNulls: false,
    // Set minimum Y value to hide negative values used for missing data
    yAxisMin: type === "weight" ? 0 : 50,
    // Set maximum Y value to ensure proper scaling
    yAxisMax: type === "weight" ? 50 : 160,
  };

  return (
    <View style={styles.chartWithLabelsContainer}>
      <Text style={styles.yAxisTitle}>
        {type === "height" ? "Height (cm)" : "Weight (kg)"}
      </Text>

      {/* Scrollable Line Chart */}
      <View style={styles.chartContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <LineChart
            data={chartData}
            width={chartWidth}
            height={300}
            chartConfig={chartConfig}
            bezier={false}
            style={styles.chart}
            withDots={true}
            withShadow={false}
            withScrollableDot={false}
            withVerticalLabels={true}
            withHorizontalLabels={true}
            fromZero={true}
            yAxisInterval={1}
            segments={type === "weight" ? 5 : 8}
            hidePointsAtIndex={[]}
          />
        </ScrollView>
      </View>

      <Text style={styles.xAxisTitle}>
        Age (years: 0-10, {selectedMode} intervals)
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chartWithLabelsContainer: {
    marginBottom: 20,
  },
  yAxisTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.text,
    textAlign: "center",
    marginBottom: 10,
  },
  xAxisTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.text,
    textAlign: "center",
    marginTop: 10,
  },
  chartContainer: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  chart: {
    borderRadius: 16,
  },
});

export default GrowthChartDisplay; 