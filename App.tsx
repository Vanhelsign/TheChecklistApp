import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import PendingTasksScreen from './src/screens/PendingTasksScreen';
import CompletedTasksScreen from './src/screens/CompletedTasksScreen';
import TasksScreen from './src/screens/TasksScreen';
import TeamsScreen from './src/screens/TeamsScreen';

import { RootStackParamList, UserParams } from './src/types/navigation';
import { StatusBar } from 'expo-status-bar';

import { initDatabase, initializeSampleData } from './src/database/database';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {

  const [dbReady, setDbReady] = React.useState(false);

  React.useEffect(() => {
    const initializeDB = async () => {
      try {
        await initDatabase();
        await initializeSampleData();
        setDbReady(true);
        console.log('✅ Base de datos lista');
      } catch (error) {
        console.error('❌ Error inicializando DB:', error);
        setDbReady(true); // Igual dejamos que continúe la app
      }
    };

    initializeDB();
  }, []);

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
