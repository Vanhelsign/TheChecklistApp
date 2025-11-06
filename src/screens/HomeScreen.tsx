import React, {useState} from 'react';
import { View, Text, Button, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import ManagerDashboard from '../components/ManagerDashboard';
import WorkerDashboard from '../components/WorkerDashboard';
import SideNavbar from '../components/SideNavbar';
import MenuButton from '../components/MenuButton';
import authService from '../services/auth.service';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ route, navigation }: Props) {
  const { userType, userUID, userName, userTeamUIDs } = route.params;

  const userParams = {
    userType: userType,
    userUID: userUID,
    userName: userName,        
    userTeamUIDs: userTeamUIDs  
  };

  {/* Seccion para la navbar */}

  const [isNavOpen, setIsNavOpen] = useState(false);
  const [activeScreen, setActiveScreen] = useState('Home');
  const slideAnim = useState(new Animated.Value(-280))[0];

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
    if (screenName === 'Home') {
      toggleNav();
    } else {
      
      // Pasar userType a todas las pantallas que lo necesiten
      if (screenName === 'Tasks' || screenName === 'PendingTasks' || screenName === 'CompletedTasks' || screenName === 'Teams') {
        navigation.navigate(screenName, userParams);
      } else {
        navigation.navigate(screenName);
      }
      
      toggleNav();
    }
  };

  const handleLogout = () => {
    authService.handleLogout(navigation);
  };

  {/* Fin seccion para la navbar */}

  const getWelcomeMessage = () => {
    const role = userType === 'manager' ? 'Gerente' : 'Trabajador';
    return `Bienvenido, ${userName}`;
  };

  const getRoleColor = () => {
    return userType === 'manager' ? '#4A6572' : '#344955';
  };

  return (
    <SafeAreaView style={styles.fullScreen}>
      <LinearGradient 
        colors={['#ffffff', '#edf9feff', '#d6f0ff']} 
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
        <View style={
          styles.mainContent
        }>
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.welcomeTitle, { color: getRoleColor() }]}>
              {getWelcomeMessage()}
            </Text>
            <Text style={styles.subtitle}>
              {userType === 'manager' 
                ? 'Panel de control y gestión del equipo' 
                : 'Tu espacio de trabajo personal'
              }
            </Text>
          </View>

          {/* Secciones */}
          <ScrollView 
            style={styles.container}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {userType === 'manager' ? (
              <ManagerDashboard />
            ) : (
              <WorkerDashboard />
            )}
          </ScrollView>
          
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
    top: 40,
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
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
  mainContent: {
    flex: 1,
    paddingTop: 40,
  },
  mainContentWithNavOpen: {
    marginLeft: 250, // Empuja el contenido cuando la nav está abierta
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60, // Espacio para el botón de menú
    paddingBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#5D8AA8',
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginVertical: 10,
    shadowColor: '#5D8AA8',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#f0f8ff',
    minHeight: 150,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f8ff',
    backgroundColor: '#e9f6fbff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  sectionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A6572',
  },
  sectionContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '500',
  },
  comingSoonText: {
    fontSize: 12,
    color: '#B2BEC3',
    fontStyle: 'italic',
    textAlign: 'center',
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
  overlayTouchable: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

});
