import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

import Constants from 'expo-constants';

const apiKey = Constants.expoConfig.extra.googleMapsApiKey;

const StudyGoalScreen = () => {
  const [completedToday, setCompletedToday] = useState(false);
  const [completedDays, setCompletedDays] = useState([false, false, false, false, false, false, false]);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [places, setPlaces] = useState([]);

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

  // Fetch nearby places (cafes, libraries, schools) using Google Places API
  const fetchNearbyPlaces = async (coords) => {
    //const apiKey = 'AIzaSyB_QruBcOWZc2KxGX3uPUfxSFvASuj4d7Q'; // Replace with your Google Maps API key
    const apiKey = Constants.expoConfig.extra.googleMapsApiKey;
    const { latitude, longitude } = coords;
    const radius = 2000; // Search within 2 km
    const types = 'cafe|library|school'; // Types of places to search

    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${types}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      setPlaces(data.results);
    } catch (error) {
      console.error('Error fetching places:', error);
    }
  };

  const toggleDayCompletion = (index) => {
    const newCompletedDays = [...completedDays];
    newCompletedDays[index] = !newCompletedDays[index];
    setCompletedDays(newCompletedDays);
  };

  const toggleCompletionStatus = () => {
    setCompletedToday(prevState => !prevState);
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
      <Text style={styles.headerText}>Set Your Study Goals.</Text>

      {/* Status Section */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Status: {completedToday ? 'Studied today' : 'Not yet completed'}
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

      {/* Goal Section */}
      <View style={styles.goalContainer}>
        <Text style={styles.goalText}>Goal: Study {completedDays.filter(day => day).length} days this week</Text>
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

      {/* Google Maps Section */}
      <View style={styles.mapContainer}>
        <Text style={styles.mapText}>Find Study Spots Nearby:</Text>
        <MapView
          style={styles.map}
          region={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
          showsUserLocation={true}
          provider="google"
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
    backgroundColor: '#FFFFFF',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
    marginTop: 100,
  },
  statusContainer: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 15,
    marginVertical: 10,
    alignItems: 'center',
  },
  statusText: {
    color: '#333',
    marginBottom: 10,
    fontSize: 18,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    fontSize: 14,
    color: '#555',
  },
  disabledButton: {
    backgroundColor: '#d3d3d3',
  },
  goalContainer: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 15,
    marginVertical: 10,
    alignItems: 'center',
  },
  goalText: {
    color: '#333',
    fontSize: 18,
    fontWeight: '500',
  },
  bubbleRow: {
    flexDirection: 'row',
    marginTop: 15,
  },
  bubble: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubbleCompleted: {
    backgroundColor: '#4CAF50',
  },
  bubbleText: {
    fontSize: 14,
    color: '#333',
  },
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

export default StudyGoalScreen;
