import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Colors } from '../../constants/Colors';
import * as healthService from '../../services/healthService';
import { GrowthRecord, WHOStandardGrowthData } from '../../types/health';

const { width } = Dimensions.get('window');

interface GrowthChartProps {
  data: GrowthRecord[];
  type: 'height' | 'weight';
  childAgeInMonths?: number;
  childGender?: 'male' | 'female';
  childBirthDate?: string;
}



const GrowthChart: React.FC<GrowthChartProps> = ({ 
  data, 
  type, 
  childAgeInMonths = 0, 
  childGender = 'male',
  childBirthDate
}) => {
  const [whoStandards, setWhoStandards] = useState<WHOStandardGrowthData[]>([]);
  const [loading, setLoading] = useState(true);

  // Debug logging for props
  console.log(`[CHART-PROPS] Chart initialized with:`, {
    type,
    dataLength: data.length,
    childAgeInMonths,
    childGender,
    childBirthDate,
    firstDataPoint: data[0] ? { date: data[0].date, value: data[0].value, type: data[0].type } : 'none'
  });

  // Fetch WHO standards data for 0-10 years (120 months)
  useEffect(() => {
    const fetchWHOStandards = async () => {
      try {
        setLoading(true);
        
        // Try primary API
        let standards = await healthService.getWHOStandardsInRange(
          childGender || 'male',
          0, // Start from birth
          120 // Up to 10 years
        );
        
        console.log(`[WHO-DATA] Primary API returned ${standards.length} WHO standards - EXPECTED 11, GOT ${standards.length}`);
        
        // Check if primary API returned too many points
        if (standards.length > 11) {
          console.log(`[WHO-DATA] 🚨 PRIMARY API RETURNED TOO MANY POINTS! Got ${standards.length} instead of 11`);
          console.log(`[WHO-DATA] 📊 Primary API data ages:`, standards.map(s => s.ageInMonths));
          
          // Filter to yearly data only
          console.log(`[WHO-DATA] 🔧 Filtering primary API data to yearly intervals only...`);
          const yearlyStandards = standards.filter(s => s.ageInMonths % 12 === 0);
          standards = yearlyStandards;
          console.log(`[WHO-DATA] ✅ Filtered primary API to ${standards.length} yearly data points`);
        }
        
        // If primary API returns empty, try fallback
        if (standards.length === 0) {
          console.log('[WHO-DATA] Trying fallback API...');
          standards = await healthService.getAllWHOStandardData(childGender || 'male');
          standards = standards.filter(s => s.ageInMonths <= 120);
          console.log(`[WHO-DATA] Fallback API returned ${standards.length} WHO standards - EXPECTED 11, GOT ${standards.length}`);
          
          // Check if fallback API returned too many points
          if (standards.length > 11) {
            console.log(`[WHO-DATA] 🚨 FALLBACK API RETURNED TOO MANY POINTS! Got ${standards.length} instead of 11`);
            console.log(`[WHO-DATA] 📊 Fallback API data ages:`, standards.map(s => s.ageInMonths));
            
            // Filter to yearly data only
            console.log(`[WHO-DATA] 🔧 Filtering fallback API data to yearly intervals only...`);
            const yearlyStandards = standards.filter(s => s.ageInMonths % 12 === 0);
            standards = yearlyStandards;
            console.log(`[WHO-DATA] ✅ Filtered fallback API to ${standards.length} yearly data points`);
          }
        }
        
        // If both APIs return empty, generate mock data
        if (standards.length === 0) {
          console.log('[WHO-DATA] 🔄 No WHO data from server, generating realistic mock data (yearly intervals)');
          // Generate comprehensive mock data for 0-10 years (yearly only)
          const mockStandards: WHOStandardGrowthData[] = [];
          for (let age = 0; age <= 120; age += 12) { // Every 12 months (yearly only)
            let baseWeight: number, baseHeight: number;
            const isMale = (childGender || 'male') === 'male';
            
            if (age === 0) {
              baseWeight = isMale ? 3.3 : 3.2;
              baseHeight = isMale ? 50.0 : 49.1;
            } else if (age <= 12) {
              baseWeight = (isMale ? 3.3 : 3.2) + (age * (isMale ? 0.65 : 0.6));
              baseHeight = (isMale ? 50.0 : 49.1) + (age * (isMale ? 2.4 : 2.3));
            } else if (age <= 24) {
              const age12Weight = isMale ? 11.1 : 10.4;
              const age12Height = isMale ? 78.8 : 77.4;
              const yearsAfter1 = (age - 12) / 12; // Convert to years since we're doing 12-month intervals
              baseWeight = age12Weight + (yearsAfter1 * 12 * (isMale ? 0.25 : 0.23));
              baseHeight = age12Height + (yearsAfter1 * 12 * (isMale ? 1.1 : 1.0));
            } else {
              // Continue growth curve for older ages (2-10 years)
              const yearsOld = age / 12;
              if (yearsOld <= 5) {
                // Ages 2-5: slower but steady growth
                baseWeight = isMale ? (14.1 + (yearsOld - 2) * 1.8) : (13.2 + (yearsOld - 2) * 1.7);
                baseHeight = isMale ? (92.0 + (yearsOld - 2) * 7.5) : (89.4 + (yearsOld - 2) * 7.0);
              } else {
                // Ages 5-10: continued growth
                baseWeight = isMale ? (19.5 + (yearsOld - 5) * 2.2) : (18.4 + (yearsOld - 5) * 2.0);
                baseHeight = isMale ? (114.5 + (yearsOld - 5) * 6.0) : (110.0 + (yearsOld - 5) * 5.8);
              }
            }
            
            mockStandards.push({
              id: `fallback-${age}-${childGender}`,
              age: `${age} months`,
              ageInMonths: age,
              gender: childGender || 'male',
              weight: {
                minus2SD: baseWeight * 0.85,
                mean: baseWeight,
                plus2SD: baseWeight * 1.15,
              },
              height: {
                minus2SD: baseHeight * 0.93,
                mean: baseHeight,
                plus2SD: baseHeight * 1.07,
              },
              isDeleted: false,
              deletedAt: null,
              deletedBy: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
          
          console.log(`[WHO-DATA] ✅ Generated ${mockStandards.length} mock WHO standards (should be 11 yearly points)`);
          
          // Log the actual WHO values to verify they increase gradually
          console.log('[WHO-DATA] 📊 Mock WHO Weight values by age:');
          mockStandards.forEach(std => {
            const years = (std.ageInMonths / 12).toFixed(1);
            console.log(`  Age ${std.ageInMonths}m (${years}y): Weight=${std.weight.mean.toFixed(1)}kg, Height=${std.height.mean.toFixed(1)}cm`);
          });
          
          standards = mockStandards;
        }
        
        // Final validation: ensure we have exactly 11 yearly data points
        console.log(`[WHO-DATA] 🔍 Final validation: ${standards.length} WHO standards before setting state`);
        if (standards.length > 11) {
          console.log(`[WHO-DATA] ⚠️ STILL TOO MANY POINTS after filtering! Forcing yearly filter...`);
          standards = standards.filter(s => s.ageInMonths % 12 === 0);
          console.log(`[WHO-DATA] 🔧 Force-filtered to ${standards.length} yearly points`);
        }
        
        // Set the final WHO standards (either from server or mock) 
        setWhoStandards(standards);
        
      } catch (error) {
        console.warn('Network error fetching WHO standards, using mock data (yearly intervals):', error);
        // If there's a network error, generate mock data (yearly only)
        const mockStandards: WHOStandardGrowthData[] = [];
        for (let age = 0; age <= 120; age += 12) {
          const isMale = (childGender || 'male') === 'male';
          const years = age / 12;
          // Use similar growth curve as the main mock data generation  
          let baseWeight: number, baseHeight: number;
          if (years === 0) {
            baseWeight = isMale ? 3.3 : 3.2;
            baseHeight = isMale ? 50.0 : 49.1;
          } else if (years <= 2) {
            baseWeight = (isMale ? 3.3 : 3.2) + (years * (isMale ? 5.0 : 4.8));
            baseHeight = (isMale ? 50.0 : 49.1) + (years * (isMale ? 20.0 : 19.5));
          } else {
            baseWeight = (isMale ? 13.3 : 12.8) + ((years - 2) * (isMale ? 2.0 : 1.9));
            baseHeight = (isMale ? 90.0 : 88.1) + ((years - 2) * (isMale ? 6.5 : 6.2));
          }
          
          mockStandards.push({
            id: `mock-${age}-${childGender}`,
            age: `${age} months`,
            ageInMonths: age,
            gender: childGender || 'male',
            weight: {
              minus2SD: baseWeight * 0.85,
              mean: baseWeight,
              plus2SD: baseWeight * 1.15,
            },
            height: {
              minus2SD: baseHeight * 0.93,
              mean: baseHeight,
              plus2SD: baseHeight * 1.07,
            },
            isDeleted: false,
            deletedAt: null,
            deletedBy: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
        console.log(`[WHO-DATA] ✅ Generated ${mockStandards.length} fallback mock WHO standards (should be 11 yearly points)`);
        setWhoStandards(mockStandards);
      } finally {
        setLoading(false);
      }
    };

    fetchWHOStandards();
  }, [childGender, type]);

  // Process user data
  const userChartData = useMemo(() => {
    const filteredData = data.filter(record => record.type === type);
    console.log(`[USER-DATA] Found ${filteredData.length} user ${type} records`);
    
    const result = filteredData
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(record => {
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
            const prevMonth = new Date(recordDateObj.getFullYear(), recordDateObj.getMonth(), 0);
            days += prevMonth.getDate();
          }
          
          // Adjust for negative months
          if (months < 0) {
            years--;
            months += 12;
          }
          
          ageInMonths = Math.max(0, years * 12 + months);
          
          console.log(`[AGE-CALC] Record ${record.date}: Birth=${childBirthDate} → Age=${ageInMonths}m (${(ageInMonths/12).toFixed(1)}y), Value=${record.value}`);
        } else {
          // Fallback calculation when birthdate is missing
          const today = new Date();
          const estimatedBirthDate = new Date(today);
          estimatedBirthDate.setMonth(today.getMonth() - (childAgeInMonths || 0));
          
          const recordDateObj = new Date(record.date);
          let years = recordDateObj.getFullYear() - estimatedBirthDate.getFullYear();
          let months = recordDateObj.getMonth() - estimatedBirthDate.getMonth();
          
          ageInMonths = Math.max(0, years * 12 + months);
          
          console.log(`[AGE-CALC-FALLBACK] Record ${record.date}: Estimated birth → Age=${ageInMonths}m (${(ageInMonths/12).toFixed(1)}y), Value=${record.value}`);
        }
        
        return {
          value: record.value,
          ageInMonths: Math.max(0, Math.min(120, ageInMonths)), // Cap at 10 years
          date: record.date,
        };
      });

    console.log('[USER-DATA] Processed user data:', result.map(r => ({
      age: r.ageInMonths,
      value: r.value,
      date: r.date
    })));
    
    return result;
  }, [data, type, childAgeInMonths, childBirthDate]);

  // Process WHO standards data for chart lines
  const whoChartData = useMemo(() => {
    if (whoStandards.length === 0) return { mean: [], minus2SD: [], plus2SD: [] };
    
    const genderStandards = whoStandards
      .filter(standard => standard.gender === childGender)
      .filter(standard => standard.ageInMonths <= 120) // 0-10 years
      .sort((a, b) => a.ageInMonths - b.ageInMonths);
    
    console.log(`[WHO-PROCESSING] Processing ${genderStandards.length} WHO standards for ${childGender} ${type}`);
    console.log('[WHO-PROCESSING] First 3 WHO standards:', genderStandards.slice(0, 3).map(s => ({
      age: s.ageInMonths,
      [type]: s[type]
    })));
    
    const meanData = genderStandards.map(standard => ({
      value: standard[type].mean,
      ageInMonths: standard.ageInMonths,
      date: standard.age
    }));

    const minus2SDData = genderStandards.map(standard => ({
      value: standard[type].minus2SD,
      ageInMonths: standard.ageInMonths,
      date: standard.age
    }));

    const plus2SDData = genderStandards.map(standard => ({
      value: standard[type].plus2SD,
      ageInMonths: standard.ageInMonths,
      date: standard.age
    }));
    
    console.log(`[WHO-PROCESSING] Mean values for first 5 years:`, meanData.filter(d => d.ageInMonths <= 60));
    
    console.log(`[WHO-PROCESSING] 📈 Complete WHO ${type} progression (0-10 years):`);
    meanData.forEach(d => {
      const years = (d.ageInMonths / 12).toFixed(1);
      console.log(`  ${d.ageInMonths}m (${years}y): ${d.value.toFixed(1)}${type === 'weight' ? 'kg' : 'cm'}`);
    });
    
    return {
      mean: meanData,
      minus2SD: minus2SDData,
      plus2SD: plus2SDData
    };
  }, [whoStandards, childGender, type]);

  // Prepare data for react-native-chart-kit
  const chartData = useMemo(() => {
    // Create age labels (0, 1, 2, ... 10 years)
    const labels: string[] = [];
    for (let i = 0; i <= 10; i++) {
      labels.push(`${i}y`);
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
      
      if (type === 'weight') {
        // Weight: clamp to 0-50 kg range
        clampedValue = Math.max(0, Math.min(50, value));
      } else {
        // Height: clamp to 0-160 cm range, but start meaningful values from 50cm
        clampedValue = Math.max(0, Math.min(160, value));
      }
      
      if (originalValue !== clampedValue) {
        console.log(`[CHART-DATA] Clamped ${type} value: ${originalValue} → ${clampedValue}`);
      }
      
      return clampedValue;
    };

    // WHO mean data (green line) - Dataset 1: Continuous reference line
    if (whoChartData.mean.length > 0) {
      const whoValues: number[] = [];
      console.log(`[CHART-DATA] 🔍 Mapping WHO ${type} data to chart years:`);
      
      for (let year = 0; year <= 10; year++) {
        const months = year * 12;
        const exactMatch = whoChartData.mean.find(d => d.ageInMonths === months);
        const nearMatch = whoChartData.mean.find(d => Math.abs(d.ageInMonths - months) <= 6);
        const dataPoint = exactMatch || nearMatch;
        
        const value = dataPoint ? clampValue(dataPoint.value) : (type === 'weight' ? 3 : 50);
        whoValues.push(value);
        
        console.log(`  Year ${year} (${months}m): ${exactMatch ? 'EXACT' : nearMatch ? 'NEAR' : 'DEFAULT'} match → ${dataPoint?.ageInMonths || 'none'}m = ${value.toFixed(1)}${type === 'weight' ? 'kg' : 'cm'}`);
      }
      
      console.log(`[CHART-DATA] Final WHO ${type} values for chart:`, whoValues);
      
      // WHO dataset - COMPLETELY SEPARATE from user data
      datasets.push({
        data: whoValues,
        color: (opacity = 1) => `rgba(0, 128, 0, ${opacity})`, // Bright Green for WHO
        strokeWidth: 3,
        withDots: true
      });
    }

    // User data (red dots) - Dataset 2: Discrete measurements only
    if (userChartData.length > 0) {
      // Create arrays to track actual data points and their positions
      let actualDataPointsCount = 0;
      
      // First pass: collect only actual data points
      const actualDataPoints: {value: number, yearIndex: number, yearLabel: string}[] = [];
      
      for (let year = 0; year <= 10; year++) {
        const months = year * 12;
        const dataPoint = userChartData.find(d => Math.abs(d.ageInMonths - months) <= 12);
        if (dataPoint) {
          const clampedValue = clampValue(dataPoint.value);
          actualDataPoints.push({
            value: clampedValue,
            yearIndex: year,
            yearLabel: `${year}y`
          });
          actualDataPointsCount++;
          console.log(`[CHART-DATA] ✅ User data point: ${dataPoint.ageInMonths}months (${(dataPoint.ageInMonths/12).toFixed(1)}y) → year ${year}, value ${clampedValue}`);
        } else {
          console.log(`[CHART-DATA] ❌ No user data for year ${year} (${months}months) - no dot will be shown`);
        }
      }
      
      // Create a separate user dataset with only actual measurements
      // This ensures it's completely independent from WHO data
      const userDataset: number[] = [];
      const userLabels: string[] = [];
      
      // Only include actual data points to prevent connecting across gaps
      actualDataPoints.forEach(point => {
        userDataset.push(point.value);
        userLabels.push(point.yearLabel);
      });
      
      console.log(`[CHART-DATA] User ${type} dataset (${actualDataPointsCount} actual data points):`, userDataset);
      console.log(`[CHART-DATA] 🔴 Red dots will appear for values:`, userDataset);
      console.log(`[CHART-DATA] 🚫 User data is COMPLETELY SEPARATE from WHO data - NO connections between datasets`);
      
      // Only add user dataset if we have actual data points
      if (userDataset.length > 0) {
        // User dataset - COMPLETELY SEPARATE from WHO data  
        datasets.push({
          data: userDataset,
          color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`, // Bright Red for user data
          strokeWidth: 3,
          withDots: true
        });
      }
    }

    const finalData = {
      labels,
      datasets
    };
    
    // Determine dataset names based on what data we actually have
    const datasetNames: string[] = [];
    let datasetIndex = 0;
    
    if (whoChartData.mean.length > 0) {
      datasetNames.push('WHO Standard');
      datasetIndex++;
    }
    if (userChartData.length > 0) {
      datasetNames.push('User Data');
    }
    
    console.log(`[CHART-DATA] Final chart data for ${type}:`, {
      labels: finalData.labels,
      datasetsCount: finalData.datasets.length,
      whoDataAvailable: whoChartData.mean.length > 0,
      userDataAvailable: userChartData.length > 0,
      datasets: finalData.datasets.map((ds, idx) => ({
        index: idx,
        name: datasetNames[idx] || `Dataset ${idx}`,
        data: ds.data
      }))
    });
    
    console.log(`[CHART-DATA] 📊 Chart will display these SEPARATE, NON-CONNECTED lines:`);
    finalData.datasets.forEach((dataset, index) => {
      const color = index === 0 ? 'BRIGHT GREEN (WHO)' : 'BRIGHT RED (User)';
      const name = datasetNames[index] || `Dataset ${index}`;
      const hasColorFunc = typeof dataset.color === 'function';
      console.log(`  Line ${index + 1} - ${name} (${color}): ${dataset.data.length} points, hasColor: ${hasColorFunc}`);
      console.log(`    🚫 ISOLATED - Will NOT connect to other datasets`);
      if (hasColorFunc) {
        console.log(`    Color test: ${dataset.color(1)}`);
      }
    });

    return finalData;
  }, [whoChartData, userChartData, type]);

  // Chart configuration
  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0, // No decimal places for cleaner axis labels
    color: (opacity = 1) => `rgba(100, 100, 100, ${opacity})`, // Default gray (should be overridden by dataset colors)
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '3', // Smaller dots for cleaner look
      strokeWidth: '2',
      stroke: '#ffffff'
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: '#e5e7eb', // Lighter grid lines
      strokeWidth: 1,
    },
    // Set appropriate number of horizontal grid lines
    segments: type === 'weight' ? 5 : 8, // Weight: 5 segments (0-50); Height: 8 segments  
    yAxisSuffix: '', // We'll add units in the axis title instead
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
    connectNulls: false
  };

  // Early return for empty data
  if (userChartData.length === 0 && !loading) {
    return (
      <View style={styles.container}>
        <View style={styles.chartPlaceholder}>
          <MaterialIcons 
            name={type === 'height' ? 'trending-up' : 'fitness-center'} 
            size={48} 
            color={Colors.light.textSecondary} 
          />
          <Text style={styles.placeholderText}>
            No {type} data available
          </Text>
          <Text style={styles.placeholderSubtext}>
            Add your first {type} measurement to see the chart
          </Text>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.chartPlaceholder}>
          <MaterialIcons name="refresh" size={48} color={Colors.light.textSecondary} />
          <Text style={styles.placeholderText}>Loading growth chart...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.chartHeader}>
        <MaterialIcons 
          name={type === 'height' ? 'trending-up' : 'fitness-center'} 
          size={24} 
          color={Colors.light.primary} 
        />
        <Text style={styles.chartTitle}>
          {type === 'height' ? 'Height' : 'Weight'} Growth Chart
        </Text>
        <Text style={styles.chartSubtitle}>
          Age 0-10 years with WHO growth standards
        </Text>
      </View>
      
      {/* Chart with Labels */}
      <View style={styles.chartWithLabelsContainer}>
        <Text style={styles.yAxisTitle}>
          {type === 'height' ? 'Height (cm)' : 'Weight (kg)'}
        </Text>
        
        {/* Line Chart */}
        <View style={styles.chartContainer}>
          {(() => {
            console.log(`[CHART-RENDER] 🎯 About to render chart with:`, {
              totalDatasets: chartData.datasets.length,
              labelsCount: chartData.labels.length,
              labels: chartData.labels,
              dataset0Length: chartData.datasets[0]?.data.length,
              dataset1Length: chartData.datasets[1]?.data.length
            });
            return null;
          })()}
          <LineChart
            data={chartData}
            width={width - 60}
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
            segments={type === 'weight' ? 5 : 8}
            hidePointsAtIndex={[]} // Let null values handle hiding naturally
            decorator={() => {
              console.log(`[CHART-DECORATOR] 🎨 Chart rendered with ${chartData.datasets.length} datasets`);
              return null;
            }}
          />
        </View>
        
        <Text style={styles.xAxisTitle}>Age (years: 0-10)</Text>
      </View>
      
      {/* Legend */}
      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>Chart Legend</Text>
        <View style={styles.legendItems}>
          {whoChartData.mean.length > 0 && (
            <View style={styles.legendItem}>
              <View style={[styles.legendLine, { backgroundColor: 'rgb(0, 128, 0)' }]} />
              <Text style={styles.legendText}>🟢 WHO Standard (Average growth)</Text>
            </View>
          )}
          {userChartData.length > 0 && (
            <View style={styles.legendItem}>
              <View style={[styles.legendLine, { backgroundColor: 'rgb(255, 0, 0)' }]} />
              <Text style={styles.legendText}>🔴 Your child&apos;s measurements</Text>
            </View>
          )}
          {whoChartData.mean.length === 0 && userChartData.length === 0 && (
            <Text style={styles.legendText}>No data available</Text>
          )}
        </View>
        <Text style={styles.legendNote}>
          {whoChartData.mean.length === 0 ? 
            'WHO standards not available - showing child data only' : 
            '🟢 WHO Standard: Complete green line (0-10 years). 🔴 Your child: Red dots and lines only where measurements exist. No connections across missing data periods.'
          }
        </Text>
      </View>
      
      {/* Statistics */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Latest {type}</Text>
          <Text style={styles.statValue}>
            {userChartData[userChartData.length - 1]?.value.toFixed(1) || '0'} {type === 'weight' ? 'kg' : 'cm'}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Measurements</Text>
          <Text style={styles.statValue}>{userChartData.length}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Age Range</Text>
          <Text style={styles.statValue}>0-10 years</Text>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartHeader: {
    marginBottom: 20,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: 8,
    textAlign: 'center',
  },
  chartSubtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  chartWithLabelsContainer: {
    marginBottom: 20,
  },
  yAxisTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  xAxisTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    textAlign: 'center',
    marginTop: 10,
  },
  chartContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.textSecondary,
    marginTop: 8,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
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
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  legendItems: {
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.light.card,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
    textAlign: 'center',
  },
});

export default GrowthChart; 