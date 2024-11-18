import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const DietGoalScreen = () => {
  const [completedToday, setCompletedToday] = useState(false);
  const [completedDays, setCompletedDays] = useState([false, false, false, false, false, false, false]);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [places, setPlaces] = useState([]);
  const navigation = useNavigation();

  // Load saved data on component mount
  useEffect(() => {
    loadSavedData();
    checkAndResetWeek();
  }, []);

  // Load location data
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

  const loadSavedData = async () => {
    try {
      const savedCompletedDays = await AsyncStorage.getItem('completedDays');
      const savedCompletedToday = await AsyncStorage.getItem('completedToday');
      const savedWeekStart = await AsyncStorage.getItem('weekStart');

      if (savedCompletedDays) {
        setCompletedDays(JSON.parse(savedCompletedDays));
      }
      if (savedCompletedToday) {
        setCompletedToday(JSON.parse(savedCompletedToday));
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  };

  const checkAndResetWeek = async () => {
    try {
      const savedWeekStart = await AsyncStorage.getItem('weekStart');
      const currentDate = new Date();
      const currentWeekStart = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay())).toISOString().split('T')[0];

      if (savedWeekStart !== currentWeekStart) {
        // Reset for new week
        const newCompletedDays = [false, false, false, false, false, false, false];
        setCompletedDays(newCompletedDays);
        setCompletedToday(false);
        await AsyncStorage.setItem('completedDays', JSON.stringify(newCompletedDays));
        await AsyncStorage.setItem('completedToday', JSON.stringify(false));
        await AsyncStorage.setItem('weekStart', currentWeekStart);
      }
    } catch (error) {
      console.error('Error checking week:', error);
    }
  };

  const fetchNearbyPlaces = async (coords) => {
    const apiKey = Constants.expoConfig.extra.googleMapsApiKey;
    const { latitude, longitude } = coords;
    const radius = 2000;
    const types = 'restaurant|health|doctor';
    const keywords = 'healthy|nutrition|dietitian|organic';

    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${types}&keyword=${keywords}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      setPlaces(data.results);
    } catch (error) {
      console.error('Error fetching places:', error);
    }
  };

  const toggleCompletionStatus = async () => {
    try {
      const newCompletedToday = !completedToday;
      const currentDate = new Date();
      const dayIndex = currentDate.getDay();
      
      const newCompletedDays = [...completedDays];
      newCompletedDays[dayIndex] = newCompletedToday;

      setCompletedToday(newCompletedToday);
      setCompletedDays(newCompletedDays);

      await AsyncStorage.setItem('completedToday', JSON.stringify(newCompletedToday));
      await AsyncStorage.setItem('completedDays', JSON.stringify(newCompletedDays));
    } catch (error) {
      console.error('Error saving completion status:', error);
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
        <Text style={styles.headerText}>diet goals.</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Status: {completedToday ? 'Met diet goals today' : 'Not yet completed'}
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
        <Text style={styles.goalText}>Diet goals {selectedDaysCount} days this week</Text>
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

      <View style={styles.mapContainer}>
        <Text style={styles.mapText}>Find Healthy Food Nearby:</Text>
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
    width: 40,
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

export default DietGoalScreen;