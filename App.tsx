import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import PendingTasksScreen from './src/screens/PendingTasksScreen';
import CompletedTasksScreen from './src/screens/CompletedTasksScreen';
import TasksScreen from './src/screens/TasksScreen';
import TeamsScreen from './src/screens/TeamsScreen';
import SignupScreen from './src/screens/SignupScreen';

import { RootStackParamList } from './src/types/navigation';
import { StatusBar } from 'expo-status-bar';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (

    <>

    <StatusBar 
    translucent
    backgroundColor="transparent" 
    />
    
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
            headerShown: false,
            statusBarTranslucent: true,
            contentStyle: { backgroundColor: 'transparent' },
          }}
        >

        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Signup"
          component={SignupScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ headerShown: false }} 
          />

        <Stack.Screen
          name="Tasks"
          component={TasksScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="PendingTasks"
          component={PendingTasksScreen}
          options={{ title: 'Tareas Pendientes' }}
        />

        <Stack.Screen
          name="CompletedTasks"
          component={CompletedTasksScreen}
          options={{ title: 'Tareas Completadas' }}
        />

        <Stack.Screen
          name="Teams"
          component={TeamsScreen}
          options={{ title: 'Equipos' }}
        />


      </Stack.Navigator>
    </NavigationContainer>

    </>

    
  );
}
