import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ChartsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Charts Screen Placeholder</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E1EFEF',
  },
  text: {
    fontSize: 18,
    color: '#2d2d2d',
  },
});