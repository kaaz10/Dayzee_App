import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import * as Location from 'expo-location';
import { Calendar } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';

export default function MainScreen() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState('');
  const [energy, setEnergy] = useState(3);
  const navigation = useNavigation();

  const defaultHabits = [
    { id: 1, name: 'Study', icon: '📚' },
    { id: 2, name: 'Exercise', icon: '💪' },
    { id: 3, name: 'Eat Food', icon: '🍽️' },
  ];

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Weather needs location access to work');
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      console.log('Location fetched:', location);

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${location.coords.latitude}&lon=${location.coords.longitude}&units=metric&appid=658daa51909eb0fbb3b7a35756293a9e`
      );

      if (!response.ok) {
        throw new Error(`Weather API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Weather data:', data);
      
      if (!data.main || !data.weather) {
        throw new Error('Invalid weather data format');
      }

      setWeather(data);
    } catch (error) {
      console.error('Weather fetch error:', error);
      Alert.alert(
        'Weather Error',
        'Unable to fetch weather data. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderWeather = () => {
    if (loading) {
      return (
        <View style={styles.weatherContainer}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      );
    }

    if (!weather || !weather.main) {
      return (
        <View style={styles.weatherContainer}>
          <Text style={styles.weatherError}>Weather unavailable</Text>
        </View>
      );
    }

    return (
      <View style={styles.weatherContainer}>
        <Text style={styles.temperature}>
          {Math.round(weather.main.temp)}°C
        </Text>
        <Text style={styles.weatherDescription}>
          {weather.weather[0]?.description || 'Unknown'}
        </Text>
        <Text style={styles.location}>{weather.name || 'Unknown Location'}</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={fetchWeather}
        >
          <Text>🔄 Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderHabitButton = (habit) => (
    <TouchableOpacity
      key={habit.id}
      style={styles.habitButton}
      onPress={() => {
        if (habit.name === 'Study') {
          navigation.navigate('StudyGoal');
        } else {
          console.log(`${habit.name} pressed`);
        }
      }}
    >
      <Text style={styles.habitIcon}>{habit.icon}</Text>
      <Text style={styles.habitName}>{habit.name}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.greeting}>make dayze count.</Text>
      
      {renderWeather()}

      <Calendar
        style={styles.calendar}
        theme={{
          backgroundColor: '#ffffff',
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#b6c1cd',
          selectedDayBackgroundColor: '#2d2d2d',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#66cc85',
          dayTextColor: '#2d4150',
          textDisabledColor: '#d9e1e8'
        }}
        onDayPress={day => {
          setSelected(day.dateString);
        }}
        markedDates={{
          [selected]: { selected: true, selectedColor: '#2d2d2d' }
        }}
      />

      <View style={styles.energyContainer}>
        <Text style={styles.energyText}>Today you felt Not great.</Text>
        <Text style={styles.energySubtext}>Energy {energy}/5</Text>
      </View>

      <View style={styles.habitsContainer}>
        {defaultHabits.map(habit => renderHabitButton(habit))}
        
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => console.log('Add new habit')}
        >
          <Text style={styles.addButtonText}>+</Text>
          <Text style={styles.addButtonLabel}>Add New</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 60,
    marginBottom: 20,
    alignSelf: 'center'
  },
  weatherContainer: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  weatherError: {
    fontSize: 16,
    color: '#666',
  },
  temperature: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  weatherDescription: {
    fontSize: 18,
    color: '#666',
    textTransform: 'capitalize',
  },
  location: {
    fontSize: 16,
    color: '#888',
  },
  refreshButton: {
    marginTop: 10,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  calendar: {
    marginBottom: 20,
    borderRadius: 10,
  },
  energyContainer: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  energyText: {
    fontSize: 18,
    fontWeight: '500',
  },
  energySubtext: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  habitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  habitButton: {
    width: '48%',
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  habitIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '500',
  },
  addButton: {
    width: '48%',
    backgroundColor: '#2d2d2d',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  addButtonText: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 8,
  },
  addButtonLabel: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
});