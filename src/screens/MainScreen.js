import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';

export default function MainScreen() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(moment()); // Start with today's date
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
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${location.coords.latitude}&lon=${location.coords.longitude}&units=metric&appid=658daa51909eb0fbb3b7a35756293a9e`
      );

      if (!response.ok) {
        throw new Error(`Weather API Error: ${response.status}`);
      }

      const data = await response.json();
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
          <ActivityIndicator size="large" color="#2d2d2d" />
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
        <Text style={styles.weatherTitle}>Today's Weather</Text>
        <Text style={styles.weatherText}>
          {`${Math.round(weather.main.temp)}° C | ${weather.weather[0]?.description || 'Unknown'} `}
        </Text>
        <Text style={styles.weatherLocation}>{weather.name || 'Unknown Location'}</Text>
      </View>
    );
  };

  const startOfWeek = selectedDate.clone().startOf('week');
  const days = Array.from({ length: 7 }, (_, i) => startOfWeek.clone().add(i, 'days'));

  const renderWeeklyCalendar = () => (
    <View style={styles.calendarContainer}>
      <View style={styles.calendarHeader}>
        <TouchableOpacity onPress={() => setSelectedDate(selectedDate.clone().subtract(7, 'days'))}>
          <Text style={styles.arrow}>◀</Text>
        </TouchableOpacity>
        <Text style={styles.monthText}>{selectedDate.format('MMMM YYYY')}</Text>
        <TouchableOpacity onPress={() => setSelectedDate(selectedDate.clone().add(7, 'days'))}>
          <Text style={styles.arrow}>▶</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {days.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayContainer,
              day.isSame(selectedDate, 'day') && styles.selectedDay,
              day.isSame(moment(), 'day') && styles.currentDay,
            ]}
            onPress={() => setSelectedDate(day)}
          >
            <Text style={styles.dayText}>{day.format('ddd')}</Text>
            <Text style={styles.dateText}>{day.format('D')}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderHabitButtons = () => (
    <View style={styles.habitsGrid}>
      <View style={styles.habitRow}>
        {defaultHabits.slice(0, 2).map(habit => (
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
        ))}
      </View>
      <View style={styles.habitRow}>
        <TouchableOpacity
          key={defaultHabits[2].id}
          style={[styles.habitButton, styles.fullWidthHabitButton]}
          onPress={() => console.log('Eat Food pressed')}
        >
          <Text style={styles.habitIcon}>{defaultHabits[2].icon}</Text>
          <Text style={styles.habitName}>{defaultHabits[2].name}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.greeting}>make dayze count.</Text>

      {renderWeather()}

      {renderWeeklyCalendar()}

      {renderHabitButtons()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E1EFEF',
    padding: 20,
  },
  greeting: {
    marginTop: 40,
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 20,
    alignSelf: 'center',
    color: '2d2d2d'
  },
  weatherContainer: {
    backgroundColor: '#2d2d2d',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  weatherTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  weatherText: {
    fontSize: 16,
    color: '#fff',
  },
  weatherLocation: {
    fontSize: 14,
    color: '#ddd',
    marginTop: 5,
  },
  calendarContainer: {
    marginBottom: 20,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  arrow: {
    fontSize: 24,
    color: '#2d2d2d',
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  dayContainer: {
    width: 50,
    alignItems: 'center',
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
  },
  selectedDay: {
    backgroundColor: '#2d2d2d',
    color: '#fff',
  },
  currentDay: {
    backgroundColor: '#4caf50',
  },
  dayText: {
    fontSize: 14,
    color: '#2d2d2d',
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d2d2d',
  },
  habitsGrid: {
    marginBottom: 20,
  },
  habitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  habitButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 15,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  fullWidthHabitButton: {
    flex: 1,
    marginHorizontal: 0,
  },
  habitIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '500',
    color: '2d2d2d'
  },
});