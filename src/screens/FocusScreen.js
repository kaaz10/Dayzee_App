  import React, { useState, useRef } from 'react';
  import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

  const TIMER_OPTIONS = [5, 15, 30, 60];

  export default function FocusScreen() {
    const [selectedMinutes, setSelectedMinutes] = useState(30);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(30 * 60); // in seconds
    const timerRef = useRef(null);

    const startTimer = () => {
      if (isTimerRunning) return;
      
      setTimeRemaining(selectedMinutes * 60);
      setIsTimerRunning(true);
      
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    const resetTimer = () => {
      clearInterval(timerRef.current);
      setIsTimerRunning(false);
      setTimeRemaining(selectedMinutes * 60);
    };

    const formatTime = (timeInSeconds) => {
      const minutes = Math.floor(timeInSeconds / 60);
      const seconds = timeInSeconds % 60;
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const selectTime = (minutes) => {
      if (!isTimerRunning) {
        setSelectedMinutes(minutes);
        setTimeRemaining(minutes * 60);
      }
    };

    return (
      <View style={styles.container}>
        <Text style={styles.header}>focus.</Text>

        <View style={styles.mainContent}>
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>
              {formatTime(timeRemaining)}
            </Text>
          </View>

          <View style={styles.optionsContainer}>
            {TIMER_OPTIONS.map((minutes) => (
              <TouchableOpacity
                key={minutes}
                style={[
                  styles.option,
                  selectedMinutes === minutes && styles.selectedOption,
                ]}
                onPress={() => selectTime(minutes)}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedMinutes === minutes && styles.selectedOptionText,
                  ]}
                >
                  {minutes}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.startButton}
          onPress={isTimerRunning ? resetTimer : startTimer}
        >
          <Text style={styles.startButtonText}>
            {isTimerRunning ? 'Reset' : 'Start Focus'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#E1EFEF',
      alignItems: 'center',
    },
    header: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#2d2d2d',
      marginTop: 70,
      marginBottom: 40,
    },
    mainContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 100, 
    },
    timerContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 50, 
    },
    timerText: {
      fontSize: 80,
      fontWeight: 'bold',
      color: '#2d2d2d',
    },
    optionsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 15,
    },
    option: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: 'transparent',
      justifyContent: 'center',
      alignItems: 'center',
    },
    selectedOption: {
      backgroundColor: '#2d2d2d',
    },
    optionText: {
      fontSize: 18,
      color: '#2d2d2d',
      fontWeight: '500',
    },
    selectedOptionText: {
      color: '#fff',
    },
    startButton: {
      backgroundColor: '#2d2d2d',
      paddingHorizontal: 40,
      paddingVertical: 15,
      borderRadius: 25,
      position: 'absolute',
      bottom: 50,
    },
    startButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '500',
    },
  });