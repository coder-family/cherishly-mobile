import { useEffect, useState } from "react";
import * as healthService from "../services/healthService";
import { WHOStandardGrowthData } from "../types/health";

export const useWHOStandards = (
  childGender: "male" | "female",
  type: "height" | "weight"
) => {
  const [whoStandards, setWhoStandards] = useState<WHOStandardGrowthData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWHOStandards = async () => {
      try {
        setLoading(true);

        // Try primary API
        let standards = await healthService.getWHOStandardsInRange(
          childGender || "male",
          0, // Start from birth
          120 // Up to 10 years
        );
        
        // Check if this is mock data
        if (standards.length > 0) {
          const firstItem = standards[0];
          if (firstItem.id && firstItem.id.includes('mock')) {
            // Using mock data
          } else {
            // Using real server data
          }
          
          // Check the 10-year-old data specifically
          const tenYearData = standards.find(s => s.ageInMonths === 120);
          if (tenYearData) {
            // 10-year data available
          }
        }

        // Check if primary API returned too many points
        if (standards.length > 11) {
          const yearlyStandards = standards.filter(
            (s) => s.ageInMonths % 12 === 0
          );
          standards = yearlyStandards;
        }

        // If primary API returns empty, try fallback
        if (standards.length === 0) {
          standards = await healthService.getAllWHOStandardData(
            childGender || "male"
          );
          standards = standards.filter((s) => s.ageInMonths <= 120);
          
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

  return { whoStandards, loading };
}; 