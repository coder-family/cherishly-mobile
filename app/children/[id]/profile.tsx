import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import AddMemoryModal from '../../components/child/AddMemoryModal';
import EditMemoryModal from '../../components/child/EditMemoryModal';
import MemoryItem from '../../components/child/MemoryItem';
import AppHeader from '../../components/layout/AppHeader';
import ErrorView from '../../components/ui/ErrorView';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ModalConfirm from '../../components/ui/ModalConfirm';
import SearchResults from '../../components/ui/SearchResults';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { clearCurrentChild, fetchChild } from '../../redux/slices/childSlice';
import { clearMemories, deleteMemory, fetchMemories } from '../../redux/slices/memorySlice';
import { Memory } from '../../services/memoryService';
import { SearchResult, searchService } from '../../services/searchService';

type TabType = 'timeline' | 'health' | 'qa' | 'memories' | 'profile';

export default function ChildProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const { currentChild, loading, error } = useAppSelector((state) => state.children);
  const { memories, loading: memoriesLoading, error: memoriesError, hasMore } = useAppSelector((state) => state.memories);
  const { currentUser } = useAppSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState<TabType>('timeline');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showAddMemoryModal, setShowAddMemoryModal] = useState(false);

  // Edit/Delete state
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [showEditMemoryModal, setShowEditMemoryModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Retry loading memories
  const retryLoadMemories = useCallback(() => {
    if (id) {
      dispatch(clearMemories());
      dispatch(fetchMemories({ 
        childId: id, 
        page: 1, 
        limit: 50 // Increased to match initial load
      }));
    }
  }, [id, dispatch]);

  // Debug: Track when memories change
  useEffect(() => {
    // console.log('ChildProfile: Memories array changed:', {
    //   count: memories.length,
    //   firstMemory: memories[0] ? { id: memories[0].id, title: memories[0].title } : null,
    //   lastUpdate: new Date().toISOString()
    // });
  }, [memories]);

  // Fetch child data when component mounts
  useEffect(() => {
    if (id) {
      dispatch(fetchChild(id));
      // Fetch memories for this child, newest first - increased limit to show more memories
      dispatch(fetchMemories({ 
        childId: id, 
        page: 1, 
        limit: 50 // Increased from 10 to 50 to show more memories initially
      }));
    }
    
    // Cleanup when component unmounts
    return () => {
      dispatch(clearCurrentChild());
      dispatch(clearMemories());
    };
  }, [id, dispatch]);

  // Refresh memories when add memory modal closes
  useEffect(() => {
    if (!showAddMemoryModal && id) {
      // Small delay to ensure the modal animation completes
      const timer = setTimeout(() => {
        // Don't clear memories on modal close to preserve loaded data
        // Just refresh the first page to get any new memories
        dispatch(fetchMemories({ 
          childId: id, 
          page: 1, 
          limit: 50
        }));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showAddMemoryModal, dispatch, id]);

  // Auto-retry memories when switching to memories tab if there's an error
  useEffect(() => {
    if (activeTab === 'memories' && memoriesError && id) {
      // Small delay to avoid immediate retry
      const timer = setTimeout(() => {
        retryLoadMemories();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [activeTab, memoriesError, id, retryLoadMemories]);

  // Handle memory modal close
  const handleMemoryModalClose = () => {
    setShowAddMemoryModal(false);
  };

  // Ensure unique memories and create unique keys
  const getUniqueMemories = () => {
    const uniqueMemories = Array.from(
      new Map(memories.map(memory => [memory.id, memory])).values()
    );
    return uniqueMemories.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  // Create unique key for FlatList
  const keyExtractor = (item: any, index: number) => {
    return `memory-${item.id}-${index}`;
  };

  // Load more memories when scrolling
  const loadMoreMemories = () => {
    if (hasMore && !memoriesLoading && id) {
      const nextPage = Math.floor(memories.length / 50) + 1; // Updated to match new limit
      dispatch(fetchMemories({ 
        childId: id, 
        page: nextPage, 
        limit: 50 // Increased to match initial load
      }));
    }
  };

  // Handle memory actions
  const handleMemoryPress = (memory: any) => {
    // Navigate to memory detail screen (to be implemented)
    if (memory?.id) {
      // console.log('Memory pressed:', memory.id);
    } else {
      // console.log('Memory pressed: No ID available');
    }
  };

  const handleMemoryEdit = (memory: Memory) => {
    if (memory?.id) {
      setEditingMemory(memory);
      setShowEditMemoryModal(true);
    } else {
      // console.log('Edit memory: No ID available');
    }
  };

  const handleMemoryDelete = (memory: Memory) => {
    if (memory?.id) {
      setEditingMemory(memory);
      setShowDeleteConfirm(true);
    } else {
      // console.log('Delete memory: No ID available');
    }
  };

  const confirmDeleteMemory = async () => {
    if (!editingMemory?.id) return;
    
    try {
      await dispatch(deleteMemory(editingMemory.id)).unwrap();
      setShowDeleteConfirm(false);
      setEditingMemory(null);
      // No need to manually refetch, Redux will update the state automatically
    } catch (error: any) {
      console.error('Delete memory error:', error);
      let errorMessage = 'Failed to delete memory';
      
      if (error?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error?.status === 403) {
        errorMessage = 'You do not have permission to delete this memory.';
      } else if (error?.status === 404) {
        errorMessage = 'Memory not found. It may have already been deleted.';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    }
  };

  const handleMemoryLike = (memory: any) => {
    // Handle memory like (to be implemented)
    if (memory?.id) {
      // console.log('Like memory:', memory.id);
    } else {
      // console.log('Like memory: No ID available');
    }
  };

  const handleMemoryComment = (memory: any) => {
    // Handle memory comment (to be implemented)
    if (memory?.id) {
      // console.log('Comment on memory:', memory.id);
    } else {
      // console.log('Comment on memory: No ID available');
    }
  };

  // Handle search focused on current child
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
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
      // Search all content but prioritize current child
      const results = await searchService.search(query);
      
      // Filter and prioritize results for current child
      const childResults = results.filter(result => result.id === id);
      const otherResults = results.filter(result => result.id !== id);
      
      setSearchResults([...childResults, ...otherResults]);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    const prevPath = window.location.pathname;
    // console.log('Back button pressed from', prevPath);
  
    router.back();
  
    // Sau 300ms, nếu vẫn ở cùng trang, thì fallback về Home
    setTimeout(() => {
      const newPath = window.location.pathname;
      if (newPath === prevPath) {
        // console.log('No back history, fallback to /tabs/home');
        router.push('/tabs/home');
      } else {
        // console.log('Back successful to', newPath);
      }
    }, 300);
  };
  

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Helper function to get display name (Child interface only has combined name)
  const getDisplayName = (name: string) => {
    return name;
  };

  // Get age in a human-readable format
  const getAge = (birthdate: string) => {
    const birth = new Date(birthdate);
    const today = new Date();
    
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    
    if (months < 0 || (months === 0 && today.getDate() < birth.getDate())) {
      years--;
      months += 12;
    }
    
    if (months < 0) {
      months = 0;
    }
    
    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''} old`;
    } else if (months > 0) {
      return `${months} month${months > 1 ? 's' : ''} old`;
    } else {
      const days = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
      return `${days} day${days > 1 ? 's' : ''} old`;
    }
  };

  // Loading state
  if (loading) {
    return (
      <View style={{ flex: 1 }}>
        <AppHeader
          title="Child Profile"
          onBack={handleBack}
          onSearchChange={handleSearch}
          searchPlaceholder="Search for memories, milestones, health records..."
          showBackButton={true}
          canGoBack={true}
        />
        <LoadingSpinner message="Loading child profile..." />
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={{ flex: 1 }}>
        <AppHeader
          title="Child Profile"
          onBack={handleBack}
          onSearchChange={handleSearch}
          searchPlaceholder="Search for memories, milestones, health records..."
          showBackButton={true}
          canGoBack={true}
        />
        <ErrorView 
          message={error} 
          onRetry={() => id && dispatch(fetchChild(id))}
        />
      </View>
    );
  }

  // No child found
  if (!currentChild) {
    return (
      <View style={{ flex: 1 }}>
        <AppHeader
          title="Child Profile"
          onBack={handleBack}
          onSearchChange={handleSearch}
          searchPlaceholder="Search for memories, milestones, health records..."
          showBackButton={true}
          canGoBack={true}
        />
        <ErrorView 
          message="Child not found" 
          onRetry={() => id && dispatch(fetchChild(id))}
        />
      </View>
    );
  }

  // Main content based on whether search is active
  const renderMainContent = () => {
    if (showSearchResults) {
      return (
        <SearchResults
          results={searchResults}
          loading={searchLoading}
          emptyMessage={`No results found for "${searchQuery}". Try searching for milestones, health records, or memories.`}
        />
      );
    }

    // For memories tab, use a different layout to avoid ScrollView nesting
    if (activeTab === 'memories') {
      return (
        <View style={styles.container}>
          {/* Child Header */}
          <View style={styles.childHeader}>
            <View style={styles.childInfo}>
              {currentChild.avatarUrl ? (
                <Image source={{ uri: currentChild.avatarUrl }} style={styles.childAvatar} />
              ) : (
                <View style={styles.childAvatarPlaceholder}>
                  <MaterialIcons name="person" size={60} color="#ccc" />
                </View>
              )}
              <View style={styles.childDetails}>
                <Text style={styles.childName}>{getDisplayName(currentChild.name)}</Text>
                <Text style={styles.childAge}>{getAge(currentChild.birthdate)}</Text>
                <Text style={styles.childBirthdate}>Born {formatDate(currentChild.birthdate)}</Text>
                {currentChild.bio && (
                  <Text style={styles.childBio}>{currentChild.bio}</Text>
                )}
              </View>
            </View>
          </View>

          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            {[
              { key: 'timeline', label: 'Timeline', icon: 'timeline' },
              { key: 'health', label: 'Health', icon: 'medical-services' },
              { key: 'memories', label: 'Memories', icon: 'photo' },
              { key: 'qa', label: 'Q&A', icon: 'help' },
              { key: 'profile', label: 'Profile', icon: 'person' }
            ].map(tab => (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tabButton,
                  activeTab === tab.key && styles.activeTabButton
                ]}
                onPress={() => {
                  // console.log(`Tab pressed: ${tab.key}`);
                  setActiveTab(tab.key as TabType);
                }}
                activeOpacity={0.7}
                hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
              >
                <MaterialIcons
                  name={tab.icon as any}
                  size={20}
                  color={activeTab === tab.key ? '#4f8cff' : '#666'}
                />
                <Text style={[
                  styles.tabText,
                  activeTab === tab.key && styles.activeTabText
                ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Memories Content */}
          {renderMemoriesContent()}
        </View>
      );
    }

    // For other tabs, use ScrollView
    return (
      <ScrollView style={styles.container}>
        {/* Child Header */}
        <View style={styles.childHeader}>
          <View style={styles.childInfo}>
            {currentChild.avatarUrl ? (
              <Image source={{ uri: currentChild.avatarUrl }} style={styles.childAvatar} />
            ) : (
              <View style={styles.childAvatarPlaceholder}>
                <MaterialIcons name="person" size={60} color="#ccc" />
              </View>
            )}
            <View style={styles.childDetails}>
              <Text style={styles.childName}>{getDisplayName(currentChild.name)}</Text>
              <Text style={styles.childAge}>{getAge(currentChild.birthdate)}</Text>
              <Text style={styles.childBirthdate}>Born {formatDate(currentChild.birthdate)}</Text>
              {currentChild.bio && (
                <Text style={styles.childBio}>{currentChild.bio}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {[
            { key: 'timeline', label: 'Timeline', icon: 'timeline' },
            { key: 'health', label: 'Health', icon: 'medical-services' },
            { key: 'memories', label: 'Memories', icon: 'photo' },
            { key: 'qa', label: 'Q&A', icon: 'help' },
            { key: 'profile', label: 'Profile', icon: 'person' }
          ].map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabButton,
                activeTab === tab.key && styles.activeTabButton
              ]}
              onPress={() => {
                // Using a predefined list of valid tab keys to prevent log injection
                const validTabKeys = ['timeline', 'health', 'memories', 'qa', 'profile'];
                if (validTabKeys.includes(tab.key)) {
                  console.log(`Tab pressed: ${tab.key}`);
                  setActiveTab(tab.key as TabType);
                }
              }}
              activeOpacity={0.7}
              hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
            >
              <MaterialIcons
                name={tab.icon as any}
                size={20}
                color={activeTab === tab.key ? '#4f8cff' : '#666'}
              />
              <Text style={[
                styles.tabText,
                activeTab === tab.key && styles.activeTabText
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {renderTabContent()}
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <AppHeader
        title={currentChild ? `${getDisplayName(currentChild.name)}'s Profile` : 'Child Profile'}
        onBack={handleBack}
        onSearchChange={handleSearch}
        searchPlaceholder={`Search for ${currentChild ? getDisplayName(currentChild.name) : 'child'}'s memories, milestones, health records...`}
        showBackButton={true}
        canGoBack={true}
      />
      {renderMainContent()}
      {id && (
        <AddMemoryModal
          visible={showAddMemoryModal}
          onClose={handleMemoryModalClose}
          childId={id}
        />
      )}
      
      {/* Edit Memory Modal */}
      <EditMemoryModal
        visible={showEditMemoryModal}
        onClose={() => {
          setShowEditMemoryModal(false);
          setEditingMemory(null);
        }}
        memory={editingMemory}
      />
      
      {/* Delete Confirmation Modal */}
      <ModalConfirm
        visible={showDeleteConfirm}
        title="Delete Memory"
        message={`Are you sure you want to delete "${editingMemory?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteMemory}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setEditingMemory(null);
        }}
      />
    </View>
  );

  // Render tab content based on active tab
  function renderTabContent() {
    switch (activeTab) {
      case 'timeline':
        return renderTimelineContent();
      case 'health':
        return renderHealthContent();
      case 'qa':
        return renderQAContent();
      case 'profile':
        return renderProfileContent();
      default:
        return renderTimelineContent();
    }
  }

  // Timeline content
  function renderTimelineContent() {
    return (
      <View style={styles.contentContainer}>
        <Text style={styles.contentTitle}>Timeline</Text>
        <View style={styles.placeholderContainer}>
          <MaterialIcons name="timeline" size={48} color="#ccc" />
          <Text style={styles.placeholderText}>
            Timeline feature coming soon!
          </Text>
          <Text style={styles.placeholderSubtext}>
            This will show your child&apos;s important moments and milestones in chronological order.
          </Text>
        </View>
      </View>
    );
  }

     // Health content
   function renderHealthContent() {
     return (
       <View style={styles.contentContainer}>
         <Text style={styles.contentTitle}>Health Records</Text>
         <View style={styles.placeholderContainer}>
           <MaterialIcons name="medical-services" size={48} color="#ccc" />
           <Text style={styles.placeholderText}>
             Health tracking coming soon!
           </Text>
           <Text style={styles.placeholderSubtext}>
             Track vaccinations, growth charts, doctor visits, and health milestones.
           </Text>
         </View>
       </View>
     );
   }

  // Memories content
  function renderMemoriesContent() {
    if (memoriesLoading && memories.length === 0) {
      return (
        <View style={styles.contentContainer}>
          <Text style={styles.contentTitle}>Memories</Text>
          <LoadingSpinner message="Loading memories..." />
        </View>
      );
    }

    if (memoriesError) {
      return (
        <View style={styles.contentContainer}>
          <Text style={styles.contentTitle}>Memories</Text>
          <ErrorView 
            message={memoriesError} 
            onRetry={retryLoadMemories}
          />
        </View>
      );
    }

    if (memories.length === 0) {
      return (
        <View style={styles.contentContainer}>
          <Text style={styles.contentTitle}>Memories</Text>
          <View style={styles.placeholderContainer}>
            <MaterialIcons name="photo" size={48} color="#ccc" />
            <Text style={styles.placeholderText}>
              No memories yet
            </Text>
            <Text style={styles.placeholderSubtext}>
              Start capturing precious moments with photos, videos, and notes.
            </Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowAddMemoryModal(true)}
            >
              <MaterialIcons name="add" size={20} color="#fff" />
              <Text style={styles.addButtonText}>Add Memory</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.memoriesContainer}>
        <View style={styles.memoriesHeader}>
          <Text style={styles.contentTitle}>Memories</Text>
          <TouchableOpacity 
            style={styles.addMemoryButton}
            onPress={() => setShowAddMemoryModal(true)}
          >
            <MaterialIcons name="add" size={20} color="#4f8cff" />
            <Text style={styles.addMemoryButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={getUniqueMemories()}
          keyExtractor={keyExtractor}
          refreshControl={
            <RefreshControl
              refreshing={memoriesLoading && memories.length === 0}
              onRefresh={retryLoadMemories}
              colors={['#4f8cff']}
              tintColor="#4f8cff"
            />
          }
          renderItem={({ item }) => (
            <MemoryItem
              memory={item}
              creator={currentUser || undefined}
              onPress={handleMemoryPress}
              onEdit={handleMemoryEdit}
              onDelete={handleMemoryDelete}
              onLike={handleMemoryLike}
              onComment={handleMemoryComment}
            />
          )}
          onEndReached={loadMoreMemories}
          onEndReachedThreshold={0.1}
          ListFooterComponent={
            memoriesLoading && memories.length > 0 ? (
              <View style={styles.loadingMore}>
                <LoadingSpinner message="Loading more memories..." />
              </View>
            ) : null
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.memoriesList}
        />
      </View>
    );
  }

     // Q&A content
   function renderQAContent() {
     return (
       <View style={styles.contentContainer}>
         <Text style={styles.contentTitle}>Questions & Answers</Text>
         <View style={styles.placeholderContainer}>
           <MaterialIcons name="help" size={48} color="#ccc" />
           <Text style={styles.placeholderText}>
             Q&A feature coming soon!
           </Text>
           <Text style={styles.placeholderSubtext}>
             Ask questions about your child&apos;s development and get helpful responses.
           </Text>
         </View>
       </View>
     );
   }

   // Profile content
   function renderProfileContent() {
     if (!currentChild) return null;
     
     return (
       <View style={styles.contentContainer}>
         <Text style={styles.contentTitle}>Profile Details</Text>
         <View style={styles.profileDetails}>
           <View style={styles.profileItem}>
             <Text style={styles.profileLabel}>Full Name:</Text>
             <Text style={styles.profileValue}>{currentChild.name}</Text>
           </View>
           <View style={styles.profileItem}>
             <Text style={styles.profileLabel}>Birthdate:</Text>
             <Text style={styles.profileValue}>{formatDate(currentChild.birthdate)}</Text>
           </View>
           <View style={styles.profileItem}>
             <Text style={styles.profileLabel}>Age:</Text>
             <Text style={styles.profileValue}>{getAge(currentChild.birthdate)}</Text>
           </View>
           {currentChild.bio && (
             <View style={styles.profileItem}>
               <Text style={styles.profileLabel}>Bio:</Text>
               <Text style={styles.profileValue}>{currentChild.bio}</Text>
             </View>
           )}
         </View>
       </View>
     );
   }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  childHeader: {
    backgroundColor: '#f8f9ff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  childInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  childAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  childAvatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  childDetails: {
    flex: 1,
  },
  childName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  childAge: {
    fontSize: 18,
    color: '#4f8cff',
    fontWeight: '600',
    marginBottom: 4,
  },
  childBirthdate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  childBio: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#4f8cff',
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  activeTabText: {
    color: '#4f8cff',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  placeholderText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  profileDetails: {
    backgroundColor: '#f8f9ff',
    borderRadius: 12,
    padding: 16,
  },
  profileItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  profileLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    width: 100,
  },
  profileValue: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  memoriesContainer: {
    flex: 1,
  },
  memoriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  addMemoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  addMemoryButtonText: {
    color: '#4f8cff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  memoriesList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  loadingMore: {
    paddingVertical: 20,
  },
  addButton: {
    marginTop: 20,
    backgroundColor: '#4f8cff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    flexDirection: 'row',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 