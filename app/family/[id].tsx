import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import ErrorView from '../components/ui/ErrorView';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchFamilyGroup } from '../redux/slices/familySlice';

type TabType = 'children' | 'timeline' | 'members' | 'edit';

export default function FamilyGroupDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { currentGroup, loading, error } = useAppSelector((state) => state.family);
  const { user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState<TabType>('children');

  useEffect(() => {
    if (id) {
      dispatch(fetchFamilyGroup(id));
    }
  }, [id, dispatch]);

  if (loading) {
    return <LoadingSpinner message="Loading family group..." />;
  }

  if (error) {
    return (
      <ErrorView 
        message={error}
        onRetry={() => dispatch(fetchFamilyGroup(id!))}
      />
    );
  }

  if (!currentGroup) {
    return (
      <ErrorView 
        message="Family group not found"
        onRetry={() => dispatch(fetchFamilyGroup(id!))}
      />
    );
  }

  const isOwner = currentGroup.ownerId === user?.id;
  const currentMember = currentGroup.members.find(member => member.userId === user?.id);
  const isAdmin = isOwner || currentMember?.role === 'admin';

  return (
    <ScreenWrapper>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#4f8cff" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {currentGroup.avatarUrl ? (
              <Image source={{ uri: currentGroup.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <MaterialIcons name="family-restroom" size={48} color="#4f8cff" />
              </View>
            )}
          </View>
          
          <View style={styles.groupInfo}>
            <Text style={styles.groupName}>{currentGroup.name}</Text>
            {currentGroup.description && (
              <Text style={styles.description}>{currentGroup.description}</Text>
            )}
            
            <View style={styles.creatorInfo}>
              {(() => {
                // Since ownerId is undefined, use the first member (admin) as creator
                const creator = currentGroup.members[0];
                
                // If we have user info from backend populate
                if (creator?.user?.firstName) {
                  return (
                    <>
                      {creator.user.avatarUrl ? (
                        <Image source={{ uri: creator.user.avatarUrl }} style={styles.creatorAvatar} />
                      ) : (
                        <MaterialIcons name="person" size={16} color="#666" />
                      )}
                      <Text style={styles.creatorText}>
                        Created by {`${creator.user.firstName} ${creator.user.lastName || ''}`.trim()}
                      </Text>
                    </>
                  );
                }
                
                // Fallback: show ID if no user info
                return (
                  <>
                    <MaterialIcons name="person" size={16} color="#666" />
                    <Text style={styles.creatorText}>
                      Created by {creator?.userId ? `User ${creator.userId.slice(-6)}` : 'Unknown'}
                    </Text>
                  </>
                );
              })()}
            </View>
            
            <View style={styles.memberCount}>
              <MaterialIcons name="group" size={16} color="#666" />
              <Text style={styles.memberCountText}>
                {currentGroup.members.length} {currentGroup.members.length === 1 ? 'member' : 'members'}
              </Text>
            </View>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'children' && styles.activeTab]}
            onPress={() => setActiveTab('children')}
          >
            <MaterialIcons 
              name="child-care" 
              size={20} 
              color={activeTab === 'children' ? '#4f8cff' : '#666'} 
            />
            <Text style={[styles.tabText, activeTab === 'children' && styles.activeTabText]}>
              Children
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'timeline' && styles.activeTab]}
            onPress={() => setActiveTab('timeline')}
          >
            <MaterialIcons 
              name="timeline" 
              size={20} 
              color={activeTab === 'timeline' ? '#4f8cff' : '#666'} 
            />
            <Text style={[styles.tabText, activeTab === 'timeline' && styles.activeTabText]}>
              Timeline
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'members' && styles.activeTab]}
            onPress={() => setActiveTab('members')}
          >
            <MaterialIcons 
              name="group" 
              size={20} 
              color={activeTab === 'members' ? '#4f8cff' : '#666'} 
            />
            <Text style={[styles.tabText, activeTab === 'members' && styles.activeTabText]}>
              Members
            </Text>
          </TouchableOpacity>

          {isAdmin && (
            <TouchableOpacity
              style={[styles.tab, activeTab === 'edit' && styles.activeTab]}
              onPress={() => setActiveTab('edit')}
            >
              <MaterialIcons 
                name="edit" 
                size={20} 
                color={activeTab === 'edit' ? '#4f8cff' : '#666'} 
              />
              <Text style={[styles.tabText, activeTab === 'edit' && styles.activeTabText]}>
                Edit
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'children' && (
            <View style={styles.sectionPlaceholder}>
              <Text style={styles.sectionTitle}>Children</Text>
              <Text style={styles.placeholderText}>Children list will be implemented next</Text>
            </View>
          )}

          {activeTab === 'timeline' && (
            <View style={styles.sectionPlaceholder}>
              <Text style={styles.sectionTitle}>Timeline</Text>
              <Text style={styles.placeholderText}>Timeline will be implemented next</Text>
            </View>
          )}

          {activeTab === 'members' && (
            <View style={styles.sectionPlaceholder}>
              <Text style={styles.sectionTitle}>Members</Text>
              <Text style={styles.placeholderText}>Members list will be implemented next</Text>
            </View>
          )}

          {activeTab === 'edit' && isAdmin && (
            <View style={styles.sectionPlaceholder}>
              <Text style={styles.sectionTitle}>Edit Group</Text>
              <Text style={styles.placeholderText}>Edit group features will be implemented next</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 16,
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: {
    alignItems: 'center',
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
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupInfo: {
    alignItems: 'center',
  },
  groupName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  creatorText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  creatorAvatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  memberCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberCountText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  adminActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e7ff',
    minWidth: 120,
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#4f8cff',
    fontWeight: '600',
    marginLeft: 4,
  },
  sectionPlaceholder: {
    backgroundColor: '#fff',
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4f8cff',
    fontWeight: '600',
    marginLeft: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#e0e7ff',
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginTop: 4,
  },
  activeTabText: {
    color: '#4f8cff',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
  },
}); 