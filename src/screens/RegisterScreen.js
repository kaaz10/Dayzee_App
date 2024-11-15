import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert, StyleSheet, ImageBackground, Dimensions } from 'react-native';
import { auth, db } from '../config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const { width, height } = Dimensions.get('window');

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), { name, email, createdAt: new Date() });
      navigation.navigate('Main');
    } catch (error) {
      Alert.alert("Registration failed", error.message);
    }
  };

  return (
    <ImageBackground 
      source={require('../../assets/images/Register.jpg')}
      style={[styles.background, { width, height }]}
      resizeMode="cover"
    >
      <View style={styles.container}>
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
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        
        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          <Text style={styles.buttonText}>Register</Text>
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
    position: 'relative',
  },
  nameLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d2d2d',
    position: 'absolute',
    top: '19%', 
    left: 35,
  },
  emailLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d2d2d',
    position: 'absolute',
    top: '32%', 
    left: 35,
  },
  passwordLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d2d2d',
    position: 'absolute',
    top: '45%',
    left: 35,
  },
  inputName: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 17,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
    position: 'absolute',
    top: '23%',
    left: 35,
    right: 35,
  },
  inputEmail: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 17,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
    position: 'absolute',
    top: '36%',
    left: 35,
    right: 35,
  },
  inputPassword: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 17,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
    position: 'absolute',
    top: '49%',
    left: 35,
    right: 35,
  },
  registerButton: {
    backgroundColor: '#2d2d2d',
    width: '50%',
    height: '6.5%',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    position: 'absolute',
    top: '60%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});