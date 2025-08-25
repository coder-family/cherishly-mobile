import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
    fetchChildFamilyGroups,
    removeChildFromFamilyGroup,
    setPrimaryFamilyGroup
} from "../../redux/slices/childSlice";
import LoadingSpinner from "../ui/LoadingSpinner";

interface ChildFamilyGroupsListProps {
  childId: string;
  childName: string;
}

export default function ChildFamilyGroupsList({ 
  childId, 
  childName 
}: ChildFamilyGroupsListProps) {
  const dispatch = useAppDispatch();
  const { childFamilyGroups, loading } = useAppSelector((state) => state.children);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (childId) {
      dispatch(fetchChildFamilyGroups(childId));
    }
  }, [childId, dispatch]);

  const handleSetPrimary = async (familyGroupId: string) => {
    setUpdating(true);
    try {
      await dispatch(setPrimaryFamilyGroup({ childId, familyGroupId })).unwrap();
      Alert.alert("Success", "Primary family group updated successfully!");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to set primary family group");
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveFromGroup = async (familyGroupId: string, groupName: string) => {
    Alert.alert(
      "Remove from Group",
      `Are you sure you want to remove ${childName} from "${groupName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            setUpdating(true);
            try {
              await dispatch(removeChildFromFamilyGroup({ childId, familyGroupId })).unwrap();
              Alert.alert("Success", `${childName} has been removed from the group`);
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to remove from group");
            } finally {
              setUpdating(false);
            }
          },
        },
      ]
    );
  };

  if (loading && childFamilyGroups.length === 0) {
    return <LoadingSpinner message="Loading family groups..." />;
  }

  if (childFamilyGroups.length === 0) {
    return (
      <View style={styles.emptyState}>
        <MaterialIcons name="family-restroom" size={48} color="#ccc" />
        <Text style={styles.emptyStateText}>
          {childName} is not a member of any family groups yet.
        </Text>
      </View>
    );
  }

  const primaryGroup = childFamilyGroups.find(group => group.role === 'primary');
  const secondaryGroups = childFamilyGroups.filter(group => group.role === 'secondary');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Family Groups</Text>
      
      {/* Primary Group */}
      {primaryGroup && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Primary Family Group</Text>
          <View style={styles.groupCard}>
            <View style={styles.groupInfo}>
              <Text style={styles.groupName}>{primaryGroup.familyGroupId.name}</Text>
              {primaryGroup.familyGroupId.description && (
                <Text style={styles.groupDescription}>
                  {primaryGroup.familyGroupId.description}
                </Text>
              )}
              <View style={styles.primaryBadge}>
                <MaterialIcons name="star" size={16} color="#ffd700" />
                <Text style={styles.primaryBadgeText}>Primary</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveFromGroup(
                primaryGroup.familyGroupId._id, 
                primaryGroup.familyGroupId.name
              )}
              disabled={updating}
            >
              <MaterialIcons name="remove-circle" size={20} color="#ff4444" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Secondary Groups */}
      {secondaryGroups.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Other Family Groups</Text>
          {secondaryGroups.map((group) => (
            <View key={group._id} style={styles.groupCard}>
              <View style={styles.groupInfo}>
                <Text style={styles.groupName}>{group.familyGroupId.name}</Text>
                {group.familyGroupId.description && (
                  <Text style={styles.groupDescription}>
                    {group.familyGroupId.description}
                  </Text>
                )}
              </View>
              <View style={styles.groupActions}>
                <TouchableOpacity
                  style={styles.setPrimaryButton}
                  onPress={() => handleSetPrimary(group.familyGroupId._id)}
                  disabled={updating}
                >
                  <MaterialIcons name="star-border" size={20} color="#4f8cff" />
                  <Text style={styles.setPrimaryButtonText}>Set Primary</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveFromGroup(
                    group.familyGroupId._id, 
                    group.familyGroupId.name
                  )}
                  disabled={updating}
                >
                  <MaterialIcons name="remove-circle" size={20} color="#ff4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {updating && <LoadingSpinner message="Updating..." />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
    marginBottom: 8,
  },
  groupCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  groupDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  primaryBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff3cd",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  primaryBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#856404",
    marginLeft: 4,
  },
  groupActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  setPrimaryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#e3f2fd",
    borderRadius: 6,
  },
  setPrimaryButtonText: {
    fontSize: 12,
    color: "#4f8cff",
    fontWeight: "600",
    marginLeft: 4,
  },
  removeButton: {
    padding: 4,
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginTop: 12,
  },
});
