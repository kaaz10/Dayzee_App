  // Importing necessary libraries and modules
  import React, { useState, useEffect } from 'react';
  import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Platform, Dimensions } from 'react-native';
  import { useNavigation } from '@react-navigation/native';
  import MapView, { Marker } from 'react-native-maps';
  import * as Location from 'expo-location';
  import Constants from 'expo-constants';
  import AsyncStorage from '@react-native-async-storage/async-storage';

  const { width, height } = Dimensions.get('window');
  const ASPECT_RATIO = width / height;
  const LATITUDE_DELTA = 0.02;
  const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const StudyGoalScreen = () => {
    const navigation = useNavigation();
    const [completedToday, setCompletedToday] = useState(false); // tracks if the study goal is completed today
    const [completedDays, setCompletedDays] = useState([false, false, false, false, false, false, false]); // tracks the days of the week when the study goal was completed
    const [lastCompletedDate, setLastCompletedDate] = useState(null); // stores the last date when the study goal was marked completed
    const [weekStartDate, setWeekStartDate] = useState(null); // holds the date of the current week for resetting progress
    const [location, setLocation] = useState(null); // stores the user's current location
    const [loading, setLoading] = useState(true); // indicates whether the app is loading location or data
    const [places, setPlaces] = useState([]); // stores nearby locations for studying
    const [errorMsg, setErrorMsg] = useState(null); // displays any errors related to geolocation

    // calculates the start of the week
    const getWeekStartDate = () => {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const startDate = new Date(now);
      startDate.setDate(now.getDate() - dayOfWeek);
      startDate.setHours(0, 0, 0, 0);
      return startDate;
    };

    // retrieves saved data from AsyncStorage
    const loadSavedData = async () => {
      try {
        const savedData = await AsyncStorage.getItem('studyData');
        if (savedData) {
          const { 
            completedDays: savedCompletedDays, 
            lastCompletedDate: savedLastCompletedDate,
            weekStartDate: savedWeekStartDate
          } = JSON.parse(savedData);

          const currentWeekStart = getWeekStartDate();
          if (!savedWeekStartDate || new Date(savedWeekStartDate) < currentWeekStart) {
            setCompletedDays([false, false, false, false, false, false, false]);
            setWeekStartDate(currentWeekStart.toISOString());
            setCompletedToday(false);
          } else {
            setCompletedDays(savedCompletedDays);
            setLastCompletedDate(savedLastCompletedDate);
            setWeekStartDate(savedWeekStartDate);
            
            const today = new Date().toDateString();
            setCompletedToday(savedLastCompletedDate === today);
          }
        } else {
          setWeekStartDate(getWeekStartDate().toISOString());
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    };

    // saves the current progress and last completed date into AsyncStorage
    const saveData = async (newCompletedDays, newLastCompletedDate) => {
      try {
        const dataToSave = {
          completedDays: newCompletedDays,
          lastCompletedDate: newLastCompletedDate,
          weekStartDate: weekStartDate
        };
        await AsyncStorage.setItem('studyData', JSON.stringify(dataToSave));
      } catch (error) {
        console.error('Error saving data:', error);
      }
    };

    // marks today as completed/not completed and updates states
    const toggleCompletionStatus = async () => {
      const today = new Date();
      const dayIndex = today.getDay();
      const todayString = today.toDateString();

      if (!completedToday) {
        const newCompletedDays = [...completedDays];
        newCompletedDays[dayIndex] = true;
        setCompletedDays(newCompletedDays);
        setCompletedToday(true);
        setLastCompletedDate(todayString);
        await saveData(newCompletedDays, todayString);
      } else {
        const newCompletedDays = [...completedDays];
        newCompletedDays[dayIndex] = false;
        setCompletedDays(newCompletedDays);
        setCompletedToday(false);
        setLastCompletedDate(null);
        await saveData(newCompletedDays, null);
      }
    };

    // calls loadSavedData
    useEffect(() => {
      loadSavedData();
    }, []);

    // requests location permission and stores user's location
    useEffect(() => {
      (async () => {
        try {
          let { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            setErrorMsg('Location permission denied');
            setLoading(false);
            return;
          }

          let locationResult = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setLocation(locationResult.coords);
          fetchNearbyPlaces(locationResult.coords);
          setLoading(false);
        } catch (error) {
          console.error('Location error:', error);
          setErrorMsg('Error getting location');
          setLoading(false);
        }
      })();
    }, []);

    // fetches nearby places for the study goal
    const fetchNearbyPlaces = async (coords) => {
      if (!Constants.expoConfig?.extra?.googleMapsApiKey) {
        console.error('Google Maps API key not configured');
        return;
      }

      const { latitude, longitude } = coords;
      const radius = 3000;
      const types = 'library|university|cafe';
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${types}&key=${Constants.expoConfig.extra.googleMapsApiKey}`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.results) {
          setPlaces(data.results);
        }
      } catch (error) {
        console.error('Error fetching places:', error);
      }
    };

    // loading indicator
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Loading...</Text>
        </View>
      );
    }

    // to display error message if need be
    if (errorMsg) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      );
    }

    // calculates number of marked days completed
    const selectedDaysCount = completedDays.filter(day => day).length;

    // displays all the containers with buttons and the maps with marked locations
    return (
      <ScrollView style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>◀ Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerText}>study goals.</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            Status: {completedToday ? 'Studied today' : 'Not yet completed'}
          </Text>
          <TouchableOpacity
            style={[styles.button, completedToday && styles.completedButton]}
            onPress={toggleCompletionStatus}
          >
            <Text style={styles.buttonText}>
              {completedToday ? 'Mark as Not Done' : 'Mark as Done'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.goalContainer}>
          <Text style={styles.goalText}>Study goals {selectedDaysCount} days this week</Text>
          <View style={styles.bubbleRow}>
            {daysOfWeek.map((day, index) => (
              <View
                key={index}
                style={[styles.bubble, completedDays[index] && styles.bubbleCompleted]}
              >
                <Text style={styles.bubbleText}>{day}</Text>
              </View>
            ))}
          </View>
        </View>

        {location && (
          <View style={styles.mapContainer}>
            <Text style={styles.mapText}>Find Study Spots Nearby:</Text>
            <View style={styles.mapWrapper}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                  latitudeDelta: LATITUDE_DELTA,
                  longitudeDelta: LONGITUDE_DELTA,
                }}
                showsUserLocation={true}
                showsMyLocationButton={true}
                showsCompass={true}
              >
                {places.map((place, index) => (
                  <Marker
                    key={index}
                    coordinate={{
                      latitude: place.geometry.location.lat,
                      longitude: place.geometry.location.lng,
                    }}
                    title={place.name}
                    description={place.vicinity}
                  />
                ))}
              </MapView>
            </View>
          </View>
        )}
        
        <View style={styles.bottomPadding} />
      </ScrollView>
    );
  };


  // styles all the containers and text
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#E1EFEF',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    errorText: {
      color: 'red',
      textAlign: 'center',
      fontSize: 16,
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      marginTop: Platform.OS === 'ios' ? 60 : 40,
      marginBottom: 20,
    },
    backButton: {
      backgroundColor: '#2d2d2d',
      borderRadius: 20,
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    backButtonText: {
      color: '#fff',
      fontSize: 14,
    },
    headerText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#2d2d2d',
      flex: 1,
      textAlign: 'center',
    },
    placeholder: {
      width: 50,
    },
    statusContainer: {
      backgroundColor: '#2d2d2d',
      padding: 20,
      borderRadius: 15,
      marginVertical: 10,
      marginHorizontal: 20,
      alignItems: 'center',
    },
    statusText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '500',
    },
    button: {
      backgroundColor: '#4caf50',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 10,
      marginTop: 10,
    },
    completedButton: {
      backgroundColor: '#9E9E9E',
    },
    buttonText: {
      fontSize: 16,
      color: '#fff',
      fontWeight: '500',
    },
    goalContainer: {
      padding: 20,
      borderRadius: 15,
      marginVertical: 10,
      marginHorizontal: 20,
      backgroundColor: '#2d2d2d',
    },
    goalText: {
      fontSize: 18,
      color: '#fff',
      marginBottom: 10,
      alignSelf: 'center',
    },
    bubbleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignSelf: 'center',
    },
    bubble: {
      backgroundColor: '#f0f0f0',
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 5,
    },
    bubbleCompleted: {
      backgroundColor: '#4caf50',
    },
    bubbleText: {
      color: '#2d2d2d',
      fontSize: 16,
    },
    mapContainer: {
      flex: 1,
      marginVertical: 10,
      marginHorizontal: 20,
      backgroundColor: '#2d2d2d',
      borderRadius: 15,
      padding: 15,
      height: 500,
    },
    mapWrapper: {
      flex: 1,
      borderRadius: 15,
      overflow: 'hidden',
    },
    map: {
      width: '100%',
      height: '100%',
    },
    mapText: {
      fontSize: 18,
      fontWeight: '500',
      marginBottom: 10,
      color: '#fff',
    },
    bottomPadding: {
      height: 20,
    },
  });

  export default StudyGoalScreen;