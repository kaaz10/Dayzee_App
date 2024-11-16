import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';

function MainScreen() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(moment());
  const navigation = useNavigation();

  const defaultHabits = [
    { id: 1, name: 'Study Goals' },
    { id: 2, name: 'Exercise Goals' },
    { id: 3, name: 'Diet Goals' },
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
      const data = await response.json();
      setWeather(data);
    } catch (error) {
      Alert.alert('Weather Error', 'Unable to fetch weather data.');
    } finally {
      setLoading(false);
    }
  };

  const startOfWeek = selectedDate.clone().startOf('week');
  const days = Array.from({ length: 7 }, (_, i) => startOfWeek.clone().add(i, 'days'));

  const renderWeather = () => {
    if (loading) {
      return <ActivityIndicator size="large" />;
    }

    if (!weather || !weather.main) {
      return <Text style={styles.weatherError}>Weather unavailable</Text>;
    }

    return (
      <View style={styles.weatherContainer}>
        <View style={styles.weatherRow}>
          <Text style={styles.weatherTemp}>{`${Math.round(weather.main.temp)}°C`}</Text>
          <Text style={styles.weatherCondition}>{`${weather.weather[0]?.description || 'Unknown'}`}</Text>
        </View>
        <View style={styles.weatherDivider} />
        <Text style={styles.weatherLocation}>{weather.name || 'Unknown Location'}</Text>
      </View>
    );
  };

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
      <View style={styles.weekContainer}>
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
            <Text style={[styles.dayText, day.isSame(moment(), 'day') && styles.currentDayText]}>{day.format('ddd')}</Text>
            <Text style={[styles.dateText, day.isSame(moment(), 'day') && styles.currentDayText]}>{day.format('D')}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderHabitButtons = () => (
    <View style={styles.habitsContainer}>
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.habitButton}
          onPress={() => navigation.navigate('StudyGoal')}
        >
          <Text style={styles.habitName}>{defaultHabits[0].name}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.habitButton}>
          <Text style={styles.habitName}>{defaultHabits[2].name}</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.habitButton}>
        <Text style={styles.habitName}>{defaultHabits[1].name}</Text>
      </TouchableOpacity>
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

export default function App() {
  return <MainScreen />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#E1EFEF',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    alignSelf: 'center',
    color: '#2d2d2d',
    marginVertical: 40,
  },
  weatherContainer: {
    backgroundColor: '#2d2d2d',
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
  },
  weatherRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weatherTemp: {
    fontSize: 26,
    color: '#fff',
    fontWeight: 'bold',
  },
  weatherCondition: {
    fontSize: 16,
    color: '#fff',
    textTransform: 'capitalize',
  },
  weatherDivider: {
    height: 1,
    backgroundColor: '#fff',
    marginVertical: 10,
  },
  weatherLocation: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  calendarContainer: {
    marginVertical: 20,
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderRadius: 10,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 20,
    color: '#2d2d2d',
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d2d2d',
  },
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  dayContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 1,
  },
  selectedDay: {
    backgroundColor: '#2d2d2d',
  },
  currentDay: {
    backgroundColor: '#4caf50',
  },
  currentDayText: {
    color: '#fff',
  },
  habitsContainer: {
    marginVertical: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  habitButton: {
    flex: 0.48,
    backgroundColor: '#2d2d2d',
    padding: 35,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  habitName: {
    fontSize: 18,
    color: '#fff',
    fontWeight: ' normal',
  },
});

