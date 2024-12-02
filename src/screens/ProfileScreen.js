  //importing necessary libraries and modules
  import React, { useState, useEffect } from 'react';
  import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Modal, Image, ActivityIndicator, Platform } from 'react-native';
  import { auth, db } from '../config/firebase';
  import {signOut, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
  import { doc, getDoc, updateDoc } from 'firebase/firestore';
  import * as ImagePicker from 'expo-image-picker';
  import AsyncStorage from '@react-native-async-storage/async-storage';
  import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
  import * as FileSystem from 'expo-file-system';

  export default function ProfileScreen({ navigation }) {
    const [user, setUser] = useState(null); // stores the current authenticated user
    const [userData, setUserData] = useState(null); // stores user-specific data retrieved from Firestore 
    const [modalVisible, setModalVisible] = useState(false); // controls the visibility of the pop up modal
    const [currentPassword, setCurrentPassword] = useState(''); // store the current passwords 
    const [newPassword, setNewPassword] = useState(''); // store the new set passwords 
    const [loading, setLoading] = useState(false); // checks whether the password update process is in progress
    const [imageUri, setImageUri] = useState(null); // stores the URI of the profile image
    const [uploadingImage, setUploadingImage] = useState(false); // checks if an image is currently being uploaded

    // gets the current authenticated user, loads their data, and loads the user's profile image
    useEffect(() => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        setUser(currentUser);
        fetchUserData(currentUser.uid);
        loadProfileImage(currentUser.uid);
      }
    }, []);

    // checks for camera and media library permissions
    useEffect(() => {
      (async () => {
        if (Platform.OS !== 'web') {
          const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
          
          if (mediaStatus !== 'granted' || cameraStatus !== 'granted') {
            Alert.alert(
              'Permissions Required',
              'Please grant camera and media library permissions to use this feature.'
            );
          }
        }
      })();
    }, []);

    // checks if a profile image has been saved locally using AsyncStorage
    const loadProfileImage = async (userId) => {
      try {
        const savedImageUri = await AsyncStorage.getItem(`@profile_image_${userId}`);
        if (savedImageUri) {
          const fileInfo = await FileSystem.getInfoAsync(savedImageUri);
          if (fileInfo.exists) {
            setImageUri(savedImageUri);
          }
        }
      } catch (error) {
        console.error('Error loading profile image:', error);
      }
    };

    // retrieves user data from Firestore
    const fetchUserData = async (uid) => {
      try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Error', 'Failed to fetch user data');
      }
    };

    // saves the selected profile image to the device's local storage
    const saveImageLocally = async (uri, userId) => {
      try {
        const filename = `profile_${userId}_${Date.now()}.jpg`;
        const destination = `${FileSystem.documentDirectory}${filename}`;

        await FileSystem.copyAsync({
          from: uri,
          to: destination
        });

        await AsyncStorage.setItem(`@profile_image_${userId}`, destination);

        if (imageUri) {
          try {
            await FileSystem.deleteAsync(imageUri);
          } catch (error) {
            console.log('Error deleting old image:', error);
          }
        }

        return destination;
      } catch (error) {
        console.error('Error saving image:', error);
        throw error;
      }
    };

    // opens the device's image picker and lets the user select an image
    const pickImage = async () => {
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
        });

        if (!result.canceled && result.assets && result.assets[0]) {
          await handleImageSelected(result.assets[0].uri);
        }
      } catch (error) {
        console.error('Error picking image:', error);
        Alert.alert('Error', 'Failed to pick image. Please try again.');
      }
    };

    // opens the device's camera and allows the user to take a photo
    const takePhoto = async () => {
      try {
        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
        });

        if (!result.canceled && result.assets && result.assets[0]) {
          await handleImageSelected(result.assets[0].uri);
        }
      } catch (error) {
        console.error('Error taking photo:', error);
        Alert.alert('Error', 'Failed to take photo. Please try again.');
      }
    };

    // handles the process of selecting or capturing an image
    const handleImageSelected = async (uri) => {
      if (!auth.currentUser) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      try {
        setUploadingImage(true);
        
        const savedUri = await saveImageLocally(uri, auth.currentUser.uid);
        setImageUri(savedUri);
        
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          hasProfilePicture: true
        });

        Alert.alert('Success', 'Profile picture updated successfully!');
      } catch (error) {
        console.error('Error handling image:', error);
        Alert.alert('Error', 'Failed to update profile picture');
      } finally {
        setUploadingImage(false);
      }
    };

    // signs the user out using Firebase's signOut method
    const handleSignOut = async () => {
      try {
        await signOut(auth);
        navigation.replace('Home');
      } catch (error) {
        Alert.alert('Error', error.message);
      }
    };

    // handles the password change process
    const handleChangePassword = async () => {
      if (!currentPassword || !newPassword) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }

      try {
        setLoading(true);
        const credential = EmailAuthProvider.credential(
          user.email,
          currentPassword
        );
        
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
        
        Alert.alert('Success', 'Password updated successfully');
        setModalVisible(false);
        setCurrentPassword('');
        setNewPassword('');
      } catch (error) {
        console.error('Password change error:', error);
        Alert.alert('Error', error.message);
      } finally {
        setLoading(false);
      }
    };

    // shows an alert with options for the user to either take a photo or choose an image
    const showImageOptions = () => {
      Alert.alert(
        'Change Profile Picture',
        'Choose an option',
        [
          {
            text: 'Take Photo',
            onPress: takePhoto,
          },
          {
            text: 'Choose from Gallery',
            onPress: pickImage,
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ],
        { cancelable: true }
      );
    };

    // if there is no user data, a loading spinner is displayed
    if (!user || !userData) {
      return (
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#2d2d2d" />
        </View>
      );
    }

    // creates the user interface of the profile screen
    return (
      <View style={styles.container}>
        <Text style={styles.header}>profile.</Text>
        
        <View style={styles.profileCard}>
          <TouchableOpacity onPress={showImageOptions} style={styles.profileImageContainer}>
            <View style={styles.cameraIconOverlay}>
              <Icon name="camera" size={20} color="#fff" />
            </View>
            {uploadingImage ? (
              <ActivityIndicator size="large" color="#2d2d2d" />
            ) : imageUri ? (
              <Image 
                source={{ uri: imageUri }} 
                style={styles.profileImage}
                onError={(e) => {
                  console.error('Image loading error:', e.nativeEvent.error);
                  setImageUri(null);
                }}
              />
            ) : (
              <Icon name="account-circle" size={80} color="#2d2d2d" />
            )}
          </TouchableOpacity>
          
          <View style={styles.infoContainer}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.info}>{userData.name || 'Not set'}</Text>
            
            <Text style={styles.label}>Email</Text>
            <Text style={styles.info}>{user.email}</Text>
          </View>

          <TouchableOpacity
            style={styles.changePasswordButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.buttonText}>Change Password</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalHeader}>Change Password</Text>
              
              <TextInput
                placeholder="Current Password"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                style={styles.input}
                secureTextEntry
              />
              
              <TextInput
                placeholder="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                style={styles.input}
                secureTextEntry
              />
              
              <TouchableOpacity
                style={styles.modalChangeButton}
                onPress={handleChangePassword}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Updating...' : 'Update Password'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancelButton}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // styles all containers, buttons, text, etc...
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
      marginBottom: 20,
    },
    profileCard: {
      backgroundColor: '#fff',
      width: '90%',
      borderRadius: 20,
      padding: 20,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    profileImageContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      marginBottom: 20,
      position: 'relative',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f0f0f0',
      overflow: 'visible',
    },
    profileImage: {
      width: '100%',
      height: '100%',
      borderRadius: 50,
    },
    cameraIconOverlay: {
      position: 'absolute',
      top: 70, 
      right: -10,
      backgroundColor: '#2d2d2d',
      borderRadius: 15,
      padding: 5,
      zIndex: 1, 
      elevation: 6, 
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    infoContainer: {
      width: '100%',
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      color: '#777',
      marginBottom: 5,
    },
    info: {
      fontSize: 18,
      color: '#2d2d2d',
      marginBottom: 15,
    },
    changePasswordButton: {
      backgroundColor: '#2d2d2d',
      paddingHorizontal: 40,
      paddingVertical: 15,
      borderRadius: 25,
      width: '100%',
      marginBottom: 10,
    },
    logoutButton: {
      backgroundColor: '#ff5252',
      paddingHorizontal: 40,
      paddingVertical: 15,
      borderRadius: 25,
      width: '100%',
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      textAlign: 'center',
      fontWeight: '500',
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
      width: '80%',
      backgroundColor: '#fff',
      padding: 20,
      borderRadius: 20,
    },
    modalHeader: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#2d2d2d',
      marginBottom: 20,
      textAlign: 'center',
    },
    input: {
      borderWidth: 1,
      borderColor: '#ccc',
      padding: 15,
      borderRadius: 20,
      width: '100%',
      marginBottom: 15,
    },
    modalChangeButton: {
      backgroundColor: '#2d2d2d',
      paddingHorizontal: 40,
      paddingVertical: 15,
      borderRadius: 25,
      marginTop: 10,
    },
    modalCancelButton: {
      marginTop: 15,
      color: '#2d2d2d',
      textAlign: 'center',
      fontSize: 16,
    },
  });