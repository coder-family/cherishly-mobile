import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export type HealthRecordType = 'growth' | 'vaccine' | 'illness';

interface HealthRecordItemProps {
  type: HealthRecordType;
  date: string;
  value: string;
  note?: string;
}

const HealthRecordItem: React.FC<HealthRecordItemProps> = ({ type, date, value, note }) => (
  <View style={styles.item}>
    <Text style={styles.type}>{type.toUpperCase()}</Text>
    <Text style={styles.value}>{value}</Text>
    <Text style={styles.date}>{date}</Text>
    {note && <Text style={styles.note}>{note}</Text>}
  </View>
);

const styles = StyleSheet.create({
  item: {
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 8,
  },
  type: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: '#aaa',
    marginBottom: 2,
  },
  note: {
    fontSize: 13,
    color: '#444',
  },
});

export default HealthRecordItem; 