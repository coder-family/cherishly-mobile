import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Colors } from "../../constants/Colors";
import * as healthService from "../../services/healthService";
import { GrowthRecord, WHOStandardGrowthData } from "../../types/health";

const { width } = Dimensions.get("window");

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
  const [whoStandards, setWhoStandards] = useState<WHOStandardGrowthData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMode, setSelectedMode] = useState<"yearly" | "half-yearly">(mode);

  // Debug logging for props
  console.log(`[CHART-PROPS] Chart initialized with:`, {
    type,
    mode: selectedMode,
    dataLength: data.length,
    childAgeInMonths,
    childGender,
    childBirthDate,
    firstDataPoint: data[0]
      ? { date: data[0].date, value: data[0].value, type: data[0].type }
      : "none",
  });

  // Fetch WHO standards data for 0-10 years (120 months)
  useEffect(() => {
    const fetchWHOStandards = async () => {
      console.log(`[WHO-DATA] 🚀 Starting WHO data fetch for ${childGender} ${type}`);
      try {
        setLoading(true);

        // Try primary API
        let standards = await healthService.getWHOStandardsInRange(
          childGender || "male",
          0, // Start from birth
          120 // Up to 10 years
        );
        
        console.log(`[WHO-DATA] API returned ${standards.length} standards`);
        
        // Check if this is mock data
        if (standards.length > 0) {
          const firstItem = standards[0];
          if (firstItem.id && firstItem.id.includes('mock')) {
            console.log(`[WHO-DATA] 🚨 Using MOCK DATA`);
          } else {
            console.log(`[WHO-DATA] ✅ Using REAL SERVER DATA`);
          }
          
          // Check the 10-year-old data specifically
          const tenYearData = standards.find(s => s.ageInMonths === 120);
          if (tenYearData) {
            console.log(`[WHO-DATA] 10-YEAR: Weight=${tenYearData.weight.mean}kg`);
          }
        }

        // Check if primary API returned too many points
        if (standards.length > 11) {
          console.log(`[WHO-DATA] Filtering ${standards.length} points to yearly intervals`);
          const yearlyStandards = standards.filter(
            (s) => s.ageInMonths % 12 === 0
          );
          standards = yearlyStandards;
        }

        // If primary API returns empty, try fallback
        if (standards.length === 0) {
          console.log("[WHO-DATA] Primary API empty, trying fallback...");
          standards = await healthService.getAllWHOStandardData(
            childGender || "male"
          );
          standards = standards.filter((s) => s.ageInMonths <= 120);
          console.log(`[WHO-DATA] Fallback returned ${standards.length} standards`);
          
          // Check if fallback API returned too many points
          if (standards.length > 11) {
            const yearlyStandards = standards.filter(
              (s) => s.ageInMonths % 12 === 0
            );
            standards = yearlyStandards;
          }
        }

        // Final validation: ensure we have exactly 11 yearly data points
        if (standards.length > 11) {
          standards = standards.filter((s) => s.ageInMonths % 12 === 0);
        }

        // Set the final WHO standards
        console.log(`[WHO-DATA] ✅ Setting ${standards.length} WHO standards`);
        setWhoStandards(standards);
      } catch (error) {
        console.warn(
          "Network error fetching WHO standards, falling back to health service hardcoded data:",
          error
        );
        // If there's a network error, set empty WHO standards
        console.error(
          "[WHO-DATA] 🚨 CRITICAL ERROR: WHO standards API failed!",
          error
        );
        setWhoStandards([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWHOStandards();
  }, [childGender, type]);

  // Process user data
  const userChartData = useMemo(() => {
    const filteredData = data.filter((record) => record.type === type);
    console.log(
      `[USER-DATA] Found ${filteredData.length} user ${type} records`
    );

    const result = filteredData
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((record) => {
        // const recordDate = new Date(record.date);

        let ageInMonths: number;

        if (childBirthDate) {
          const birthDate = new Date(childBirthDate);
          const recordDateObj = new Date(record.date);

          // Calculate exact age in months more accurately
          let years = recordDateObj.getFullYear() - birthDate.getFullYear();
          let months = recordDateObj.getMonth() - birthDate.getMonth();
          let days = recordDateObj.getDate() - birthDate.getDate();

          // Adjust for negative days
          if (days < 0) {
            months--;
            // Add days from previous month
            const prevMonth = new Date(
              recordDateObj.getFullYear(),
              recordDateObj.getMonth(),
              0
            );
            days += prevMonth.getDate();
          }

          // Adjust for negative months
          if (months < 0) {
            years--;
            months += 12;
          }

          ageInMonths = Math.max(0, years * 12 + months);

          console.log(
            `[AGE-CALC] Record ${
              record.date
            }: Birth=${childBirthDate} → Age=${ageInMonths}m (${(
              ageInMonths / 12
            ).toFixed(1)}y), Value=${record.value}`
          );
        } else {
          // Fallback calculation when birthdate is missing
          const today = new Date();
          const estimatedBirthDate = new Date(today);
          estimatedBirthDate.setMonth(
            today.getMonth() - (childAgeInMonths || 0)
          );

          const recordDateObj = new Date(record.date);
          let years =
            recordDateObj.getFullYear() - estimatedBirthDate.getFullYear();
          let months = recordDateObj.getMonth() - estimatedBirthDate.getMonth();

          ageInMonths = Math.max(0, years * 12 + months);

          console.log(
            `[AGE-CALC-FALLBACK] Record ${
              record.date
            }: Estimated birth → Age=${ageInMonths}m (${(
              ageInMonths / 12
            ).toFixed(1)}y), Value=${record.value}`
          );
        }

        return {
          value: record.value,
          ageInMonths: Math.max(0, Math.min(120, ageInMonths)), // Cap at 10 years
          date: record.date,
        };
      });

    console.log(
      "[USER-DATA] Processed user data:",
      result.map((r) => ({
        age: r.ageInMonths,
        value: r.value,
        date: r.date,
      }))
    );

    return result;
  }, [data, type, childAgeInMonths, childBirthDate]);

  // Process WHO standards data for chart lines
  const whoChartData = useMemo(() => {
    console.log(`[WHO-PROCESSING] Processing ${whoStandards.length} WHO standards for ${childGender}`);
    
    if (whoStandards.length === 0) {
      return { mean: [], minus2SD: [], plus2SD: [] };
    }

    const genderStandards = whoStandards
      .filter((standard) => standard.gender === childGender)
      .filter((standard) => standard.ageInMonths <= 120) // 0-10 years
      .sort((a, b) => a.ageInMonths - b.ageInMonths);
      
    console.log(`[WHO-PROCESSING] ${genderStandards.length} standards for ${childGender}`);

    console.log(
      `[WHO-PROCESSING] Processing ${genderStandards.length} WHO standards for ${childGender} ${type}`
    );
    console.log(
      "[WHO-PROCESSING] All WHO standards:",
      genderStandards.map((s) => ({
        age: s.ageInMonths,
        [type]: s[type],
      }))
    );

    const meanData = genderStandards.map((standard) => ({
      value: standard[type].mean,
      ageInMonths: standard.ageInMonths,
      date: standard.age,
    }));

    const minus2SDData = genderStandards.map((standard) => ({
      value: standard[type].minus2SD,
      ageInMonths: standard.ageInMonths,
      date: standard.age,
    }));

    const plus2SDData = genderStandards.map((standard) => ({
      value: standard[type].plus2SD,
      ageInMonths: standard.ageInMonths,
      date: standard.age,
    }));

    console.log(
      `[WHO-PROCESSING] Mean values for first 5 years:`,
      meanData.filter((d) => d.ageInMonths <= 60)
    );

    console.log(
      `[WHO-PROCESSING] 📈 Complete WHO ${type} progression (0-10 years):`
    );
    meanData.forEach((d) => {
      const years = (d.ageInMonths / 12).toFixed(1);
      console.log(
        `  ${d.ageInMonths}m (${years}y): ${d.value.toFixed(1)}${
          type === "weight" ? "kg" : "cm"
        }`
      );
    });

    console.log(`[WHO-PROCESSING] ✅ Final result: mean.length = ${meanData.length}, minus2SD.length = ${minus2SDData.length}, plus2SD.length = ${plus2SDData.length}`);
    console.log(`[WHO-PROCESSING] 📊 Mean data:`, meanData.map(d => ({ age: d.ageInMonths, value: d.value })));
    
    return {
      mean: meanData,
      minus2SD: minus2SDData,
      plus2SD: plus2SDData,
    };
  }, [whoStandards, childGender, type]);

  // Prepare data for react-native-chart-kit with mode-based filtering
  const chartData = useMemo(() => {
    // Determine interval based on mode
    const interval = selectedMode === "yearly" ? 12 : 6; // 12 months for yearly, 6 months for half-yearly
    const maxAge = 120; // 10 years

    // Create age labels based on mode
    const labels: string[] = [];
    for (let age = 0; age <= maxAge; age += interval) {
      const years = (age / 12).toFixed(1);
      labels.push(`${years}y`);
    }

    // Start with empty datasets - IMPORTANT: Keep datasets completely separate
    const datasets: {
      data: number[];
      color: (opacity?: number) => string;
      strokeWidth: number;
      withDots?: boolean;
    }[] = [];

    // Helper function to clamp values to desired ranges
    const clampValue = (value: number): number => {
      const originalValue = value;
      let clampedValue: number;

      if (type === "weight") {
        // Weight: clamp to 0-50 kg range
        clampedValue = Math.max(0, Math.min(50, value));
      } else {
        // Height: clamp to 0-160 cm range, but start meaningful values from 50cm
        clampedValue = Math.max(0, Math.min(160, value));
      }

      if (originalValue !== clampedValue) {
        console.log(
          `[CHART-DATA] Clamped ${type} value: ${originalValue} → ${clampedValue}`
        );
      }

      return clampedValue;
    };

    // Helper function to interpolate WHO data for half-yearly mode
    const interpolateWHOValue = (targetAge: number): number => {
      // Find the two closest WHO data points
      const sortedWHOData = [...whoChartData.mean].sort((a, b) => a.ageInMonths - b.ageInMonths);
      
      // Find the closest data points before and after target age
      let beforePoint = null;
      let afterPoint = null;
      
      for (let i = 0; i < sortedWHOData.length; i++) {
        if (sortedWHOData[i].ageInMonths <= targetAge) {
          beforePoint = sortedWHOData[i];
        } else {
          afterPoint = sortedWHOData[i];
          break;
        }
      }
      
      // If we have both points, interpolate
      if (beforePoint && afterPoint) {
        const ageDiff = afterPoint.ageInMonths - beforePoint.ageInMonths;
        const valueDiff = afterPoint.value - beforePoint.value;
        const ratio = (targetAge - beforePoint.ageInMonths) / ageDiff;
        return beforePoint.value + (valueDiff * ratio);
      }
      
      // If we only have one point, use it
      if (beforePoint) return beforePoint.value;
      if (afterPoint) return afterPoint.value;
      
      // Fallback values
      return type === "weight" ? 3 : 50;
    };

    // WHO mean data (green line) - Dataset 1: Continuous reference line
    if (whoChartData.mean.length > 0) {
      const whoValues: number[] = [];


      for (let age = 0; age <= maxAge; age += interval) {
        let dataPoint;
        let value;

        if (selectedMode === "yearly") {
          // For yearly mode, use the original logic that was working
          const exactMatch = whoChartData.mean.find((d) => d.ageInMonths === age);
          const nearMatch = whoChartData.mean.find(
            (d) => Math.abs(d.ageInMonths - age) <= interval / 2
          );
          dataPoint = exactMatch || nearMatch;
          
          // Debug logging for WHO data
          if (age === 120) { // 10 years old
            console.log(`[WHO-DEBUG] Age 120m (10y) - Available WHO data:`, whoChartData.mean.map(d => ({ age: d.ageInMonths, value: d.value })));
            console.log(`[WHO-DEBUG] Exact match:`, exactMatch);
            console.log(`[WHO-DEBUG] Near match:`, nearMatch);
            console.log(`[WHO-DEBUG] Selected dataPoint:`, dataPoint);
            if (dataPoint) {
              console.log(`[WHO-DEBUG] Original value: ${dataPoint.value}, Clamped value: ${clampValue(dataPoint.value)}`);
            }
          }
          
          value = dataPoint ? clampValue(dataPoint.value) : (type === "weight" ? 3 : 50);
        } else {
          // For half-yearly mode, use interpolation
          value = clampValue(interpolateWHOValue(age));
        }

        whoValues.push(value);


      }



      // WHO dataset - COMPLETELY SEPARATE from user data
      datasets.push({
        data: whoValues,
        color: (opacity = 1) => `rgba(0, 128, 0, ${opacity})`, // Bright Green for WHO
        strokeWidth: 3,
        withDots: true,
      });
    }

    // User data (red dots) - Dataset 2: Discrete measurements only
    if (userChartData.length > 0) {
      // Create user dataset that aligns with chart labels
      const userValues: (number | null)[] = [];
      
      console.log(
        `[CHART-DATA] 🔍 Mapping user ${type} data to chart intervals (${selectedMode} mode):`
      );

      for (let age = 0; age <= maxAge; age += interval) {
        const dataPoint = userChartData.find(
          (d) => Math.abs(d.ageInMonths - age) <= interval / 2
        );
        
        if (dataPoint) {
          const clampedValue = clampValue(dataPoint.value);
          userValues.push(clampedValue);
          const years = (age / 12).toFixed(1);
          console.log(
            `[CHART-DATA] ✅ User data point: ${
              dataPoint.ageInMonths
            }months (${(dataPoint.ageInMonths / 12).toFixed(
              1
            )}y) → age ${age}m (${years}y), value ${clampedValue}`
          );
        } else {
          // Use null for missing data points (will not connect)
          userValues.push(null as any);
          const years = (age / 12).toFixed(1);
          console.log(
            `[CHART-DATA] ❌ No user data for age ${age}m (${years}y) - will not connect`
          );
        }
      }

      console.log(
        `[CHART-DATA] User ${type} dataset (${selectedMode} mode):`,
        userValues
      );
      console.log(
        `[CHART-DATA] 🔴 Red dots will appear at positions:`,
        userValues.map((val, idx) => val !== null ? `${idx}: ${val}` : `${idx}: null`).filter(str => !str.includes('null'))
      );

      // User dataset - aligned with chart labels
      datasets.push({
        data: userValues as number[],
        color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`, // Bright Red for user data
        strokeWidth: 2, // Thin line to connect real data points
        withDots: true,
      });

    }

    const finalData = {
      labels,
      datasets,
    };

    // Determine dataset names based on what data we actually have
    const datasetNames: string[] = [];
    let datasetIndex = 0;

    if (whoChartData.mean.length > 0) {
      datasetNames.push("WHO Standard");
      datasetIndex++;
    }
    if (userChartData.length > 0) {
      datasetNames.push("User Data");
    }

    console.log(`[CHART-DATA] Final chart data for ${type} (${selectedMode} mode):`, {
      labels: finalData.labels,
      datasetsCount: finalData.datasets.length,
      whoDataAvailable: whoChartData.mean.length > 0,
      userDataAvailable: userChartData.length > 0,
      datasets: finalData.datasets.map((ds, idx) => ({
        index: idx,
        name: datasetNames[idx] || `Dataset ${idx}`,
        data: ds.data,
      })),
    });

    console.log(
      `[CHART-DATA] 📊 Chart will display these SEPARATE, NON-CONNECTED lines (${selectedMode} mode):`
    );
    finalData.datasets.forEach((dataset, index) => {
      const color = index === 0 ? "BRIGHT GREEN (WHO)" : "BRIGHT RED (User)";
      const name = datasetNames[index] || `Dataset ${index}`;
      const hasColorFunc = typeof dataset.color === "function";
      console.log(
        `  Line ${index + 1} - ${name} (${color}): ${
          dataset.data.length
        } points, hasColor: ${hasColorFunc}`
      );
      console.log(`    🚫 ISOLATED - Will NOT connect to other datasets`);
      if (hasColorFunc) {
        console.log(`    Color test: ${dataset.color(1)}`);
      }
    });

    return finalData;
  }, [whoChartData, userChartData, type, selectedMode]);

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
    // Handle null values properly - don't connect them or show dots
    connectNulls: false,
  };

  // Early return for empty data
  if (userChartData.length === 0 && !loading) {
    return (
      <View style={styles.container}>
        <View style={styles.chartPlaceholder}>
          <MaterialIcons
            name={type === "height" ? "trending-up" : "fitness-center"}
            size={48}
            color={Colors.light.textSecondary}
          />
          <Text style={styles.placeholderText}>No {type} data available</Text>
          <Text style={styles.placeholderSubtext}>
            Add your first {type} measurement to see the chart
          </Text>
        </View>
      </View>
    );
  }

  // Show warning if WHO data is not available
  const whoDataUnavailable = whoStandards.length === 0 && !loading;

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.chartPlaceholder}>
          <MaterialIcons
            name="refresh"
            size={48}
            color={Colors.light.textSecondary}
          />
          <Text style={styles.placeholderText}>Loading growth chart...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
            onPress={() => setSelectedMode("yearly")}
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
            onPress={() => setSelectedMode("half-yearly")}
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

      {/* Chart with Labels */}
      <View style={styles.chartWithLabelsContainer}>
        <Text style={styles.yAxisTitle}>
          {type === "height" ? "Height (cm)" : "Weight (kg)"}
        </Text>

        {/* Scrollable Line Chart */}
        <View style={styles.chartContainer}>
          {(() => {
            console.log(`[CHART-RENDER] 🎯 About to render chart with:`, {
              mode: selectedMode,
              totalDatasets: chartData.datasets.length,
              labelsCount: chartData.labels.length,
              labels: chartData.labels,
              chartWidth,
              dataset0Length: chartData.datasets[0]?.data.length,
              dataset1Length: chartData.datasets[1]?.data.length,
            });
            return null;
          })()}
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
              decorator={() => {
                console.log(
                  `[CHART-DECORATOR] 🎨 Chart rendered with ${chartData.datasets.length} datasets (${selectedMode} mode)`
                );
                return null;
              }}
            />
          </ScrollView>
        </View>

        <Text style={styles.xAxisTitle}>
          Age (years: 0-10, {selectedMode} intervals)
        </Text>
      </View>

      {/* Legend */}
      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>Chart Legend</Text>
        <View style={styles.legendItems}>
          {whoChartData.mean.length > 0 && (
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
          {userChartData.length > 0 && (
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
          {whoChartData.mean.length === 0 && userChartData.length === 0 && (
            <Text style={styles.legendText}>No data available</Text>
          )}
        </View>
        <Text style={styles.legendNote}>
          {whoDataUnavailable
            ? "⚠️ WHO standards not available - showing child data only. Please check your backend API for WHO standards data."
            : `🟢 WHO Standard: Complete green line (0-10 years, ${selectedMode} intervals). 🔴 Your child: Red dots and lines only where measurements exist. No connections across missing data periods.`}
        </Text>
      </View>

      {/* Statistics */}
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
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
    marginLeft: 4,
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

export default GrowthChart;
