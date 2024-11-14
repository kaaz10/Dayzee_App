import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to HabitTracker</Text>
      <TouchableOpacity
        style={[styles.button, styles.signInButton]}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.registerButton]}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f3eb', 
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3a3a3a', 
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    width: '80%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  signInButton: {
    backgroundColor: '#6a9fb5', 
  },
  registerButton: {
    backgroundColor: '#ffa07a', 
  },
  buttonText: {
    color: '#ffa',
    fontSize: 18,
    fontWeight: '600',
  },
});