import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function JournalScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>journal.</Text>
      
      <View style={styles.mainContent}>
        <Text style={styles.text}>Journal Screen Placeholder</Text>
      </View>

      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>Add Note</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E1EFEF',
    alignItems: 'center',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2d2d2d',
    marginTop: 70,
    marginBottom: 40,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 100,
  },
  text: {
    fontSize: 18,
    color: '#2d2d2d',
  },
  addButton: {
    backgroundColor: '#2d2d2d',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    position: 'absolute',
    bottom: 50,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
});