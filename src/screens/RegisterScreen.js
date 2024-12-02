  import React, { useState } from 'react';
  import { View, TextInput, TouchableOpacity, Text, Alert, StyleSheet, ImageBackground, Dimensions, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
  import { auth, db } from '../config/firebase';
  import { createUserWithEmailAndPassword } from 'firebase/auth';
  import { doc, setDoc } from 'firebase/firestore';

  //screen dimensions for responsive background
  const { width, height } = Dimensions.get('window');

  export default function RegisterScreen({ navigation }) {
    const [name, setName] = useState('');        //user's name
    const [email, setEmail] = useState('');      //user's email
    const [password, setPassword] = useState(''); //user's password

    //user registration process
    const handleRegister = async () => {
      try {
        //create user with Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        //store additional user information in Firestore
        await setDoc(doc(db, "users", user.uid), { 
          name, 
          email, 
          createdAt: new Date() 
        });

        //navigate to main screen
        navigation.navigate('Main');
      } catch (error) {
        //error
        Alert.alert("Registration failed", error.message);
      }
    };

    return (
      // Full-screen background image
      <ImageBackground 
        source={require('../../assets/images/Register.jpg')}
        style={[styles.background, { width, height }]}
        resizeMode="cover"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -200}
        >
          <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <Text style={styles.nameLabel}>name.</Text>
            <TextInput
              style={styles.inputName}
              placeholder="Name"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
            />
            
            <Text style={styles.emailLabel}>email.</Text>
            <TextInput
              style={styles.inputEmail}
              placeholder="Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
            />
            
            <Text style={styles.passwordLabel}>password.</Text>
            <TextInput
              style={styles.inputPassword}
              placeholder="Password"
              placeholderTextColor="#999"
              secureTextEntry     //hide password input
              value={password}
              onChangeText={setPassword}
            />
            
            <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
              <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    );
  }

  //cutsom styles
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
    nameLabel: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#2d2d2d',
      marginBottom: 10,
    },
    emailLabel: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#2d2d2d',
      marginTop: 20,
      marginBottom: 10,
    },
    passwordLabel: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#2d2d2d',
      marginTop: 20,
      marginBottom: 10,
    },
    inputName: {
      backgroundColor: '#fff',
      borderRadius: 20,
      paddingVertical: 17,
      paddingHorizontal: 15,
      fontSize: 16,
      color: '#333',
      marginBottom: 10,
    },
    inputEmail: {
      backgroundColor: '#fff',
      borderRadius: 20,
      paddingVertical: 17,
      paddingHorizontal: 15,
      fontSize: 16,
      color: '#333',
      marginBottom: 10,
    },
    inputPassword: {
      backgroundColor: '#fff',
      borderRadius: 20,
      paddingVertical: 17,
      paddingHorizontal: 15,
      fontSize: 16,
      color: '#333',
      marginBottom: 20,
    },
    registerButton: {
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