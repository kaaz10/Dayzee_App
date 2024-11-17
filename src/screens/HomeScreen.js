  import React from 'react';
  import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Dimensions } from 'react-native';

  const { width, height } = Dimensions.get('window');

  export default function HomeScreen({ navigation }) {
    return (
      <ImageBackground 
        source={require('../../assets/images/bg_first.jpg')}
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
      position: 'absolute',
      bottom: 75,
      alignItems: 'center',
      width: '100%',
    },
    button: {
      width: '50%',
      height: '38%',
      paddingVertical: 12,
      borderRadius: 25,
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 10,
    },
    loginButton: {
      backgroundColor: '#2d2d2d',
      marginBottom: 20
    },
    registerButton: {
      backgroundColor: '#66cc85',
    },
    buttonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '600',
    },
  });