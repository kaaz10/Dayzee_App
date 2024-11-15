import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, ImageBackground, Dimensions } from 'react-native';
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then(() => navigation.navigate('Onboarding'))
      .catch(error => Alert.alert("Login failed", error.message));
  };

  return (
    <ImageBackground 
      source={require('../../assets/images/Login.jpg')}
      style={[styles.background, { width, height }]}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
        />
        
        <TextInput
          style={styles.input2}
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    position: 'relative',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 17,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
    position: 'absolute',
    top: '34%',
    left: 35,
    right: 35,
  },
  input2: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 17,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
    position: 'absolute',
    top: '48%',
    left: 35,
    right: 35,
  },
  loginButton: {
    backgroundColor: '#2d2d2d',
    width: '50%',
    height: '6.5%',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    position: 'absolute',
    top: '60%', // Adjust this value to control the button position
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
