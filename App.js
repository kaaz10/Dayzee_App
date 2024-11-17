  import React from 'react';
  import { NavigationContainer } from '@react-navigation/native';
  import { createStackNavigator } from '@react-navigation/stack';

  import HomeScreen from './src/screens/HomeScreen';
  import LoginScreen from './src/screens/LoginScreen';
  import RegisterScreen from './src/screens/RegisterScreen';
  import MainScreen from './src/screens/MainScreen';
  import StudyGoalScreen from './src/screens/StudyGoalScreen';
  import ExerciseScreen from './src/screens/ExerciseScreen';


  const Stack = createStackNavigator();

  export default function App() {
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Main" component={MainScreen} />
          <Stack.Screen name="StudyGoal" component={StudyGoalScreen} />
          <Stack.Screen name="Exercise" component={ExerciseScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }