  import React, { useState } from 'react';
  import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, ImageBackground, Dimensions, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
  import { auth } from '../config/firebase';
  import { signInWithEmailAndPassword } from 'firebase/auth';

  const { width, height } = Dimensions.get('window');

  export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
      signInWithEmailAndPassword(auth, email, password)
        .then(() => navigation.navigate('Main'))
        .catch(error => Alert.alert("Login failed", error.message));
    };

    return (
      <ImageBackground 
        source={require('../../assets/images/Login.jpg')}
        style={[styles.background, { width, height }]}
        resizeMode="cover"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -200} // Adjust the offset as needed
        >
          <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <Text style={styles.inputLabel}>email.</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            
            <Text style={styles.inputLabel2}>password.</Text>
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
          </ScrollView>
        </KeyboardAvoidingView>
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
    },
    inputLabel: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#2d2d2d',
      marginBottom: 10,
    },
    inputLabel2: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#2d2d2d',
      marginTop: 20,
      marginBottom: 10,
    },
    input: {
      backgroundColor: '#fff',
      borderRadius: 20,
      paddingVertical: 17,
      paddingHorizontal: 15,
      fontSize: 16,
      color: '#333',
      marginBottom: 10,
    },
    input2: {
      backgroundColor: '#fff',
      borderRadius: 20,
      paddingVertical: 17,
      paddingHorizontal: 15,
      fontSize: 16,
      color: '#333',
      marginBottom: 20,
    },
    loginButton: {
      backgroundColor: '#2d2d2d',
      paddingVertical: 12,
      borderRadius: 25,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      marginTop: 20,
      width: '50%',
    },
    buttonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '600',
    },
  });