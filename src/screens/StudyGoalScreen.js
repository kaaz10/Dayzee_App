import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// daysOfWeek array to represent the days of the week
const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const StudyGoalScreen = () => {
  const [completedToday, setCompletedToday] = useState(false);
  const [completedDays, setCompletedDays] = useState([false, false, false, false, false, false, false]);

  // Calculate the number of selected days
  const selectedDaysCount = completedDays.filter(day => day).length;

  const toggleDayCompletion = (index) => {
    const newCompletedDays = [...completedDays];
    newCompletedDays[index] = !newCompletedDays[index];
    setCompletedDays(newCompletedDays);
  };

  const toggleCompletionStatus = () => {
    setCompletedToday(prevState => !prevState); // Toggle completion status
  };

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
        <Text style={styles.goalText}>Goal: Study {selectedDaysCount} days this week</Text>

        {/* Bubble Row for Days of the Week */}
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

      {/* Progress Section */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>Track your progress:</Text>
        {/* Add any progress indicators or bars here if needed */}
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
  progressContainer: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 15,
    marginVertical: 10,
    alignItems: 'center',
  },
  progressText: {
    color: '#333',
    fontSize: 18,
    fontWeight: '500',
  },
});

export default StudyGoalScreen;
