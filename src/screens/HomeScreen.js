import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <ImageBackground 
      source={require('../assets/bg_first.jpg')}
      style={[styles.background, { width, height }]}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={[styles.button, styles.loginButton]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <Text style={styles.accountText}>don’t have an account?</Text>
        <TouchableOpacity
          style={[styles.button, styles.registerButton]}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  overlay: {
    backgroundColor: 'rgba(233, 240, 241, 0.9)',
    width: '100%',
    alignItems: 'center',
    paddingVertical: 40,
  },
  button: {
    width: '80%',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginVertical: 8,
  },
  loginButton: {
    backgroundColor: '#2d2d2d',
  },
  registerButton: {
    backgroundColor: '#66cc85',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  accountText: {
    color: '#a6a6a6',
    fontSize: 14,
    marginVertical: 8,
  },
});