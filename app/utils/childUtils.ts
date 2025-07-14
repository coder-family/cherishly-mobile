import { router } from "expo-router";
import { Alert } from "react-native";
import { createChild, fetchChildren } from "../redux/slices/childSlice";
import { AppDispatch } from "../redux/store";
import { CreateChildData } from "../services/childService";

export interface Child {
  id: string;
  name: string;
  birthdate: string;
  bio?: string;
  avatarUrl?: string;
  gender?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChildState {
  children: Child[];
  loading: boolean;
  error: string | null;
}

// Utility class for child-related operations
export class ChildUtils {
  /**
   * Navigate to add child screen
   */
  static navigateToAddChild() {
    router.push("/children/add");
  }

  /**
   * Navigate to child profile screen
   */
  static navigateToChildProfile(childId: string) {
    router.push(`/children/${childId}/profile`);
  }

  /**
   * Get the appropriate button text based on whether user has children
   */
  static getAddChildButtonText(hasChildren: boolean): string {
    return "+ Add Your Baby";
  }

  /**
   * Check if add child button should be shown (only when user has no children)
   */
  static shouldShowAddChildButton(hasChildren: boolean): boolean {
    return !hasChildren;
  }

  /**
   * Check if user has children
   */
  static hasChildren(children: Child[] | null | undefined): boolean {
    return !!(children && children.length > 0);
  }

  /**
   * Get children count
   */
  static getChildrenCount(children: Child[] | null | undefined): number {
    return children?.length || 0;
  }

  /**
   * Filter valid children (those with valid id)
   */
  static getValidChildren(children: Child[] | null | undefined): Child[] {
    if (!children) return [];
    return children.filter(child => child && child.id);
  }

  /**
   * Handle add child button press with proper dispatch
   */
  static handleAddChildPress(dispatch: AppDispatch, hasChildren: boolean, onOpenModal?: () => void) {
    // Log for debugging
    console.log('Add child button pressed:', { hasChildren });
    
    // If modal callback is provided, use it; otherwise navigate to add child screen
    if (onOpenModal) {
      onOpenModal();
    } else {
      this.navigateToAddChild();
    }
  }

  /**
   * Handle child card press
   */
  static handleChildCardPress(childId: string, childName?: string) {
    // Log for debugging
    console.log('Child card pressed:', { childId, childName });
    
    // Navigate to child profile
    this.navigateToChildProfile(childId);
  }

  /**
   * Refresh children data
   */
  static refreshChildren(dispatch: AppDispatch) {
    console.log('Refreshing children data...');
    dispatch(fetchChildren());
  }

  /**
   * Handle children loading error
   */
  static handleChildrenError(error: string | null, dispatch: AppDispatch) {
    if (error) {
      Alert.alert(
        'Error Loading Children',
        error,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Retry', 
            onPress: () => this.refreshChildren(dispatch)
          }
        ]
      );
    }
  }

  /**
   * Get welcome message based on children status
   */
  static getWelcomeMessage(hasChildren: boolean): string {
    if (hasChildren) {
      return "Welcome back to your family's journey!";
    }
    return "Let's get started on your family's journey.";
  }

  /**
   * Check if children data is still loading
   */
  static isChildrenLoading(loading: boolean, children: Child[] | null | undefined): boolean {
    return loading && !children;
  }

  /**
   * Create a new child (can be extended for form handling)
   */
  static async createNewChild(
    dispatch: AppDispatch,
    childData: CreateChildData
  ): Promise<Child> {
    try {
      const result = await dispatch(createChild(childData)).unwrap();
      Alert.alert('Success', 'Baby added successfully!');
      return result;
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to add baby');
      throw error;
    }
  }
}

// Export individual functions for convenience
export const {
  navigateToAddChild,
  navigateToChildProfile,
  getAddChildButtonText,
  hasChildren,
  getChildrenCount,
  getValidChildren,
  handleAddChildPress,
  handleChildCardPress,
  refreshChildren,
  handleChildrenError,
  getWelcomeMessage,
  isChildrenLoading,
  createNewChild
} = ChildUtils; 