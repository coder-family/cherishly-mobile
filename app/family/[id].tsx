import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AddChildToGroupModal from '../components/family/AddChildToGroupModal';
import EditFamilyGroupModal from '../components/family/EditFamilyGroupModal';
import FamilyGroupPermissions from '../components/family/FamilyGroupPermissions';
import InvitationQRModal from '../components/family/InvitationQRModal';
import InviteMemberModal from '../components/family/InviteMemberModal';
import PendingInvitationsModal from '../components/family/PendingInvitationsModal';
import TimelinePost from '../components/family/TimelinePost';

import AppHeader from '../components/layout/AppHeader';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchFamilyGroup } from '../redux/slices/familySlice';
import * as familyService from '../services/familyService';

type TabType = "children" | "timeline" | "members" | "edit";

export default function FamilyGroupDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const dispatch = useAppDispatch();
  
  const { currentGroup, loading, error } = useAppSelector((state) => state.family);
  const { user } = useAppSelector((state) => state.auth);
  
  const [activeTab, setActiveTab] = useState<TabType>("children");
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [showEditGroupModal, setShowEditGroupModal] = useState(false);
  const [showInviteMemberModal, setShowInviteMemberModal] = useState(false);
  const [showPendingInvitationsModal, setShowPendingInvitationsModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [invitationData, setInvitationData] = useState<{
    token: string;
    groupName: string;
    role: string;
    expiresAt: string;
  } | null>(null);
  const [groupChildren, setGroupChildren] = useState<any[]>([]);
  const [loadingChildren, setLoadingChildren] = useState(false);
  const [timelinePosts, setTimelinePosts] = useState<any[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [timelinePage, setTimelinePage] = useState(1);
  const [hasMoreTimeline, setHasMoreTimeline] = useState(true);

  // Search state
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Fetch family group data
  useEffect(() => {
    if (id) {
      dispatch(fetchFamilyGroup(id as string));
    }
  }, [id, dispatch]);

  // Fetch children in the group
  const fetchGroupChildren = async () => {
    if (!currentGroup?.id) return;
    setLoadingChildren(true);
    try {
      const response: any = await familyService.getFamilyGroupChildren(currentGroup.id);
      const children = response.children || response;
      setGroupChildren(children);
      console.log("Group children:", children);
    } catch (error) {
      console.error("Error fetching group children:", error);
      setGroupChildren([]);
    } finally {
      setLoadingChildren(false);
    }
  };

  // Fetch timeline posts
  const fetchTimelinePosts = async () => {
    if (!currentGroup?.id) return;
    setLoadingTimeline(true);
    try {
      const response = await familyService.getFamilyGroupTimeline(currentGroup.id, timelinePage);
      if (timelinePage === 1) {
        setTimelinePosts(response.timeline || []);
      } else {
        setTimelinePosts(prevPosts => [...prevPosts, ...(response.timeline || [])]);
      }
      setHasMoreTimeline(response.pagination?.hasMore || false);
      console.log("Timeline response:", response);
      console.log("Permissions:", response.permissions);
    } catch (error) {
      console.error("Error fetching timeline posts:", error);
      setTimelinePosts([]);
    } finally {
      setLoadingTimeline(false);
    }
  };

  // Fetch children when tab is active
  useEffect(() => {
    if (activeTab === "children") {
      fetchGroupChildren();
    }
  }, [activeTab, currentGroup?.id]);

  // Fetch timeline when tab is active
  useEffect(() => {
    if (activeTab === "timeline") {
      setTimelinePage(1);
      setHasMoreTimeline(true);
      setTimelinePosts([]);
      fetchTimelinePosts();
    }
  }, [activeTab, currentGroup?.id]);

  // Handle child press
  const handleChildPress = (childId: string) => {
    router.push(`/children/${childId}/profile`);
  };

  // Handle reaction press
  const handleReactionPress = (reactionType: string) => {
    console.log('Reaction pressed:', reactionType);
    // TODO: Call API to add reaction
  };

  // Handle comment press
  const handleCommentPress = () => {
    console.log("Comment pressed");
  };

  const handleQRButtonPress = () => {
    // For demo purposes, create mock invitation data
    setInvitationData({
      token: 'demo123456789012345678901234567890',
      groupName: currentGroup?.name || 'Family Group',
      role: 'parent',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
    setShowQRModal(true);
  };

  // Render children section
  const renderChildrenSection = () => {
    if (loadingChildren) {
      return (
        <View style={styles.sectionPlaceholder}>
          <LoadingSpinner message="Loading children..." />
        </View>
      );
    }

    if (!groupChildren || groupChildren.length === 0) {
      return (
        <View style={styles.sectionPlaceholder}>
          <MaterialIcons name="child-care" size={48} color="#ccc" />
          <Text style={styles.placeholderText}>
            No children in this group yet
          </Text>
          <Text style={styles.placeholderSubtext}>
            Add children to see them here
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.childrenContainer}>
        <Text style={styles.sectionTitle}>
          Children ({groupChildren.length})
        </Text>
        <ScrollView style={styles.childrenList} showsVerticalScrollIndicator={false}>
          {groupChildren.map((child) => (
            <TouchableOpacity
              key={child.id || child._id}
              style={styles.childCard}
              onPress={() => handleChildPress(child.id || child._id)}
            >
              <View style={styles.childInfo}>
                {child.avatarUrl || child.avatar ? (
                  <View style={styles.childAvatar}>
                    <Image
                      source={{ uri: child.avatarUrl || child.avatar }}
                      style={styles.childAvatarImage}
                    />
                  </View>
                ) : (
                  <View style={styles.childAvatarPlaceholder}>
                    <MaterialIcons name="child-care" size={24} color="#4f8cff" />
                  </View>
                )}
                <View style={styles.childDetails}>
                  <Text style={styles.childName}>
                    {child.name || `${child.firstName} ${child.lastName}`}
                  </Text>
                  <Text style={styles.childInfo}>
                    {child.birthdate || child.dateOfBirth ? 
                      `Born: ${new Date(child.birthdate || child.dateOfBirth).toLocaleDateString()}` : 
                      'Birthdate not set'
                    }
                  </Text>
                  <Text style={styles.childInfo}>
                    {child.gender || 'Gender not set'}
                  </Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#ccc" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  // Render timeline section
  const renderTimelineSection = () => {
    console.log("Rendering timeline section:", { 
      loadingTimeline, 
      timelinePostsLength: timelinePosts?.length,
      timelinePosts 
    });
    
    if (loadingTimeline) {
      return (
        <View style={styles.sectionPlaceholder}>
          <LoadingSpinner message="Loading timeline..." />
        </View>
      );
    }

    if (!timelinePosts || timelinePosts.length === 0) {
      return (
        <View style={styles.sectionPlaceholder}>
          <MaterialIcons name="timeline" size={48} color="#ccc" />
          <Text style={styles.placeholderText}>
            No posts in timeline yet
          </Text>
          <Text style={styles.placeholderSubtext}>
            Public posts from children will appear here
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.timelineContainer}>
        <Text style={styles.sectionTitle}>
          Timeline ({timelinePosts.length} posts)
        </Text>
        <ScrollView style={styles.timelineList} showsVerticalScrollIndicator={false}>
          {timelinePosts.map((post) => (
            <TimelinePost
              key={post._id || post.id}
              post={post}
              onReactionPress={handleReactionPress}
              onCommentPress={handleCommentPress}
            />
          ))}
        </ScrollView>
      </View>
    );
  };

  // Render members section
  const renderMembersSection = () => {
    if (!currentGroup?.members) {
      return (
        <View style={styles.sectionPlaceholder}>
          <Text style={styles.placeholderText}>No members found</Text>
        </View>
      );
    }

    return (
      <View style={styles.membersContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Members ({currentGroup.members.length})
          </Text>
          <View style={styles.memberActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowPendingInvitationsModal(true)}
            >
              <MaterialIcons name="email" size={16} color="#666" />
              <Text style={styles.actionButtonText}>Pending</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleQRButtonPress}
            >
              <MaterialIcons name="qr-code" size={16} color="#666" />
              <Text style={styles.actionButtonText}>QR</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.inviteButton}
              onPress={() => setShowInviteMemberModal(true)}
            >
              <MaterialIcons name="person-add" size={20} color="#4f8cff" />
              <Text style={styles.inviteButtonText}>Invite</Text>
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView style={styles.membersList} showsVerticalScrollIndicator={false}>
          {currentGroup.members.map((member: any) => (
            <View key={member.id || member._id} style={styles.memberCard}>
              <View style={styles.memberInfo}>
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberAvatarText}>
                    {member.user?.firstName?.charAt(0).toUpperCase() || 
                     member.user?.lastName?.charAt(0).toUpperCase() || 
                     'U'}
                  </Text>
                </View>
                <View style={styles.memberDetails}>
                  <Text style={styles.memberName}>
                    {member.user ? `${member.user.firstName} ${member.user.lastName}` : 'Unknown'}
                  </Text>
                  <Text style={styles.memberRole}>
                    {member.role === 'admin' ? 'Admin' : 
                     member.role === 'owner' ? 'Owner' : 'Member'}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  // Render edit section
  const renderEditSection = () => {
    const isOwner = currentGroup?.ownerId === user?.id;
    const isAdmin = currentGroup?.members?.some((member: any) => 
      member.userId === user?.id && (member.role === 'admin' || member.role === 'owner')
    );

    return (
      <View style={styles.editContainer}>
        {/* Permissions and Role Information */}
        <FamilyGroupPermissions 
          currentGroup={currentGroup}
          currentUser={user}
        />

        {/* Edit Group Settings (only for owners and admins) */}
        {(isOwner || isAdmin) && (
          <View style={styles.editSettingsSection}>
            <Text style={styles.sectionTitle}>Group Settings</Text>
            
            <View style={styles.editCard}>
              <View style={styles.editInfo}>
                <Text style={styles.editLabel}>Group Name</Text>
                <Text style={styles.editValue}>{currentGroup?.name}</Text>
              </View>
              
              <View style={styles.editInfo}>
                <Text style={styles.editLabel}>Description</Text>
                <Text style={styles.editValue}>
                  {currentGroup?.description || 'No description'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setShowEditGroupModal(true)}
            >
              <MaterialIcons name="edit" size={20} color="#fff" />
              <Text style={styles.editButtonText}>Edit Group Settings</Text>
            </TouchableOpacity>


          </View>
        )}

        {/* Access Denied Message */}
        {!isOwner && !isAdmin && (
          <View style={styles.sectionPlaceholder}>
            <MaterialIcons name="lock" size={48} color="#ccc" />
            <Text style={styles.placeholderText}>
              Only group owners and admins can edit this group
            </Text>
            <Text style={styles.placeholderSubtext}>
              Contact the group owner to request admin privileges
            </Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1 }}>
        <AppHeader
          title="Family Group"
          onSearchChange={() => {}}
          searchPlaceholder="Search family group"
          showBackButton={true}
          showForwardButton={false}
          showTitle={false}
          showLogoutButton={true}
        />
        <LoadingSpinner message="Loading family group..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1 }}>
        <AppHeader
          title="Family Group"
          onSearchChange={() => {}}
          searchPlaceholder="Search family group"
          showBackButton={true}
          showForwardButton={false}
          showTitle={false}
          showLogoutButton={true}
        />
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={48} color="#e74c3c" />
          <Text style={styles.errorText}>Error loading family group</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
        </View>
      </View>
    );
  }

  if (!currentGroup) {
    return (
      <View style={{ flex: 1 }}>
        <AppHeader
          title="Family Group"
          onSearchChange={() => {}}
          searchPlaceholder="Search family group"
          showBackButton={true}
          showForwardButton={false}
          showTitle={false}
          showLogoutButton={true}
        />
        <View style={styles.errorContainer}>
          <MaterialIcons name="group" size={48} color="#ccc" />
          <Text style={styles.errorText}>Family group not found</Text>
        </View>
      </View>
    );
  }

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
      // Search within family group - placeholder for now
      setSearchResults([]);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <AppHeader
        title={currentGroup.name || "Family Group"}
        onSearchChange={handleSearch}
        searchPlaceholder={`Search in ${currentGroup.name || 'family group'}...`}
        showBackButton={true}
        showForwardButton={false}
        showTitle={false}
        showLogoutButton={true}
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "children" && styles.activeTab]}
            onPress={() => setActiveTab("children")}
          >
            <MaterialIcons 
              name="child-care" 
              size={20} 
              color={activeTab === "children" ? "#4f8cff" : "#666"} 
            />
            <Text style={[styles.tabText, activeTab === "children" && styles.activeTabText]}>
              Children
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "timeline" && styles.activeTab]}
            onPress={() => setActiveTab("timeline")}
          >
            <MaterialIcons 
              name="timeline" 
              size={20} 
              color={activeTab === "timeline" ? "#4f8cff" : "#666"} 
            />
            <Text style={[styles.tabText, activeTab === "timeline" && styles.activeTabText]}>
              Timeline
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "members" && styles.activeTab]}
            onPress={() => setActiveTab("members")}
          >
            <MaterialIcons 
              name="people" 
              size={20} 
              color={activeTab === "members" ? "#4f8cff" : "#666"} 
            />
            <Text style={[styles.tabText, activeTab === "members" && styles.activeTabText]}>
              Members
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "edit" && styles.activeTab]}
            onPress={() => setActiveTab("edit")}
          >
            <MaterialIcons 
              name="edit" 
              size={20} 
              color={activeTab === "edit" ? "#4f8cff" : "#666"} 
            />
            <Text style={[styles.tabText, activeTab === "edit" && styles.activeTabText]}>
              Edit
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === "children" && (
            <View style={styles.childrenSection}>
              {renderChildrenSection()}
              
              {/* Add Child Button */}
              <TouchableOpacity
                style={styles.addChildButton}
                onPress={() => setShowAddChildModal(true)}
              >
                <MaterialIcons name="add" size={24} color="#fff" />
                <Text style={styles.addChildButtonText}>Add Child to Group</Text>
              </TouchableOpacity>
            </View>
          )}

          {activeTab === "timeline" && renderTimelineSection()}
          {activeTab === "members" && renderMembersSection()}
          {activeTab === "edit" && renderEditSection()}
        </View>
      </ScrollView>

      <AddChildToGroupModal
        visible={showAddChildModal}
        onClose={() => setShowAddChildModal(false)}
        familyGroupId={currentGroup.id}
        familyGroupName={currentGroup.name}
      />

      <InviteMemberModal
        visible={showInviteMemberModal}
        onClose={() => setShowInviteMemberModal(false)}
        groupId={currentGroup.id}
        groupName={currentGroup.name}
      />

      <PendingInvitationsModal
        visible={showPendingInvitationsModal}
        onClose={() => setShowPendingInvitationsModal(false)}
        groupId={currentGroup.id}
        groupName={currentGroup.name}
      />

      {invitationData && (
        <InvitationQRModal
          visible={showQRModal}
          onClose={() => setShowQRModal(false)}
          invitationData={invitationData}
        />
      )}

      <EditFamilyGroupModal
        visible={showEditGroupModal}
        onClose={() => {
          setShowEditGroupModal(false);
          // Refresh family group data after edit
          if (id) {
            dispatch(fetchFamilyGroup(id as string));
          }
        }}
        familyGroup={currentGroup}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 16,
    borderRadius: 12,
    margin: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e0e7ff",
    alignItems: "center",
    justifyContent: "center",
  },
  groupInfo: {
    alignItems: "center",
  },
  groupName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 22,
  },
  creatorInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  creatorText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  creatorAvatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  memberCount: {
    flexDirection: "row",
    alignItems: "center",
  },
  memberCountText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  adminActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginLeft: 4,
  },
  sectionPlaceholder: {
    backgroundColor: "#fff",
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
  },
  placeholderSubtext: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    textAlign: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: "#4f8cff",
    fontWeight: "600",
    marginLeft: 4,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#e0e7ff",
  },
  tabText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
    marginTop: 4,
  },
  activeTabText: {
    color: "#4f8cff",
    fontWeight: "600",
  },
  tabContent: {
    flex: 1,
  },
  ownerInfo: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
    fontStyle: "italic",
  },
  addChildButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4f8cff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 16,
    alignSelf: "center",
  },
  addChildButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  childCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  childInfo: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  childAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e0e7ff",
    alignItems: "center",
    justifyContent: "center",
  },
  childAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  childAvatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4f8cff",
  },
  childAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e0e7ff",
    alignItems: "center",
    justifyContent: "center",
  },
  childName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  childDetails: {
    flex: 1,
    marginLeft: 12,
  },
  childrenContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  childrenList: {
    // No specific styles needed for ScrollView, it handles its own content
  },
  timelinePost: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    padding: 16,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  postChildInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  postChildAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  postChildAvatarPlaceholder: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#e0e7ff",
    alignItems: "center",
    justifyContent: "center",
  },
  postChildDetails: {
    flexDirection: "column",
  },
  postChildName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  postDate: {
    fontSize: 12,
    color: "#666",
  },
  postTypeBadge: {
    backgroundColor: "#e0e7ff",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  postTypeText: {
    fontSize: 12,
    color: "#4f8cff",
    fontWeight: "600",
  },
  postContent: {
    marginTop: 8,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  postText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  timelineContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  timelineList: {
    // No specific styles needed for ScrollView, it handles its own content
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  tag: {
    backgroundColor: "#e0e7ff",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 5,
    marginRight: 4,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: "#4f8cff",
    fontWeight: "600",
  },
  responseContainer: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f0f7ff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d0e3ff",
  },
  responseLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  responseText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  attachmentsContainer: {
    marginTop: 8,
  },
  attachmentItem: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
    overflow: "hidden",
  },
  attachmentImage: {
    width: "100%",
    height: "100%",
  },
  mediaContainer: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f0f7ff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d0e3ff",
  },
  reactionsContainer: {
    flexDirection: "row",
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f0f7ff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d0e3ff",
    position: 'relative',
  },
  reactionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  reactionIcon: {
    fontSize: 16,
  },
  defaultReactionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'transparent',
  },
  defaultReactionIcon: {
    fontSize: 16,
    color: '#666',
  },
  reactionMenuContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  reactionMenu: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 200,
    minHeight: 60,
  },
  reactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reactionSummaryInline: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  reactionSummaryText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#333',
    marginTop: 10,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
    textAlign: 'center',
  },
  childrenSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  membersContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  membersList: {
    // No specific styles needed for ScrollView, it handles its own content
  },
  memberCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  memberInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e0e7ff",
    alignItems: "center",
    justifyContent: "center",
  },
  memberAvatarText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4f8cff",
  },
  memberDetails: {
    marginLeft: 12,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  memberRole: {
    fontSize: 12,
    color: "#666",
  },
  editContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  editCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  editInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  editLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  editValue: {
    fontSize: 14,
    color: "#1a1a1a",
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4f8cff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "center",
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  editSettingsSection: {
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  inviteButtonText: {
    fontSize: 14,
    color: '#4f8cff',
    fontWeight: '600',
    marginLeft: 4,
  },
  memberActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
});
