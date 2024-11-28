import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Audio } from 'expo-av';
import { Pause, Play } from 'lucide-react-native';
import DropDownPicker from 'react-native-dropdown-picker';

const MUSIC_TRACKS = {
  'no-music': null,
  'study': require('../../assets/music/study.mp3'),
  'exercise': require('../../assets/music/exercise.mp3'),
  'diet': require('../../assets/music/diet.mp3'),
};

const TIMER_OPTIONS = [5, 15, 30, 60];

export default function FocusScreen() {
  const [selectedMinutes, setSelectedMinutes] = useState(30);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // in seconds
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const timerRef = useRef(null);
  const musicRef = useRef(null);

  const musicOptions = [
    { label: 'No Music', value: 'no-music' },
    { label: 'Study', value: 'study' },
    { label: 'Exercise', value: 'exercise' },
    { label: 'Diet', value: 'diet' },
  ];

  useEffect(() => {
    const setupAudio = async () => {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
      });
    };
    setupAudio();

    return () => {
      if (musicRef.current) {
        musicRef.current.unloadAsync();
      }
    };
  }, []);

  const playMusic = async () => {
    if (selectedMusic === 'no-music') return;

    try {
      if (!musicRef.current) {
        const { sound } = await Audio.Sound.createAsync(
          MUSIC_TRACKS[selectedMusic],
          {
            shouldPlay: true,
            isLooping: true,
            volume: 0.5,
          }
        );
        musicRef.current = sound;
        setIsMusicPlaying(true);
      } else {
        await musicRef.current.playAsync();
        setIsMusicPlaying(true);
      }
    } catch (error) {
      console.error('Error playing music', error);
    }
  };

  const pauseMusic = async () => {
    if (musicRef.current) {
      await musicRef.current.pauseAsync();
      setIsMusicPlaying(false);
    }
  };

  const stopMusic = async () => {
    if (musicRef.current) {
      await musicRef.current.stopAsync();
      await musicRef.current.unloadAsync();
      musicRef.current = null;
      setIsMusicPlaying(false);
    }
  };

  const startTimer = () => {
    if (isTimerRunning) return;

    setTimeRemaining(selectedMinutes * 60);
    setIsTimerRunning(true);

    if (selectedMusic && selectedMusic !== 'no-music') {
      playMusic();
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsTimerRunning(false);
          stopMusic();
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
    stopMusic();
    setSelectedMusic(null); 
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

  const handleMusicSelection = () => {
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>focus.</Text>

      <View style={styles.mainContent}>
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
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

      {isTimerRunning && selectedMusic && selectedMusic !== 'no-music' && (
        <View style={styles.musicDisplayContainer}>
          <Text style={styles.musicDisplayText}>
            {musicOptions.find((option) => option.value === selectedMusic)?.label || 'Music'}
          </Text>
          <TouchableOpacity
            onPress={isMusicPlaying ? pauseMusic : playMusic}
            style={styles.musicControlButton}
          >
            {isMusicPlaying ? (
              <Pause color="#ffffff" size={20} />
            ) : (
              <Play color="#ffffff" size={20} />
            )}
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={styles.startButton}
        onPress={() => {
          if (isTimerRunning) {
            resetTimer();
          } else {
            if (!selectedMusic) {
              setModalVisible(true);
            } else {
              startTimer();
            }
          }
        }}
      >
        <Text style={styles.startButtonText}>
          {isTimerRunning ? 'Reset' : 'Start Focus'}
        </Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <DropDownPicker
              open={openDropdown}
              value={selectedMusic}
              items={musicOptions}
              setOpen={setOpenDropdown}
              setValue={setSelectedMusic}
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              placeholder="Select Music"
            />
            <TouchableOpacity
              style={styles.modalAddButton}
              onPress={() => {
                handleMusicSelection();
                startTimer();
              }}
            >
              <Text style={styles.modalAddButtonText}>Start</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCloseButton}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  musicDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 80,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  musicDisplayText: {
    fontSize: 22,
    marginRight: 10,
    color: '#2d2d2d',
  },
  musicControlButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    backgroundColor: '#2d2d2d',
  },
    startButton: {
    marginBottom: 60,
    backgroundColor: '#2d2d2d',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: 300,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  dropdown: {
    borderRadius: 20,
    borderColor: '#ccc',
  },
  dropdownContainer: {
    borderColor: '#ccc',
  },
  modalAddButton: {
    backgroundColor: '#2d2d2d',
    paddingHorizontal: 110,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20,
  },
  modalAddButtonText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  modalCloseButton: {
    marginTop: 10,
    color: '#2d2d2d',
    textAlign: 'center',
  },
});

