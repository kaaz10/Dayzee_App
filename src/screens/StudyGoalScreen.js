  import React, { useState } from 'react';
  import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
  import { useNavigation } from '@react-navigation/native';

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const StudyGoalScreen = () => {
    const [completedToday, setCompletedToday] = useState(false);
    const [completedDays, setCompletedDays] = useState([false, false, false, false, false, false, false]);
    const navigation = useNavigation();

    const selectedDaysCount = completedDays.filter(day => day).length;

    const toggleDayCompletion = (index) => {
      const newCompletedDays = [...completedDays];
      newCompletedDays[index] = !newCompletedDays[index];
      setCompletedDays(newCompletedDays);
    };

    const toggleCompletionStatus = () => {
      setCompletedToday(prevState => !prevState);
    };

    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>◀ Back</Text>
        </TouchableOpacity>

        <Text style={styles.headerText}>Set Your Study Goals</Text>

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

        <View style={styles.goalContainer}>
          <Text style={styles.goalText}>Goal: Study {selectedDaysCount} days this week</Text>
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
          <Text style={styles.progressText}>Track your progress:</Text>
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
      alignSelf:'center',
    },
    bubbleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignSelf:'center',
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
    },
    progressText: {
      fontSize: 16,
      color: '#2d2d2d',
    },
  });

  export default StudyGoalScreen;
