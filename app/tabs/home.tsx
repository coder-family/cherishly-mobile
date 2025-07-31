import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import AddChildModal from "../components/child/AddChildModal";
import ChildProfileCard from "../components/child/ChildProfileCard";
import FamilyGroupCard from "../components/family/FamilyGroupCard";
import AppHeader from "../components/layout/AppHeader";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import SearchResults from "../components/ui/SearchResults";
import UserProfileCard from "../components/user/UserProfileCard";
import UserProfileEditModal from "../components/user/UserProfileEditModal";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchChildren } from "../redux/slices/childSlice";
import { fetchFamilyGroups } from "../redux/slices/familySlice";
import { fetchCurrentUser } from "../redux/slices/userSlice";
import { SearchResult, searchService } from "../services/searchService";
import { ChildUtils } from "../utils/childUtils";

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const {
    currentUser,
    loading: userLoading,
    error: userError,
  } = useAppSelector((state) => state.user);
  const { children, loading: childrenLoading, error: childrenError } = useAppSelector(
    (state) => state.children
  );
  const { familyGroups, loading: familyLoading, error: familyError } = useAppSelector(
    (state) => state.family
  );

  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [childrenExpanded, setChildrenExpanded] = useState(false);
  const [familyGroupsExpanded, setFamilyGroupsExpanded] = useState(false);
  
  // Search state
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Fetch current user data on component mount
  useEffect(() => {
    if (user) {
      dispatch(fetchCurrentUser(user.id));
      dispatch(fetchChildren());
      dispatch(fetchFamilyGroups());
    }
  }, [dispatch, user]);

  // Handle search
  const handleSearch = async (query: string) => {
    if (query.trim().length === 0) {
      setShowSearchResults(false);
      setSearchResults([]);
      return;
    }

    if (query.trim().length < 2) {
      return;
    }

    setSearchLoading(true);
    setShowSearchResults(true);

    try {
      const results = await searchService.search(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle children errors using the shared utility
  useEffect(() => {
    ChildUtils.handleChildrenError(childrenError, dispatch);
  }, [childrenError, dispatch]);

  // Show error alerts for other errors
  useEffect(() => {
    if (familyError) {
      Alert.alert('Error', familyError);
    }
    if (userError) {
      Alert.alert("Error", userError);
    }
  }, [familyError, userError]);

  // Refresh children when add child modal closes (in case a child was added)
  useEffect(() => {
    if (!showAddChildModal && user) {
      // Small delay to ensure the modal animation completes
      const timer = setTimeout(() => {
        dispatch(fetchChildren());
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showAddChildModal, dispatch, user]);

  // Use utility functions for child-related logic
  const validChildren = ChildUtils.getValidChildren(children);
  const hasChildren = ChildUtils.hasChildren(children);
  const childrenCount = ChildUtils.getChildrenCount(children);
  const isChildrenStillLoading = ChildUtils.isChildrenLoading(childrenLoading, children);
  const addChildButtonText = ChildUtils.getAddChildButtonText(hasChildren);
  const welcomeMessage = ChildUtils.getWelcomeMessage(hasChildren);

  // Family groups logic
  const hasFamilyGroups = familyGroups && familyGroups.length > 0;
  const familyGroupsCount = familyGroups?.length || 0;

  // Show loading spinner while fetching user data
  if (userLoading && !currentUser) {
    return (
      <View style={{ flex: 1 }}>
        <AppHeader
          title="Home"
          onSearchChange={handleSearch}
          searchPlaceholder="Search memories"
          showBackButton={false}
          showForwardButton={false}
          showTitle={false}
        />
        <LoadingSpinner message="Loading your profile..." />
      </View>
    );
  }

  // UI for children section
  const renderChildrenSection = () => {
    // Show loading state
    if (isChildrenStillLoading) {
      return (
        <View style={styles.childrenSection}>
          <Text style={styles.sectionTitle}>Your Babies</Text>
          <Text style={styles.loadingText}>Loading your children...</Text>
        </View>
      );
    }

    // Show error state with retry button
    if (childrenError) {
      return (
        <View style={styles.childrenSection}>
          <Text style={styles.sectionTitle}>Your Babies</Text>
          <TouchableOpacity
            style={[styles.groupButton, { backgroundColor: '#fef2f2' }]}
            onPress={() => {
              dispatch(fetchChildren());
            }}
          >
            <Text style={[styles.groupButtonText, { color: '#dc2626' }]}>
              Error loading children. Tap to retry.
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Calculate displayed children (max 2 unless expanded)
    const displayedChildren = childrenExpanded ? validChildren : validChildren.slice(0, 2);
    const hasMoreChildren = validChildren.length > 2;

    // Show children section (with or without children)
    return (
      <View style={styles.childrenSection}>
        <Text style={styles.sectionTitle}>Your Babies {hasChildren ? `(${childrenCount})` : ''}</Text>
        
        {/* Show children if any exist */}
        {hasChildren && (
          <>
            {displayedChildren.map((child, index) => (
              <TouchableOpacity
                key={`child-${child.id}-${index}`}
                style={styles.childCard}
                onPress={() => ChildUtils.handleChildCardPress(child.id, child.name)}
              >
                <ChildProfileCard
                  key={child.id}
                  avatarUrl={child.avatarUrl}
                  name={child.name}
                  birthdate={child.birthdate}
                />
              </TouchableOpacity>
            ))}
            
            {/* Show expand/collapse button if there are more than 2 children */}
            {hasMoreChildren && (
              <TouchableOpacity
                style={styles.seeMoreButton}
                onPress={() => setChildrenExpanded(!childrenExpanded)}
              >
                <MaterialIcons 
                  name={childrenExpanded ? "expand-less" : "expand-more"} 
                  size={24} 
                  color="#3b4cca" 
                />
                <Text style={styles.seeMoreText}>
                  {childrenExpanded 
                    ? ''
                    : `${validChildren.length - 2}`
                  }
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
        
        {/* Show welcome message when no children */}
        {!hasChildren && (
          <Text style={styles.emptyStateText}>{welcomeMessage}</Text>
        )}
        
        {/* Action buttons */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => ChildUtils.handleAddChildPress(dispatch, hasChildren, () => setShowAddChildModal(true))}
          >
            <Text style={styles.quickActionText}>{addChildButtonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // UI for family groups section
  const renderFamilyGroupsSection = () => {
    // Show loading state
    if (familyLoading) {
      return (
        <View style={styles.familyGroupsSection}>
          <Text style={styles.sectionTitle}>Your Family Groups</Text>
          <Text style={styles.loadingText}>Loading family groups...</Text>
        </View>
      );
    }

    // Show error state with retry button
    if (familyError) {
      return (
        <View style={styles.familyGroupsSection}>
          <Text style={styles.sectionTitle}>Your Family Groups</Text>
          <TouchableOpacity
            style={[styles.groupButton, { backgroundColor: '#fee' }]}
            onPress={() => {
              dispatch(fetchFamilyGroups());
            }}
          >
            <Text style={[styles.groupButtonText, { color: '#c00' }]}>
              Error loading family groups. Tap to retry.
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Show family groups if any exist
    if (hasFamilyGroups) {
      // Calculate displayed family groups (max 2 unless expanded)
      const displayedGroups = familyGroupsExpanded ? familyGroups : familyGroups.slice(0, 2);
      const hasMoreGroups = familyGroups.length > 2;

      return (
        <View style={styles.familyGroupsSection}>
          <Text style={styles.sectionTitle}>Your Family Groups ({familyGroupsCount})</Text>
          
          {displayedGroups.map((group, index) => (
            <TouchableOpacity
              key={`family-group-${group.id}-${index}`}
              onPress={() => {
                // For now, just show an alert since the family detail page doesn't exist yet
                Alert.alert(
                  group.name,
                  `Family Group Details\n\nMembers: ${group.members?.length || 0}\nDescription: ${group.description || 'No description'}\n\nFamily group detail page coming soon!`,
                  [
                    { text: "OK" },
                    { 
                      text: "Edit Group", 
                      onPress: () => router.push(`/family/edit/${group.id}`) 
                    }
                  ]
                );
              }}
            >
              <FamilyGroupCard
                name={group.name}
                avatarUrl={group.avatarUrl}
                description={group.description}
                memberCount={group.members?.length}
                subtitle={index === 0 ? "Primary Family Group" : "Family Group"}
              />
            </TouchableOpacity>
          ))}
          
          {/* Show expand/collapse button if there are more than 2 groups */}
          {hasMoreGroups && (
            <TouchableOpacity
              style={styles.seeMoreButton}
              onPress={() => setFamilyGroupsExpanded(!familyGroupsExpanded)}
            >
              <MaterialIcons 
                name={familyGroupsExpanded ? "expand-less" : "expand-more"} 
                size={24} 
                color="#3b4cca" 
              />
              <Text style={styles.seeMoreText}>
                {familyGroupsExpanded 
                  ? '' 
                  : `${familyGroups.length - 2}`
                }
              </Text>
            </TouchableOpacity>
          )}
          
          {/* Action buttons */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => router.push("/family/create")}
            >
              <Text style={styles.quickActionText}>+ Add Group</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => router.push("/family/invite-join")}
            >
              <Text style={styles.quickActionText}>Invite & Join</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // Show create/join button when no family groups
    return (
      <View style={styles.familyGroupsSection}>
        <Text style={styles.sectionTitle}>Your Family Groups</Text>
        <TouchableOpacity
          style={styles.groupButton}
          onPress={() => router.push("/family/create")}
        >
          <Text style={styles.groupButtonText}>
            Create or Join Family Group
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Main content based on whether search is active
  const renderMainContent = () => {
    if (showSearchResults) {
      return (
        <SearchResults
          results={searchResults}
          loading={searchLoading}
          emptyMessage="No results found. Try searching for your child&apos;s name, milestones, or family activities."
        />
      );
    }

    return (
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Card */}
        <UserProfileCard
          userId={user?.id ?? ''}
          firstName={currentUser?.firstName || user?.firstName}
          lastName={currentUser?.lastName || user?.lastName}
          avatar={currentUser?.avatar}
          onEditPress={() => setShowEditModal(true)}
        />

        <Text style={styles.welcomeTitle}>
          Welcome
          {currentUser?.firstName || user?.firstName
            ? `, ${currentUser?.firstName || user?.firstName}`
            : ""}
          !
        </Text>
        
        {/* <Text style={styles.welcomeSubtitle}>
          Ready to track your family&apos;s precious moments
        </Text> */}

        {/* Children Section */}
        {renderChildrenSection()}
        
        {/* Family Groups Section */}
        {renderFamilyGroupsSection()}
      </ScrollView>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={80}
    >
      {/* Enhanced Header */}
      <AppHeader
        title="Home"
        onSearchChange={handleSearch}
        searchPlaceholder="Search memories"
        showBackButton={false}
        showForwardButton={false}
        showTitle={false}
      />

      {/* Main Content */}
      {renderMainContent()}

      {/* Modals */}
      <UserProfileEditModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        user={user as any}
        currentUser={currentUser || undefined}
        loading={userLoading}
        error={userError}
      />

      <AddChildModal
        visible={showAddChildModal}
        onClose={() => setShowAddChildModal(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    paddingBottom: 80,
    backgroundColor: "#fff",
    flexGrow: 1,
    alignItems: "center",
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 8,
    textAlign: "center",
  },
  // welcomeSubtitle: {
  //   fontSize: 16,
  //   color: "#666",
  //   marginBottom: 24,
  //   textAlign: "center",
  // },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
  },
  childrenSection: {
    width: "100%",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  familyGroupsSection: {
    width: "100%",
    backgroundColor: "#f0f7ff",
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
    marginBottom: 7,
    borderWidth: 1,
    borderColor: "#e0e7ff",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    padding: 16,
  },
  primaryButton: {
    backgroundColor: "#4f8cff",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 18,
    marginBottom: 8,
    alignItems: "center",
    width: "100%",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  groupButton: {
    backgroundColor: "#e0e7ff",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 4,
    marginBottom: 4,
    alignItems: "center",
    width: "100%",
  },
  groupButtonText: {
    color: "#3b4cca",
    fontSize: 16,
    fontWeight: "bold",
  },
  childCard: {
    width: "100%",
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 0,
    marginBottom: 40,
    width: '100%',
  },
  quickActionButton: {
    backgroundColor: '#e0e7ff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  quickActionText: {
    color: '#3b4cca',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    padding: 16,
  },
  seeMoreButton: {
    backgroundColor: '#e0e7ff',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginTop: -10,
    alignSelf: 'flex-end',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  seeMoreText: {
    color: '#3b4cca',
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 3,
  },
});
