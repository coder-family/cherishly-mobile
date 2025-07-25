import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Colors } from "../../constants/Colors";
import { useChartData } from "../../hooks/useChartData";
import { useWHOStandards } from "../../hooks/useWHOStandards";
import { GrowthRecord } from "../../types/health";
import GrowthChartDisplay from "./GrowthChartDisplay";
import GrowthChartHeader from "./GrowthChartHeader";
import GrowthChartLegend from "./GrowthChartLegend";
import GrowthChartPlaceholder from "./GrowthChartPlaceholder";
import GrowthChartStats from "./GrowthChartStats";

interface GrowthChartProps {
  data: GrowthRecord[];
  type: "height" | "weight";
  childAgeInMonths?: number;
  childGender?: "male" | "female";
  childBirthDate?: string;
  mode?: "yearly" | "half-yearly";
}

const GrowthChart: React.FC<GrowthChartProps> = ({
  data,
  type,
  childAgeInMonths = 0,
  childGender = "male",
  childBirthDate,
  mode = "yearly",
}) => {
  const [selectedMode, setSelectedMode] = useState<"yearly" | "half-yearly">(mode);

  // Custom hooks for data processing
  const { whoStandards, loading } = useWHOStandards(childGender, type);
  const { userChartData, whoChartData, chartData } = useChartData(
    data,
    type,
    childAgeInMonths,
    childBirthDate,
    whoStandards,
    selectedMode
  );

  // Early return for empty data
  if (userChartData.length === 0 && !loading) {
    return <GrowthChartPlaceholder type={type} />;
  }

  // Show loading state
  if (loading) {
    return <GrowthChartPlaceholder type={type} loading={true} />;
  }

  // Show warning if WHO data is not available
  const whoDataUnavailable = whoStandards.length === 0 && !loading;

  return (
    <View style={styles.container}>
      <GrowthChartHeader
        type={type}
        selectedMode={selectedMode}
        whoDataUnavailable={whoDataUnavailable}
        onModeChange={setSelectedMode}
      />

      <GrowthChartDisplay
        chartData={chartData}
        type={type}
        selectedMode={selectedMode}
      />

      <GrowthChartLegend
        whoDataAvailable={whoChartData.mean.length > 0}
        userDataAvailable={userChartData.length > 0}
        selectedMode={selectedMode}
      />

      <GrowthChartStats
        type={type}
        userChartData={userChartData}
        selectedMode={selectedMode}
      />
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
});

export default GrowthChart;
