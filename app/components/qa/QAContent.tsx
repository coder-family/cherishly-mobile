import { MaterialIcons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchChildResponses } from '../../redux/slices/promptResponseSlice';
import { fetchPrompts } from '../../redux/slices/promptSlice';
import { Prompt } from '../../services/promptService';
import ErrorView from '../ui/ErrorView';
import LoadingSpinner from '../ui/LoadingSpinner';
import AddResponseModal from './AddResponseModal';
import AskChildModal from './AskChildModal';
import CustomQuestionModal from './CustomQuestionModal';
import QuestionAnswerCard from './QuestionAnswerCard';

interface QAContentProps {
  childId: string;
  useScrollView?: boolean; // New prop to handle nesting issue
}

type ListItemType = 'header' | 'qa-card' | 'ask-button' | 'load-more';

interface ListItem {
  type: ListItemType;
  data?: any;
  prompt?: Prompt;
  response?: any;
}

export default function QAContent({ childId, useScrollView = false }: QAContentProps) {
  const dispatch = useAppDispatch();
  const { prompts, loading: promptsLoading, error: promptsError, hasMore: promptsHasMore } = useAppSelector((state) => state.prompts);
  const { responses, loading: responsesLoading, error: responsesError, hasMore: responsesHasMore } = useAppSelector((state) => state.promptResponses);
  
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [showAddResponseModal, setShowAddResponseModal] = useState(false);
  const [showAskChildModal, setShowAskChildModal] = useState(false);
  const [showCustomQuestionModal, setShowCustomQuestionModal] = useState(false);
  const [visibleCardsCount, setVisibleCardsCount] = useState(3); // Show 3 cards initially
  
  // Use ref to track if initial data has been loaded
  const initialDataLoaded = useRef(false);

  // Load prompts and responses on mount
  useEffect(() => {
    if (childId && !initialDataLoaded.current) {
      console.log('QAContent: Loading initial data for childId:', childId);
      initialDataLoaded.current = true;
      dispatch(fetchPrompts({ isActive: true, limit: 20 }));
      dispatch(fetchChildResponses({ childId, limit: 20 }));
    }
  }, [childId, dispatch]);

  // Debug effect to log state changes
  useEffect(() => {
    console.log('QAContent: State updated - prompts:', prompts.length, 'responses:', responses.length);
  }, [prompts.length, responses.length]);

  // Reset the ref when childId changes and clear data
  useEffect(() => {
    initialDataLoaded.current = false;
    setVisibleCardsCount(3); // Reset to show 3 cards initially
    // Clear existing data when childId changes
    console.log('QAContent: ChildId changed, clearing data');
  }, [childId]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (loadMoreDataRef.current) {
        clearTimeout(loadMoreDataRef.current);
      }
    };
  }, []);

  const handlePromptPress = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
  };

  const handleAddResponse = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setShowAddResponseModal(true);
  };

  const handleResponseCreated = useCallback(() => {
    console.log('QAContent: Response created, refreshing data...');
    setShowAddResponseModal(false);
    setSelectedPrompt(null);
    // Refresh responses with a small delay to ensure backend has processed the request
    if (childId) {
      setTimeout(() => {
        console.log('QAContent: Refreshing responses for childId:', childId);
        dispatch(fetchChildResponses({ childId, limit: 20 }));
      }, 1000); // 1 second delay
    }
  }, [childId, dispatch]);

  const handleAskChild = () => {
    setShowAskChildModal(true);
  };

  const handleSystemQuestion = () => {
    setShowAskChildModal(false);
    // TODO: Implement system question logic
    console.log('System question selected');
  };

  const handleCustomQuestion = () => {
    setShowAskChildModal(false);
    setShowCustomQuestionModal(true);
  };

  const handleCustomQuestionSubmit = (question: string) => {
    setShowCustomQuestionModal(false);
    // TODO: Implement custom question submission
    console.log('Custom question submitted:', question);
  };

  const handleLoadMore = () => {
    setVisibleCardsCount(prev => prev + 3); // Load 3 more cards
    console.log('QAContent: Loading more cards, new count:', visibleCardsCount + 3);
  };

  // Debounce mechanism for loadMoreData
  const loadMoreDataRef = useRef<NodeJS.Timeout | null>(null);

  const loadMoreData = useCallback(() => {
    console.log('QAContent: loadMoreData called', {
      promptsLoading,
      responsesLoading,
      promptsHasMore,
      responsesHasMore,
      promptsLength: prompts.length,
      responsesLength: responses.length
    });

    // Clear any existing timeout
    if (loadMoreDataRef.current) {
      clearTimeout(loadMoreDataRef.current);
    }

    // Debounce the load more operation
    loadMoreDataRef.current = setTimeout(() => {
      // Prevent multiple simultaneous requests
      if (promptsLoading || responsesLoading) {
        console.log('QAContent: Skipping loadMoreData - already loading');
        return;
      }

      let hasMoreData = false;

      if (promptsHasMore) {
        const nextPage = Math.floor(prompts.length / 20) + 1;
        console.log('QAContent: Loading more prompts, page:', nextPage);
        dispatch(fetchPrompts({ isActive: true, page: nextPage, limit: 20 }));
        hasMoreData = true;
      }
      
      if (responsesHasMore) {
        const nextPage = Math.floor(responses.length / 20) + 1;
        console.log('QAContent: Loading more responses, page:', nextPage);
        dispatch(fetchChildResponses({ childId, page: nextPage, limit: 20 }));
        hasMoreData = true;
      }

      // Only log if we actually loaded more data
      if (hasMoreData) {
        console.log('QAContent: Loading more Q&A data...');
      } else {
        console.log('QAContent: No more data to load');
      }
    }, 300); // 300ms debounce
  }, [promptsLoading, responsesLoading, promptsHasMore, responsesHasMore, prompts.length, responses.length, childId, dispatch]);

  const renderItem = ({ item }: { item: ListItem }) => {
    switch (item.type) {
      case 'header':
        return (
          <View style={styles.header}>
            <Text style={styles.title}>Questions & Answers</Text>
            <Text style={styles.subtitle}>
              View your child&apos;s answered questions and responses with media
            </Text>
          </View>
        );
      
      case 'ask-button':
        return (
          <TouchableOpacity
            style={styles.askButton}
            onPress={handleAskChild}
            activeOpacity={0.8}
          >
            <MaterialIcons name="add-circle" size={24} color="#fff" />
            <Text style={styles.askButtonText}>Ask Child</Text>
          </TouchableOpacity>
        );
      
      case 'qa-card':
        return (
          <QuestionAnswerCard
            prompt={item.prompt!}
            response={item.response}
            onPress={() => item.prompt && handlePromptPress(item.prompt)}
            onAddResponse={() => item.prompt && handleAddResponse(item.prompt)}
            showAddButton={true}
          />
        );
      
      case 'load-more':
        return (
          <TouchableOpacity
            style={styles.loadMoreButton}
            onPress={handleLoadMore}
            activeOpacity={0.8}
          >
            <MaterialIcons name="expand-more" size={24} color="#007AFF" />
            <Text style={styles.loadMoreButtonText}>Load More</Text>
          </TouchableOpacity>
        );
      
      default:
        return null;
    }
  };

  if (promptsLoading && prompts.length === 0) {
    return <LoadingSpinner message="Loading Q&A content..." />;
  }

  if (promptsError) {
    return (
      <ErrorView 
        message={promptsError} 
        onRetry={() => {
          if (childId) {
            dispatch(fetchPrompts({ isActive: true, limit: 20 }));
            dispatch(fetchChildResponses({ childId, limit: 20 }));
          }
        }}
      />
    );
  }

  // Create list items with Q&A cards
  const listItems: ListItem[] = [
    { type: 'header' },
    { type: 'ask-button' },
  ];

  console.log('QAContent: Current prompts count:', prompts.length);
  console.log('QAContent: Current responses count:', responses.length);
  console.log('QAContent: Prompts:', prompts.map(p => ({ id: p.id, content: p.content })));
  console.log('QAContent: Responses:', responses.map(r => ({ id: r.id, promptId: r.promptId, content: r.content })));

  // Collect all Q&A cards with duplicate prevention
  const qaCards: ListItem[] = [];
  const processedResponseIds = new Set<string>();

  console.log('QAContent: Starting to collect Q&A cards...');
  console.log('QAContent: Prompts structure:', prompts.map(p => ({ id: p.id, content: p.content, title: p.title })));
  console.log('QAContent: Responses structure:', responses.map(r => ({ 
    id: r.id, 
    promptId: r.promptId, 
    promptIdType: typeof r.promptId,
    content: r.content 
  })));

  // Process all responses to create cards
  responses.forEach((response, index) => {
    // Skip if we've already processed this response
    if (processedResponseIds.has(response.id)) {
      console.log(`QAContent: Skipping duplicate response ${response.id}`);
      return;
    }

    console.log(`QAContent: Processing response ${index + 1}:`, {
      responseId: response.id,
      promptId: response.promptId,
      promptIdType: typeof response.promptId,
      hasEmbeddedPrompt: typeof response.promptId === 'object' && response.promptId !== null
    });

    let promptToUse: any = null;

    if (typeof response.promptId === 'object' && response.promptId) {
      // Use embedded prompt information
      const promptId = (response.promptId as any)._id;
      promptToUse = {
        id: promptId,
        title: (response.promptId as any).question || '',
        content: (response.promptId as any).question || '',
        category: (response.promptId as any).category || '',
        tags: [],
        isActive: true,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
      };
      console.log(`QAContent: Using embedded prompt for response ${response.id}:`, promptToUse);
    } else if (typeof response.promptId === 'string') {
      // Try to find matching prompt
      const matchingPrompt = prompts.find(p => p.id === response.promptId);
      if (matchingPrompt) {
        promptToUse = matchingPrompt;
        console.log(`QAContent: Found matching prompt for response ${response.id}:`, matchingPrompt);
      } else {
        console.log(`QAContent: No matching prompt found for response ${response.id} with promptId: ${response.promptId}`);
        // Create a fallback prompt object
        promptToUse = {
          id: response.promptId,
          title: 'Question',
          content: 'Question',
          category: '',
          tags: [],
          isActive: true,
          createdAt: response.createdAt,
          updatedAt: response.updatedAt,
        };
      }
    }

    if (promptToUse) {
      console.log(`QAContent: Adding card for response ${response.id}`);
      qaCards.push({
        type: 'qa-card',
        prompt: promptToUse,
        response,
      });
      processedResponseIds.add(response.id);
    }
  });

  // Sort cards by date (most recent first) and limit to visible count
  const sortedCards = qaCards.sort((a, b) => {
    const dateA = new Date(a.response?.createdAt || a.prompt?.createdAt || 0);
    const dateB = new Date(b.response?.createdAt || b.prompt?.createdAt || 0);
    return dateB.getTime() - dateA.getTime(); // Most recent first
  });

  const visibleCards = sortedCards.slice(0, visibleCardsCount);
  const hasMoreCards = sortedCards.length > visibleCardsCount;

  // Add visible cards to list items
  listItems.push(...visibleCards);

  // Add load more button if there are more cards
  if (hasMoreCards) {
    listItems.push({ type: 'load-more' });
  }

  console.log('QAContent: Final listItems count:', listItems.length, 'Visible cards:', visibleCards.length, 'Total cards:', sortedCards.length);
  console.log('QAContent: All collected cards:', qaCards.map(card => ({
    type: card.type,
    promptId: card.prompt?.id,
    responseId: card.response?.id,
    promptContent: card.prompt?.content,
    responseContent: card.response?.content
  })));
  console.log('QAContent: Processed response IDs:', Array.from(processedResponseIds));
  console.log('QAContent: Total responses from API:', responses.length);
  console.log('QAContent: Cards created:', qaCards.length);

  const renderContent = () => {
    if (useScrollView) {
      // Use ScrollView when nested inside another ScrollView
      return (
        <ScrollView 
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
        >
          {listItems.map((item, index) => (
            <View key={renderKeyExtractor(item, index)}>
              {renderItem({ item })}
            </View>
          ))}
          {(promptsLoading || responsesLoading) && (prompts.length > 0 || responses.length > 0) && (
            <LoadingSpinner message="Loading more content..." />
          )}
        </ScrollView>
      );
    }

    // Use FlatList when not nested
    return (
      <FlatList
        data={listItems}
        renderItem={renderItem}
        keyExtractor={renderKeyExtractor}
        showsVerticalScrollIndicator={false}
        // Temporarily disable onEndReached to debug infinite loading
        // onEndReached={loadMoreData}
        // onEndReachedThreshold={0.5}
        ListFooterComponent={
          (promptsLoading || responsesLoading) && (prompts.length > 0 || responses.length > 0) ? (
            <LoadingSpinner message="Loading more content..." />
          ) : null
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="help" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No answered questions yet</Text>
            <Text style={styles.emptySubtext}>
              Use the &quot;Ask Child&quot; button to ask questions and see them appear here once answered.
            </Text>
          </View>
        )}
      />
    );
  };

  const renderKeyExtractor = (item: ListItem, index: number) => {
    switch (item.type) {
      case 'header':
        return 'header';
      case 'ask-button':
        return 'ask-button';
      case 'qa-card':
        // Use both prompt ID and response ID to ensure uniqueness
        return `qa-card-${item.prompt?.id || 'unknown'}-${item.response?.id || index}`;
      case 'load-more':
        return 'load-more';
      default:
        return `item-${index}`;
    }
  };

  return (
    <View style={styles.container}>
      {renderContent()}

      {/* Add Response Modal */}
      {selectedPrompt && (
        <AddResponseModal
          visible={showAddResponseModal}
          prompt={selectedPrompt}
          childId={childId}
          onClose={() => {
            setShowAddResponseModal(false);
            setSelectedPrompt(null);
          }}
          onSuccess={handleResponseCreated}
        />
      )}

      {/* Ask Child Modal */}
      <AskChildModal
        visible={showAskChildModal}
        onClose={() => setShowAskChildModal(false)}
        onSystemQuestion={handleSystemQuestion}
        onCustomQuestion={handleCustomQuestion}
      />

      {/* Custom Question Modal */}
      <CustomQuestionModal
        visible={showCustomQuestionModal}
        onClose={() => setShowCustomQuestionModal(false)}
        onSubmit={handleCustomQuestionSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  emptySection: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptySectionText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
  emptySectionSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 18,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  askButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007bff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    alignSelf: 'center',
  },
  askButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    alignSelf: 'center',
  },
  loadMoreButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
}); 