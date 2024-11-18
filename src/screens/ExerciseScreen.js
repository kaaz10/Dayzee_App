import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Pedometer } from 'expo-sensors';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import Constants from 'expo-constants';

const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const ExerciseScreen = () => {
  const [completedToday, setCompletedToday] = useState(false);
  const [completedDays, setCompletedDays] = useState([false, false, false, false, false, false, false]);
  const navigation = useNavigation();
  const [isPedometerAvailable, setIsPedometerAvailable] = useState('checking');
  const [currentStepCount, setCurrentStepCount] = useState(0);
  const [lastWeekSteps, setLastWeekSteps] = useState(0);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [places, setPlaces] = useState([]);

  const selectedDaysCount = completedDays.filter(day => day).length;

  const toggleDayCompletion = (index) => {
    const newCompletedDays = [...completedDays];
    newCompletedDays[index] = !newCompletedDays[index];
    setCompletedDays(newCompletedDays);
  };

  const toggleCompletionStatus = () => {
    setCompletedToday(prevState => !prevState);
  };

  useEffect(() => {
    let subscription;

    const subscribe = async () => {
      const isAvailable = await Pedometer.isAvailableAsync();
      setIsPedometerAvailable(String(isAvailable));

      if (isAvailable) {
        // Subscribe to current step count updates
        subscription = Pedometer.watchStepCount(result => {
          setCurrentStepCount(result.steps);
        });

        // Fetch last 7 days of step count
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
      // Cleanup the subscription if it exists
      if (subscription && typeof subscription.remove === 'function') {
        subscription.remove();
      }
    };
  }, []);

  useEffect(() => {
    // Fetch user location when the component mounts
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

  // Fetch nearby parks, gyms, and recreation centers using Google Places API
  const fetchNearbyPlaces = async (coords) => {
    const apiKey = Constants.expoConfig.extra.googleMapsApiKey;
    const { latitude, longitude } = coords;
    const radius = 2000; // Search within 2 km
    const types = 'park|gym|recreation_center'; // Types of places to search

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

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>◀ Back</Text>
      </TouchableOpacity>

      <Text style={styles.headerText}>Set Your Exercise Goals</Text>

      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Status: {completedToday ? 'Exercised today' : 'Not yet completed'}
        </Text>
        <TouchableOpacity
          style={[styles.button, completedToday && styles.disabledButton]}
          onPress={toggleCompletionStatus}
        >
          <Text style={styles.buttonText}>
            {completedToday ? 'Mark as Not Done' : 'Mark as Done'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.goalContainer}>
        <Text style={styles.goalText}>Goal: Exercise {selectedDaysCount} days this week</Text>
        <View style={styles.bubbleRow}>
          {daysOfWeek.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.bubble, completedDays[index] && styles.bubbleCompleted]}
              onPress={() => toggleDayCompletion(index)}
            >
              <Text style={styles.bubbleText}>{day}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>Current Steps:</Text>
        <Text style={styles.stepsText}>{currentStepCount} steps</Text>

        <Text style={styles.weeklyStepsHeader}>Steps from last 7 days:</Text>
        <Text style={styles.weeklyStepsText}>{lastWeekSteps} steps</Text>
      </View>

      {/* Google Maps Section */}
      <View style={styles.mapContainer}>
        <Text style={styles.mapText}>Find Exercise Spots Nearby:</Text>
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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#E1EFEF',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    marginTop: 60,
    backgroundColor: '#2d2d2d',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 15,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2d2d2d',
    marginVertical: 20,
  },
  statusContainer: {
    backgroundColor: '#2d2d2d',
    padding: 20,
    borderRadius: 15,
    marginVertical: 10,
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
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  disabledButton: {
    backgroundColor: '#9E9E9E',
  },
  goalContainer: {
    padding: 20,
    borderRadius: 15,
    marginVertical: 10,
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
    marginVertical: 10,
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
  // Add styles for the map container
  mapContainer: {
    flex: 1,
    marginVertical: 10,
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
});

export default ExerciseScreen;
