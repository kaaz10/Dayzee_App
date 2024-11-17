  import React, { useState, useEffect } from 'react';
  import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
  import * as Location from 'expo-location';
  import { useNavigation } from '@react-navigation/native';
  import moment from 'moment';

  function MainScreen() {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(moment());
    const navigation = useNavigation();

    const defaultHabits = [
      { id: 1, name: 'Study', icon: require('../../assets/images/Study.png'), screen: 'StudyGoal' },
      { id: 2, name: 'Exercise', icon: require('../../assets/images/Exercise.png'), screen: 'Exercise' },
      { id: 3, name: 'Diet', icon: require('../../assets/images/Food.png'), screen: 'Diet' },
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
      if (loading) return <ActivityIndicator size="large" />;
      if (!weather || !weather.main) return <Text style={styles.weatherError}>Weather unavailable</Text>;

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
              <Text
                style={[
                  styles.dayText,
                  day.isSame(selectedDate, 'day') && styles.selectedDayText,
                  day.isSame(moment(), 'day') && styles.currentDayText,
                ]}
              >
                {day.format('dd')}
              </Text>
              <Text
                style={[
                  styles.dateText,
                  day.isSame(selectedDate, 'day') && styles.selectedDayText,
                  day.isSame(moment(), 'day') && styles.currentDayText,
                ]}
              >
                {day.format('D')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );

    const renderHabitButtons = () => (
      <View style={styles.habitsContainer}>
        <View style={styles.habitRow}>
          {defaultHabits.map((habit) => (
            <TouchableOpacity
              key={habit.id}
              style={styles.habitButton}
              onPress={() => navigation.navigate(habit.screen)}
            >
              <Image source={habit.icon} style={styles.habitIcon} />
              <Text style={styles.habitName}>{habit.name}</Text>
              <Text style={styles.habitDescription}>Goals</Text>
            </TouchableOpacity>
          ))}
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
      padding: 20,
      backgroundColor: '#E1EFEF',
    },
    greeting: {
      fontSize: 22,
      fontWeight: 'bold',
      alignSelf: 'center',
      color: '#2d2d2d',
      marginTop: 50,
      marginBottom: 15,
    },
    weatherContainer: {
      backgroundColor: '#2d2d2d',
      padding: 15,
      borderRadius: 10,
      marginBottom: 15,
    },
    weatherRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    weatherTemp: {
      fontSize: 24,
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
      fontSize: 18,
      color: '#fff',
      textAlign: 'center',
    },
    weatherError: {
      textAlign: 'center',
      color: '#ff0000',
      marginBottom: 15,
    },
    calendarContainer: {
      marginBottom: 15,
    },
    weekContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    dayContainer: {
      flex: 1,
      alignItems: 'center',
      padding: 8,
      borderRadius: 8,
      marginHorizontal: 2,
      backgroundColor: 'transparent',
    },
    selectedDay: {
      backgroundColor: '#f0f0f0',
    },
    currentDay: {
      backgroundColor: '#E8F5E9',
    },
    dayText: {
      fontSize: 14,
      color: '#2d2d2d',
      marginBottom: 4,
    },
    dateText: {
      fontSize: 18,
      color: '#2d2d2d',
      fontWeight: 'bold',
    },
    selectedDayText: {
      color: '#2d2d2d',
    },
    currentDayText: {
      color: '#4caf50',
    },
    habitsContainer: {
      marginTop: 15,
    },
    habitRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    habitButton: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      paddingVertical: 24,
      paddingHorizontal: 8,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      minHeight: 200,
    },
    habitIcon: {
      width: '100%',
      height: 120,
      resizeMode: 'contain',
      marginBottom: 8,
    },
    habitName: {
      fontSize: 18,
      color: '#000',
      textAlign: 'center',
      fontWeight: 'bold',
    },
    habitDescription: {
      fontSize: 14,
      color: '#666',
      textAlign: 'center',
    },
  });

  export default MainScreen;