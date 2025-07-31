import { useMemo } from "react";
import { GrowthRecord, WHOStandardGrowthData } from "../types/health";

interface ProcessedUserData {
  value: number;
  ageInMonths: number;
  date: string;
}

interface WHOChartData {
  mean: ProcessedUserData[];
  minus2SD: ProcessedUserData[];
  plus2SD: ProcessedUserData[];
}

interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    color: (opacity?: number) => string;
    strokeWidth: number;
    withDots?: boolean;
  }[];
}

export const useChartData = (
  data: GrowthRecord[],
  type: "height" | "weight",
  childAgeInMonths: number,
  childBirthDate: string | undefined,
  whoStandards: WHOStandardGrowthData[],
  selectedMode: "yearly" | "half-yearly"
) => {
  // Process user data
  const userChartData = useMemo(() => {
    const filteredData = data.filter((record) => record.type === type);

    const result = filteredData
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((record) => {
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
        }

        return {
          value: record.value,
          ageInMonths: Math.max(0, Math.min(120, ageInMonths)), // Cap at 10 years
          date: record.date,
        };
      });

    return result;
  }, [data, type, childAgeInMonths, childBirthDate]);

  // Process WHO standards data for chart lines
  const whoChartData = useMemo((): WHOChartData => {
    if (whoStandards.length === 0) {
      return { mean: [], minus2SD: [], plus2SD: [] };
    }

    const genderStandards = whoStandards
      .filter((standard) => standard.gender === "male" || standard.gender === "female")
      .filter((standard) => standard.ageInMonths <= 120) // 0-10 years
      .sort((a, b) => a.ageInMonths - b.ageInMonths);

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
    
    return {
      mean: meanData,
      minus2SD: minus2SDData,
      plus2SD: plus2SDData,
    };
  }, [whoStandards, type]);

  // Prepare data for react-native-chart-kit with mode-based filtering
  const chartData = useMemo((): ChartData => {
    // Determine interval based on mode
    const interval = selectedMode === "yearly" ? 12 : 6; // 12 months for yearly, 6 months for half-yearly
    
    // Always use 10 years (120 months) as maximum to ensure full range display
    const maxAge = 120;

    // Create age labels based on mode - always show full range to 10 years
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
      if (type === "weight") {
        // Weight: clamp to 0-50 kg range
        return Math.max(0, Math.min(50, value));
      } else {
        // Height: clamp to 0-160 cm range, but start meaningful values from 50cm
        return Math.max(0, Math.min(160, value));
      }
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
      const userValues: number[] = [];

      for (let age = 0; age <= maxAge; age += interval) {
        const dataPoint = userChartData.find(
          (d) => Math.abs(d.ageInMonths - age) <= interval / 2
        );
        
        if (dataPoint) {
          const clampedValue = clampValue(dataPoint.value);
          userValues.push(clampedValue);
        } else {
          // Use a very low value that will be hidden by yAxisMin
          userValues.push(type === "weight" ? -5 : -20);
        }
      }

      // User dataset - aligned with chart labels
      datasets.push({
        data: userValues,
        color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`, // Bright Red for user data
        strokeWidth: 0, // No line connection - only dots
        withDots: true,
      });
    }

    return {
      labels,
      datasets,
    };
  }, [whoChartData, userChartData, type, selectedMode]);

  return {
    userChartData,
    whoChartData,
    chartData,
  };
}; 