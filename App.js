  import React from 'react';
  import { NavigationContainer } from '@react-navigation/native';
  import { createStackNavigator } from '@react-navigation/stack';
  import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
  import { Ionicons } from '@expo/vector-icons';

  // Import Screens
  import MainScreen from './src/screens/MainScreen';
  import LoginScreen from './src/screens/LoginScreen';
  import RegisterScreen from './src/screens/RegisterScreen';
  import HomeScreen from './src/screens/HomeScreen';
  import FocusScreen from './src/screens/FocusScreen';
  import JournalScreen from './src/screens/JournalScreen';
  import ProfileScreen from './src/screens/ProfileScreen';
  import StudyGoalScreen from './src/screens/StudyGoalScreen';
  import ExerciseScreen from './src/screens/ExerciseScreen';
  import DietGoalScreen from './src/screens/DietGoalScreen';

  const Stack = createStackNavigator();
  const Tab = createBottomTabNavigator();

  function BottomTabs() {
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = 'home-outline';
            } else if (route.name === 'Focus') {
              iconName = 'timer-outline';
            } else if (route.name === 'Journal') {
              iconName = 'book-outline';
            } else if (route.name === 'Profile') {
              iconName = 'person-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#4caf50',
          tabBarInactiveTintColor: '#a4a4a4',
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 0,
            height: 80,
            paddingTop: 5,
            elevation: 0,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: 'bold',
          },
          tabBarIconStyle: {
            paddingBottom: 3,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={MainScreen} />
        <Tab.Screen name="Focus" component={FocusScreen} />
        <Tab.Screen name="Journal" component={JournalScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    );
  }

  // Main App Component
  export default function App() {
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Main" component={BottomTabs} />
          <Stack.Screen name="StudyGoal" component={StudyGoalScreen} />
          <Stack.Screen name="Exercise" component={ExerciseScreen} />
          <Stack.Screen name="Diet" component={DietGoalScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }