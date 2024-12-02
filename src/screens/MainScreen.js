  // Importing necessary libraries and modules
  import React, { useState, useEffect } from 'react';
  import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Image, } from 'react-native';
  import * as Location from 'expo-location';
  import { useNavigation } from '@react-navigation/native';
  import moment from 'moment';
  import AsyncStorage from '@react-native-async-storage/async-storage';
  import { useFocusEffect } from '@react-navigation/native';


  function MainScreen() {
    const [weather, setWeather] = useState(null); // stores fetched weather data
    const [loading, setLoading] = useState(true); // tracks if the app is gathering weather data
    const navigation = useNavigation(); // navigation object to go between screens
    const [completedStudyDays, setCompletedStudyDays] = useState(0); // tracks completed days for study
    const [completedExerciseDays, setCompletedExerciseDays] = useState(0); // tracks completed days for exercise
    const [completedDietDays, setCompletedDietDays] = useState(0); // tracks completed days for diet

    // defining habits array
    const defaultHabits = [
      { id: 1, name: 'Study', icon: require('../../assets/images/Study.png'), screen: 'StudyGoal' },
      { id: 2, name: 'Exercise', icon: require('../../assets/images/Exercise.png'), screen: 'Exercise' },
      { id: 3, name: 'Diet', icon: require('../../assets/images/Food.png'), screen: 'Diet' },
    ];

    // calls fetchWeather on initial render
    useEffect(() => {
      fetchWeather();
    }, []);

    // reloads study, exercise, and diet data from AsyncStorage
    useFocusEffect(
    React.useCallback(() => {
      const loadStudyData = async () => {
        try {
          const savedData = await AsyncStorage.getItem('studyData');
          if (savedData) {
            const { completedDays } = JSON.parse(savedData);
            const completedCount = completedDays.filter((day) => day).length; 
            setCompletedStudyDays(completedCount);
          }
        } catch (error) {
          console.error('Error loading study data:', error);
        }
      };

      const loadExerciseData = async () => {
        try {
          const savedData = await AsyncStorage.getItem('exerciseData');
          if (savedData) {
            const { completedDays } = JSON.parse(savedData);
            const completedCount = completedDays.filter((day) => day).length; 
            setCompletedExerciseDays(completedCount);
          }
        } catch (error) {
          console.error('Error loading study data:', error);
        }
      };

      const loadDietData = async () => {
        try {
          const savedData = await AsyncStorage.getItem('dietData');
          if (savedData) {
            const { completedDays } = JSON.parse(savedData);
            const completedCount = completedDays.filter((day) => day).length; 
            setCompletedDietDays(completedCount);
          }
        } catch (error) {
          console.error('Error loading study data:', error);
        }
      };


      loadStudyData();
      loadExerciseData();
      loadDietData();
    }, [])
  );

    // fetches current weather data from an API using the device’s location
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

    // shows loading indicator and renders weather if avaliable
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

    // renders current day and date using moment
    const renderWeeklyCalendar = () => {
      const today = moment();
      return (
        <View style={styles.calendarContainer}>
          <View style={styles.dayContainer}>
            <Text style={[styles.dayText, styles.currentDayText]}>
              {today.format('dddd')} 
            </Text>
            <Text style={[styles.dateText, styles.currentDayText]}>
              {today.format('MMMM D, YYYY')}
            </Text>
          </View>
        </View>
      );
    };

    // creates habit buttons, displays the habit details like completion days and icon,
    // and navigates when pressed
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
              {habit.name === 'Study' && (
                <Text style={styles.habitDescription}>
                  Completed {completedStudyDays}/5 days this week
                </Text>
              )}
              {habit.name === 'Exercise' && (
                <Text style={styles.habitDescription}>
                  Completed {completedExerciseDays}/5 days this week
                </Text>
              )}
              {habit.name === 'Diet' && (
                <Text style={styles.habitDescription}>
                  Completed {completedDietDays}/5 days this week
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );

    // displays a scrollable screen for the main screen
    return (
      <ScrollView style={styles.container}>
      <Text style={styles.greeting}>make dayze count.</Text>
      {renderWeather()}
      {renderWeeklyCalendar()}
      <Text style={styles.progressMessage}>let's start.</Text>
      {renderHabitButtons()}
    </ScrollView>
    );
  }

  // defines styles for components like containers and text
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
    habitsContainer: {
      marginTop: 15,
    },
    habitRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 8,
    },
    habitButton: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      borderRadius: 15,
      paddingVertical: 24,
      paddingHorizontal: 8,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 2,
      minHeight: 200,
    },
    habitIcon: {
      width: '100%',
      height: 150,
      resizeMode: 'cover',
      marginBottom: 8,
    },
    habitName: {
      fontSize: 18,
      color: '#2d2d2d',
      textAlign: 'center',
      fontWeight: 'bold',
    },
    habitDescription: {
      fontSize: 14,
      color: '#2d2d2d',
      textAlign: 'center',
      marginTop: 5,
    },
    progressMessage: {
      fontSize: 22,
      fontWeight: 'bold',
      alignSelf: 'center',
      color: '#2d2d2d',
      marginVertical: 10,
    },
    calendarContainer: {
      alignItems: 'center',
      marginVertical: 15,
    },
    dayContainer: {
      padding: 10,
      borderRadius: 10,
      backgroundColor: '#E8F5E9',
      alignItems: 'center',
    },
    dayText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#4caf50',
    },
    dateText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#2d2d2d',
    },
    
  });

  export default MainScreen;
