import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Prompt, PromptResponse } from '../../services/promptService';
import { DeleteButton, EditButton } from '../ui/EditDeleteButtons';

interface ResponseItemProps {
  response: PromptResponse;
  prompt?: Prompt;
}

export default function ResponseItem({ response, prompt }: ResponseItemProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.promptInfo}>
          {prompt && (
            <Text style={styles.promptTitle} numberOfLines={1}>
              {prompt.title}
            </Text>
          )}
          <Text style={styles.dateText}>
            {formatDate(response.createdAt)} at {formatTime(response.createdAt)}
          </Text>
        </View>
        <View style={styles.statusContainer}>
          <View style={styles.answeredBadge}>
            <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
            <Text style={styles.answeredText}>Answered</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.responseContent} numberOfLines={4}>
          {response.content}
        </Text>
        
        {response.attachments && response.attachments.length > 0 && (
          <View style={styles.attachmentsContainer}>
            <MaterialIcons name="attach-file" size={16} color="#666" />
            <Text style={styles.attachmentsText}>
              {response.attachments.length} attachment{response.attachments.length > 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </View>
      
      {response.feedback && (
        <View style={styles.feedbackContainer}>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <MaterialIcons
                key={star}
                name={star <= response.feedback!.rating ? "star" : "star-border"}
                size={16}
                color={star <= response.feedback!.rating ? "#FFD700" : "#ccc"}
              />
            ))}
          </View>
          {response.feedback.comment && (
            <Text style={styles.feedbackComment} numberOfLines={2}>
              &quot;{response.feedback.comment}&quot;
            </Text>
          )}
        </View>
      )}
      
      <View style={styles.footer}>
        <EditButton onPress={() => {}} />
        <DeleteButton onPress={() => {}} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingBottom: 12,
  },
  promptInfo: {
    flex: 1,
    marginRight: 12,
  },
  promptTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4f8cff',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  answeredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  answeredText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
    marginLeft: 4,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  responseContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  attachmentsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attachmentsText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  feedbackContainer: {
    backgroundColor: '#f8f9ff',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  feedbackComment: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 12,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#4f8cff',
    fontWeight: '500',
    marginLeft: 4,
  },
}); 