import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export type QAMemoryType = 'text' | 'image' | 'audio' | 'video';

interface QAMemoryItemProps {
  type: QAMemoryType;
  question: string;
  answer: string;
  mediaUrl?: string;
  date: string;
}

const QAMemoryItem: React.FC<QAMemoryItemProps> = ({ type, question, answer, mediaUrl, date }) => (
  <View style={styles.item}>
    <Text style={styles.question}>{question}</Text>
    {type === 'text' && <Text style={styles.answer}>{answer}</Text>}
    {type === 'image' && mediaUrl && (
      <Image source={{ uri: mediaUrl }} style={styles.media} />
    )}
    {/* For audio/video, you would use a player component here */}
    <Text style={styles.date}>{date}</Text>
  </View>
);

const styles = StyleSheet.create({
  item: {
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  question: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  answer: {
    fontSize: 15,
    marginBottom: 6,
  },
  media: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 6,
  },
  date: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
});

export default QAMemoryItem; 