import React, {useEffect, useState} from 'react';
import { 
  View, 
  FlatList, 
  Text, 
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated
} from 'react-native';
import TaskItem from '../components/TaskItem';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Task } from '../types/navigation';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import SideNavbar from '../components/SideNavbar';
import MenuButton from '../components/MenuButton';
import taskService from '../services/task.service';
import authService from '../services/auth.service';

type Props = NativeStackScreenProps<RootStackParamList, 'CompletedTasks'>;

export default function CompletedTasksScreen({ route, navigation }: Props) {

  const { userType, userUID, userName, userTeamUIDs } = route.params;

  const userParams = {
    userType: userType,
    userUID: userUID,
    userName: userName,
    userTeamUIDs: userTeamUIDs
  };

  // Estados para la navbar
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [activeScreen, setActiveScreen] = useState('CompletedTasks');
  const [tasks, setTasks] = useState<Task[]>([]);
  const slideAnim = useState(new Animated.Value(-280))[0];

  useEffect(() => {
    const fetchTasks = async () => {
      const allTasks = await taskService.getAllTasks();
      const filteredTasks = allTasks.filter(task => !task.completed);
      setTasks(filteredTasks);
    };
    
    fetchTasks();
  }, []);
  
  // Filtrar tareas completadas
  const completedTasks = tasks.filter(task => task.completed);

  // Funciones de navegación (igual que en las otras pantallas)
  const toggleNav = () => {
    if (isNavOpen) {
      Animated.timing(slideAnim, {
        toValue: -280,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
    setIsNavOpen(!isNavOpen);
  };

  const navigateTo = (screenName: keyof RootStackParamList) => {
    setActiveScreen(screenName);
    
    if (screenName === 'CompletedTasks') {
      toggleNav();
      return;
    }

    switch (screenName) {
      case 'Home':
        navigation.navigate('Home', userParams);
        break;
      case 'Login':
        navigation.navigate('Login');
        break;
      case 'PendingTasks':
        navigation.navigate('PendingTasks', userParams);
        break;
      case 'Tasks':
        navigation.navigate('Tasks', userParams);
        break;
      default:
        navigation.navigate(screenName as any);
        break;
    }
    
    toggleNav();
  };

  const handleLogout = () => {
    authService.handleLogout(navigation);
  };

  const getRoleColor = () => {
    return userType === 'manager' ? '#4A6572' : '#344955';
  };

  return (
    <SafeAreaView style={styles.fullScreen}>
      <LinearGradient 
        colors={['#ffffff', '#e6f7ff', '#d6f0ff']} 
        style={styles.fullScreen}
      >
        <StatusBar style="auto" />
        
        {/* ---------- Seccion para la navbar vertical -------------- */}

        <MenuButton onPress={toggleNav} color={getRoleColor()} />

        <SideNavbar
          isOpen={isNavOpen}
          onClose={toggleNav}
          activeScreen={activeScreen}
          onNavigate={navigateTo}
          onLogout={handleLogout}
          userType={userType}
          userName={userName}
          slideAnim={slideAnim}
        />

        <Animated.View 
          style={[
            styles.overlay,
            {
              opacity: slideAnim.interpolate({
                inputRange: [-280, 0],
                outputRange: [0, 0.4],
              }),
              display: isNavOpen ? 'flex' : 'none',
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.overlayTouchable}
            onPress={toggleNav}
            activeOpacity={1}
          />
        </Animated.View>

        {/* ---------------------Separador--------------------- */}

        {/* Contenido Principal */}
        <View style={styles.mainContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: getRoleColor() }]}>
              Tareas Completadas
            </Text>
            <Text style={styles.subtitle}>
              {completedTasks.length === 0 
                ? 'No hay tareas completadas' 
                : `Has completado ${completedTasks.length} tarea${completedTasks.length !== 1 ? 's' : ''}`
              }
            </Text>
          </View>

          {/* Lista de Tareas Completadas */}
          <View style={styles.container}>
            {completedTasks.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="checkmark-done-circle" size={64} color="#5D8AA8" />
                <Text style={styles.emptyStateText}>No hay tareas completadas</Text>
                <Text style={styles.emptyStateSubtext}>
                  Las tareas que completes aparecerán aquí
                </Text>
              </View>
            ) : (
              <FlatList
                data={completedTasks}
                keyExtractor={(item) => item.uid}
                renderItem={({ item }) => <TaskItem task={item} />}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
              />
            )}
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
  menuButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#5D8AA8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sideNav: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 250,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
  },
  navGradient: {
    flex: 1,
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  navSeparator: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(74, 101, 114, 0.3)',
  },
  navHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(74, 101, 114, 0.2)',
  },
  navTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4A6572',
  },
  closeButton: {
    padding: 5,
  },
  navItems: {
    flex: 1,
  },
  navItem: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 8,
  },
  navItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderLeftWidth: 4,
    borderLeftColor: '#4A6572',
  },
  navText: {
    fontSize: 16,
    color: '#5D8AA8',
    fontWeight: '500',
  },
  navTextActive: {
    color: '#4A6572',
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(74, 101, 114, 0.2)',
  },
  logoutText: {
    color: '#4A6572',
    fontWeight: 'bold',
    fontSize: 16,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 18,
  },
  mainContent: {
    flex: 1,
    width: '100%',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 100,
    paddingBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#5D8AA8',
    fontWeight: '500',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A6572',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
  overlayTouchable: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

});