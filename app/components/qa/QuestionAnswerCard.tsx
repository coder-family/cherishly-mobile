import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Prompt, PromptResponse } from '../../services/promptService';
import QAMediaViewer from './QAMediaViewer';

interface QuestionAnswerCardProps {
  prompt: Prompt;
  response?: PromptResponse;
  onPress?: () => void;
  onAddResponse?: () => void;
  onEditResponse?: () => void;
  onDeleteResponse?: () => void;
  showAddButton?: boolean;
  isDeleting?: boolean;
}

export default function QuestionAnswerCard({
  prompt,
  response,
  onPress,
  onAddResponse,
  onEditResponse,
  onDeleteResponse,
  showAddButton = true,
  isDeleting = false,
}: QuestionAnswerCardProps) {
  const hasResponse = !!response;
  const hasAttachments = response?.attachments && response.attachments.length > 0;

  // Debug logging
  console.log('QuestionAnswerCard: Rendering card with:', {
    promptId: prompt.id,
    promptContent: prompt.content,
    promptTitle: prompt.title,
    responseContent: response?.content,
    hasResponse,
    hasAttachments,
    attachments: response?.attachments,
    attachmentsLength: response?.attachments?.length,
    firstAttachment: response?.attachments?.[0]
  });

  return (
    <TouchableOpacity
      style={[styles.card, hasResponse && styles.answeredCard]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Question Section */}
      <View style={styles.questionSection}>
        <View style={styles.questionHeader}>
          <MaterialIcons
            name="help-outline"
            size={20}
            color={hasResponse ? '#4CAF50' : '#FF9800'}
          />
          <Text style={styles.questionLabel}>
            {hasResponse ? 'Answered' : 'Question'}
          </Text>
          {hasResponse && (
            <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
          )}
        </View>
        
        <Text style={styles.questionText} numberOfLines={3}>
          {prompt.content || prompt.title || 'Question'}
        </Text>
        
        {prompt.category && (
          <View style={styles.categoryContainer}>
            <Text style={styles.categoryText}>{prompt.category}</Text>
          </View>
        )}
      </View>

      {/* Answer Section */}
      {hasResponse && (
        <View style={styles.answerSection}>
          <View style={styles.answerHeader}>
            <MaterialIcons name="chat-bubble-outline" size={20} color="#2196F3" />
            <Text style={styles.answerLabel}>Answer</Text>
          </View>
          
          <Text style={styles.answerText} numberOfLines={4}>
            {response.content || 'No answer content'}
          </Text>

          {/* Media Preview */}
          {hasAttachments && response?.attachments && (
            <QAMediaViewer attachments={response.attachments} />
          )}

          {/* Feedback */}
          {response.feedback && (
            <View style={styles.feedbackContainer}>
              <MaterialIcons
                name="star"
                size={16}
                color={response.feedback.rating >= 4 ? '#FFD700' : '#ccc'}
              />
              <Text style={styles.feedbackText}>
                {response.feedback.rating}/5 stars
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Action Buttons - Only show for answered questions */}
      {showAddButton && hasResponse && (
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={onEditResponse}
            activeOpacity={0.8}
            disabled={isDeleting}
          >
            <MaterialIcons name="edit" size={20} color="#fff" />
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.deleteButton, isDeleting && styles.disabledButton]}
            onPress={onDeleteResponse}
            activeOpacity={0.8}
            disabled={isDeleting}
          >
            <MaterialIcons name="delete" size={20} color="#fff" />
            <Text style={styles.buttonText}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Date */}
      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>
          {hasResponse 
            ? `Answered ${new Date(response!.createdAt).toLocaleDateString()}`
            : `Asked ${new Date(prompt.createdAt).toLocaleDateString()}`
          }
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  answeredCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  questionSection: {
    marginBottom: 16,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  questionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    lineHeight: 22,
    marginBottom: 8,
  },
  categoryContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  answerSection: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 16,
  },
  answerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  answerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 8,
  },
  answerText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 20,
    marginBottom: 12,
  },
  feedbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  feedbackText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  editButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: '45%',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: '45%',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  dateContainer: {
    marginTop: 12,
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
});