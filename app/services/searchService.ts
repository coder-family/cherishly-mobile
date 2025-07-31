import { conditionalLog } from '../utils/logUtils';
import { getChildren } from './childService';
import { getFamilyGroups } from './familyService';

// Search result types
export interface SearchResult {
  id: string;
  type: 'child' | 'memory' | 'family' | 'health' | 'milestone';
  title: string;
  subtitle?: string;
  content: string;
  date?: Date;
  imageUrl?: string;
  route: string;
  relevanceScore: number;
}

// Search options
export interface SearchOptions {
  category?: string;
  limit?: number;
  sortBy?: 'relevance' | 'date' | 'alphabetical';
}

// Popular search suggestions for kids content
export const popularSearchSuggestions = [
  'first steps',
  'first words',
  'birthday',
  'growth tracking',
  'vaccines',
  'sleep schedule',
  'milestones',
  'family photos',
  'baby food',
  'teething',
  'playtime',
  'development',
  'height and weight',
  'doctor visits'
];

// Search service class
class SearchService {
  private searchHistory: string[] = [];
  private readonly maxHistoryItems = 10;

  // Main search function
  async search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    if (!query.trim()) {
      return [];
    }

    const {
      category = 'all',
      limit = 20,
      sortBy = 'relevance'
    } = options;

    // Add to search history
    this.addToHistory(query);

    try {
      const results: SearchResult[] = [];

      // Search children
      if (category === 'all') {
        const childResults = await this.searchChildren(query);
        results.push(...childResults);
      }

      // Search family groups
      if (category === 'all') {
        const familyResults = await this.searchFamilyGroups(query);
        results.push(...familyResults);
      }

      // TODO: Add memory search when memories are implemented
      // if (category === SearchCategory.ALL || category === SearchCategory.MEMORIES) {
      //   const memoryResults = await this.searchMemories(query);
      //   results.push(...memoryResults);
      // }

      // TODO: Add health record search when health is implemented
      // if (category === SearchCategory.ALL || category === SearchCategory.HEALTH) {
      //   const healthResults = await this.searchHealthRecords(query);
      //   results.push(...healthResults);
      // }

      // Sort results
      return this.sortResults(results, sortBy).slice(0, limit);

    } catch (error) {
      conditionalLog.search('Search error:', error);
      throw error;
    }
  }

  // Search children
  private async searchChildren(query: string): Promise<SearchResult[]> {
    try {
      const children = await getChildren();
      const results: SearchResult[] = [];

      children.forEach(child => {
        const relevanceScore = this.calculateRelevance(query, [
          child.name,
          child.birthdate || ''
        ]);

        if (relevanceScore > 0) {
          results.push({
            id: child.id,
            type: 'child',
            title: child.name,
            subtitle: 'Your child',
            content: `${child.name} ${child.birthdate || ''}`,
            date: child.birthdate ? new Date(child.birthdate) : undefined,
            imageUrl: child.avatarUrl,
            route: `/children/${child.id}/profile`,
            relevanceScore
          });
        }
      });

      return results;
    } catch (error) {
      conditionalLog.search('Error searching children:', error);
      throw error;
    }
  }

  // Search family groups
  private async searchFamilyGroups(query: string): Promise<SearchResult[]> {
    try {
      const familyGroups = await getFamilyGroups();
      const results: SearchResult[] = [];

      familyGroups.forEach(group => {
        const relevanceScore = this.calculateRelevance(query, [
          group.name,
          group.description || '',
          ...(group.members?.map(m => m.user?.firstName || '') || [])
        ]);

        if (relevanceScore > 0) {
          results.push({
            id: group.id,
            type: 'family',
            title: group.name,
            subtitle: group.description || `${group.members?.length || 0} members`,
            content: `${group.name} ${group.description || ''} ${group.members?.map(m => m.user?.firstName).join(' ') || ''}`,
            imageUrl: group.avatarUrl,
            route: `/family/${group.id}`,
            relevanceScore
          });
        }
      });

      return results;
    } catch (error) {
      conditionalLog.search('Error searching family groups:', error);
      throw error;
    }
  }

  // Calculate relevance score
  private calculateRelevance(query: string, content: string[]): number {
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(' ').filter(word => word.length > 0);
    let score = 0;

    content.forEach(text => {
      const textLower = text.toLowerCase();
      
      // Exact match gets highest score
      if (textLower.includes(queryLower)) {
        score += 100;
      }

      // Word matches
      queryWords.forEach(word => {
        if (textLower.includes(word)) {
          score += 50;
        }
      });

      // Partial matches
      queryWords.forEach(word => {
        if (word.length > 2) {
          for (let i = 0; i < textLower.length - word.length + 1; i++) {
            const substring = textLower.substring(i, i + word.length);
            if (substring.includes(word.substring(0, 3))) {
              score += 10;
            }
          }
        }
      });
    });

    return score;
  }

  // Sort results
  private sortResults(results: SearchResult[], sortBy: string): SearchResult[] {
    switch (sortBy) {
      case 'date':
        return results.sort((a, b) => {
          if (!a.date && !b.date) return 0;
          if (!a.date) return 1;
          if (!b.date) return -1;
          return b.date.getTime() - a.date.getTime();
        });
      case 'alphabetical':
        return results.sort((a, b) => a.title.localeCompare(b.title));
      case 'relevance':
      default:
        return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }
  }

  // Search history management
  addToHistory(query: string): void {
    const trimmedQuery = query.trim();
    if (trimmedQuery && !this.searchHistory.includes(trimmedQuery)) {
      this.searchHistory.unshift(trimmedQuery);
      if (this.searchHistory.length > this.maxHistoryItems) {
        this.searchHistory.pop();
      }
    }
  }

  getSearchHistory(): string[] {
    return [...this.searchHistory];
  }

  clearSearchHistory(): void {
    this.searchHistory = [];
  }

  // Get search suggestions
  getSearchSuggestions(query: string): string[] {
    const queryLower = query.toLowerCase();
    const suggestions: string[] = [];

    // Add matching popular suggestions
    popularSearchSuggestions.forEach(suggestion => {
      if (suggestion.toLowerCase().includes(queryLower)) {
        suggestions.push(suggestion);
      }
    });

    // Add matching search history
    this.searchHistory.forEach(historyItem => {
      if (historyItem.toLowerCase().includes(queryLower) && !suggestions.includes(historyItem)) {
        suggestions.push(historyItem);
      }
    });

    return suggestions.slice(0, 8);
  }

  // Quick search for specific content types
  async quickSearchChildren(name: string): Promise<SearchResult[]> {
    return this.search(name, { category: 'all', limit: 5 });
  }

  async quickSearchFamily(name: string): Promise<SearchResult[]> {
    return this.search(name, { category: 'all', limit: 5 });
  }
}

// Export singleton instance
export const searchService = new SearchService();
export default searchService; 