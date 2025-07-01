import React from 'react';
import { StyleSheet, View } from 'react-native';

const Divider: React.FC = () => <View style={styles.divider} />;

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
    width: '100%',
  },
});

export default Divider;
