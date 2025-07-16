import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SearchResult } from '../../services/searchService';

interface SearchResultsProps {
  results: SearchResult[];
  onResultPress?: (result: SearchResult) => void;
  loading?: boolean;
  emptyMessage?: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  onResultPress,
  loading = false,
  emptyMessage = "No memories found. Try searching for photos, videos, or special moments."
}) => {
  const router = useRouter();

  // Filter to only show memory results
  const memoryResults = results.filter(result => result.type === 'memory');

  const handleResultPress = (result: SearchResult) => {
    if (onResultPress) {
      onResultPress(result);
    } else {
      router.push(result.route);
    }
  };

  const getTypeIcon = () => 'camera-outline';

  const getTypeColor = () => '#51cf66';

  const getTypeLabel = () => 'Memory';

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleResultPress(item)}
    >
      <View style={styles.resultContent}>
        {/* Image or Icon */}
        <View style={styles.imageContainer}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.resultImage} />
          ) : (
            <View style={[styles.iconPlaceholder, { backgroundColor: `${getTypeColor()}20` }]}>
              <Ionicons
                name={getTypeIcon() as any}
                size={24}
                color={getTypeColor()}
              />
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.resultTitle}>{item.title}</Text>
            <View style={[styles.typeTag, { backgroundColor: getTypeColor() }]}>
              <Text style={styles.typeTagText}>{getTypeLabel()}</Text>
            </View>
          </View>
          
          {item.subtitle && (
            <Text style={styles.resultSubtitle}>{item.subtitle}</Text>
          )}
          
          {item.date && (
            <Text style={styles.resultDate}>
              {item.date.toLocaleDateString()}
            </Text>
          )}
        </View>

        {/* Arrow */}
        <View style={styles.arrowContainer}>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Searching...</Text>
      </View>
    );
  }

  if (memoryResults.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="camera-outline" size={48} color="#ccc" />
        <Text style={styles.emptyText}>{emptyMessage}</Text>
        <Text style={styles.emptyHint}>
          Try searching for things like "first steps", "birthday", or special moments
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={memoryResults}
      renderItem={renderSearchResult}
      keyExtractor={(item) => `memory-${item.id}`}
      style={styles.resultsList}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.resultsContainer}
    />
  );
};

const styles = StyleSheet.create({
  resultsList: {
    flex: 1,
  },
  resultsContainer: {
    padding: 16,
  },
  resultItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  resultContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  imageContainer: {
    marginRight: 12,
  },
  resultImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  iconPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  typeTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  typeTagText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  resultSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  resultDate: {
    fontSize: 12,
    color: '#999',
  },
  arrowContainer: {
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default SearchResults; 