  import React, { useState, useEffect } from 'react';
  import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
  import { useNavigation } from '@react-navigation/native';
  import { Pedometer } from 'expo-sensors';
  import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
  import * as Location from 'expo-location';
  import Constants from 'expo-constants';
  import AsyncStorage from '@react-native-async-storage/async-storage';

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const ExerciseScreen = () => {
    const [completedToday, setCompletedToday] = useState(false);
    const [completedDays, setCompletedDays] = useState([false, false, false, false, false, false, false]);
    const [lastCompletedDate, setLastCompletedDate] = useState(null);
    const [weekStartDate, setWeekStartDate] = useState(null);
    const navigation = useNavigation();
    const [isPedometerAvailable, setIsPedometerAvailable] = useState('checking');
    const [currentStepCount, setCurrentStepCount] = useState(0);
    const [lastWeekSteps, setLastWeekSteps] = useState(0);
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [places, setPlaces] = useState([]);

    // Get the current week's start date (Sunday)
    const getWeekStartDate = () => {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const startDate = new Date(now);
      startDate.setDate(now.getDate() - dayOfWeek);
      startDate.setHours(0, 0, 0, 0);
      return startDate;
    };

    // Load saved data
    const loadSavedData = async () => {
      try {
        const savedData = await AsyncStorage.getItem('exerciseData');
        if (savedData) {
          const { 
            completedDays: savedCompletedDays, 
            lastCompletedDate: savedLastCompletedDate,
            weekStartDate: savedWeekStartDate
          } = JSON.parse(savedData);

          // Check if we're in a new week
          const currentWeekStart = getWeekStartDate();
          if (!savedWeekStartDate || new Date(savedWeekStartDate) < currentWeekStart) {
            // Reset for new week
            setCompletedDays([false, false, false, false, false, false, false]);
            setWeekStartDate(currentWeekStart.toISOString());
            setCompletedToday(false);
          } else {
            setCompletedDays(savedCompletedDays);
            setLastCompletedDate(savedLastCompletedDate);
            setWeekStartDate(savedWeekStartDate);
            
            // Check if already completed today
            const today = new Date().toDateString();
            setCompletedToday(savedLastCompletedDate === today);
          }
        } else {
          // Initialize with current week start
          setWeekStartDate(getWeekStartDate().toISOString());
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    };

    // Save data
    const saveData = async (newCompletedDays, newLastCompletedDate) => {
      try {
        const dataToSave = {
          completedDays: newCompletedDays,
          lastCompletedDate: newLastCompletedDate,
          weekStartDate: weekStartDate
        };
        await AsyncStorage.setItem('exerciseData', JSON.stringify(dataToSave));
      } catch (error) {
        console.error('Error saving data:', error);
      }
    };

    useEffect(() => {
      loadSavedData();
    }, []);

    const toggleCompletionStatus = async () => {
      const today = new Date();
      const dayIndex = today.getDay();
      const todayString = today.toDateString();

      if (!completedToday) {
        // Mark today as completed
        const newCompletedDays = [...completedDays];
        newCompletedDays[dayIndex] = true;
        setCompletedDays(newCompletedDays);
        setCompletedToday(true);
        setLastCompletedDate(todayString);
        await saveData(newCompletedDays, todayString);
      } else {
        // Unmark today
        const newCompletedDays = [...completedDays];
        newCompletedDays[dayIndex] = false;
        setCompletedDays(newCompletedDays);
        setCompletedToday(false);
        setLastCompletedDate(null);
        await saveData(newCompletedDays, null);
      }
    };

    // Pedometer setup
    useEffect(() => {
      let subscription;

      const subscribe = async () => {
        const isAvailable = await Pedometer.isAvailableAsync();
        setIsPedometerAvailable(String(isAvailable));

        if (isAvailable) {
          subscription = Pedometer.watchStepCount(result => {
            setCurrentStepCount(result.steps);
          });

          const end = new Date();
          const start = new Date();
          start.setDate(end.getDate() - 7);

          const pastStepCountResult = await Pedometer.getStepCountAsync(start, end);
          if (pastStepCountResult) {
            setLastWeekSteps(pastStepCountResult.steps);
          }
        }
      };

      subscribe();

      return () => {
        if (subscription && typeof subscription.remove === 'function') {
          subscription.remove();
        }
      };
    }, []);

    // Location and places setup
    useEffect(() => {
      (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          alert('Permission to access location was denied.');
          setLoading(false);
          return;
        }
        let loc = await Location.getCurrentPositionAsync({});
        setLocation(loc.coords);
        setLoading(false);
        fetchNearbyPlaces(loc.coords);
      })();
    }, []);

    const fetchNearbyPlaces = async (coords) => {
      const apiKey = Constants.expoConfig.extra.googleMapsApiKey;
      const { latitude, longitude } = coords;
      const radius = 3000;
      const types = 'gym|parks|recreation_centre';

      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${types}&key=${apiKey}`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        setPlaces(data.results);
      } catch (error) {
        console.error('Error fetching places:', error);
      }
    };

    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Loading...</Text>
        </View>
      );
    }

    const selectedDaysCount = completedDays.filter(day => day).length;

    return (
      <ScrollView style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>◀ Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerText}>exercise goals.</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            Status: {completedToday ? 'Exercised today' : 'Not yet completed'}
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
          <Text style={styles.goalText}>Exercise goals {selectedDaysCount} days this week</Text>
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

        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>Current Steps:</Text>
          <Text style={styles.stepsText}>{currentStepCount} steps</Text>

          <Text style={styles.weeklyStepsHeader}>Steps from last 7 days:</Text>
          <Text style={styles.weeklyStepsText}>{lastWeekSteps} steps</Text>
        </View>

        <View style={styles.mapContainer}>
          <Text style={styles.mapText}>Find Exercise Spots Nearby:</Text>
          {location && (
            <MapView
              style={styles.map}
              region={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              }}
              showsUserLocation={true}
              provider={PROVIDER_GOOGLE}
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
          )}
        </View>
        
        <View style={styles.bottomPadding} />
      </ScrollView>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#E1EFEF',
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      marginTop: 60,
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
    progressContainer: {
      marginTop: 20,
      padding: 20,
      borderRadius: 15,
      marginHorizontal: 20,
      backgroundColor: '#2d2d2d',
    },
    progressText: {
      fontSize: 18,
      color: '#fff',
      marginBottom: 10,
      alignSelf: 'center',
    },
    stepsText: {
      fontSize: 16,
      color: '#fff',
      textAlign: 'center',
    },
    weeklyStepsHeader: {
      fontSize: 18,
      color: '#fff',
      marginTop: 20,
      textAlign: 'center',
    },
    weeklyStepsText: {
      fontSize: 16,
      color: '#fff',
      textAlign: 'center',
    },
    mapContainer: {
      flex: 1,
      marginVertical: 10,
      marginHorizontal: 20,
    },
    map: {
      width: '100%',
      height: 300,
    },
    mapText: {
      fontSize: 18,
      fontWeight: '500',
      marginBottom: 10,
      color: '#333',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    bottomPadding: {
      height: 20,
    },
  });

  export default ExerciseScreen;