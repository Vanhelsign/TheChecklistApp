import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, UserType } from '../types/navigation';

type SideNavbarProps = {
  isOpen: boolean;
  onClose: () => void;
  activeScreen: string;
  onNavigate: (screenName: keyof RootStackParamList) => void;
  onLogout: () => void;
  userType: UserType;
  userName: string;
  slideAnim: Animated.Value;
};

const SideNavbar: React.FC<SideNavbarProps> = ({
  isOpen,
  onClose,
  activeScreen,
  onNavigate,
  onLogout,
  userType,
  userName,
  slideAnim
}) => {
  

  return (
    <Animated.View 
      style={[
        styles.sideNav,
        {
          transform: [{ translateX: slideAnim }]
        }
      ]}
    >
      <LinearGradient
        colors={['#e6f7ff', '#d6f0ff', '#c6e9ff']}
        style={styles.navGradient}
      >
        {/* Header de la navegación */}
        <View style={styles.navHeader}>
          <View>
            <Text style={styles.navTitle}>Menú</Text>
            <Text style={styles.userInfo}>
              {userName} ({userType === 'manager' ? 'Gerente' : 'Trabajador'})
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#4A6572" />
          </TouchableOpacity>
        </View>

        {/* Items de Navegación */}
        <View style={styles.navItems}>
          <TouchableOpacity 
            style={[
              styles.navItem,
              activeScreen === 'Home' && styles.navItemActive
            ]}
            onPress={() => onNavigate('Home')}
          >
            <Ionicons 
              name="home" 
              size={20} 
              color={activeScreen === 'Home' ? '#4A6572' : '#5D8AA8'} 
              style={styles.navIcon}
            />
            <Text style={[
              styles.navText,
              activeScreen === 'Home' && styles.navTextActive
            ]}>
              Inicio
            </Text>
          </TouchableOpacity>

          {userType === 'manager' && (<TouchableOpacity
            style={[
              styles.navItem,
              activeScreen === 'Tasks' && styles.navItemActive
            ]}
            onPress={() => onNavigate('Tasks')}
          >
            <Ionicons 
              name="list" 
              size={20} 
              color={activeScreen === 'Tasks' ? '#4A6572' : '#5D8AA8'} 
              style={styles.navIcon}
            />
            <Text style={[
              styles.navText,
              activeScreen === 'Tasks' && styles.navTextActive
            ]}>
              Tareas
            </Text>
          </TouchableOpacity>)}

          <TouchableOpacity 
            style={[
              styles.navItem,
              activeScreen === 'PendingTasks' && styles.navItemActive
            ]}
            onPress={() => onNavigate('PendingTasks')}
          >
            <Ionicons 
              name="time" 
              size={20} 
              color={activeScreen === 'PendingTasks' ? '#4A6572' : '#5D8AA8'} 
              style={styles.navIcon}
            />
            <Text style={[
              styles.navText,
              activeScreen === 'PendingTasks' && styles.navTextActive
            ]}>
              Pendientes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.navItem,
              activeScreen === 'CompletedTasks' && styles.navItemActive
            ]}
            onPress={() => onNavigate('CompletedTasks')}
          >
            <Ionicons 
              name="checkmark-done" 
              size={20} 
              color={activeScreen === 'CompletedTasks' ? '#4A6572' : '#5D8AA8'} 
              style={styles.navIcon}
            />
            <Text style={[
              styles.navText,
              activeScreen === 'CompletedTasks' && styles.navTextActive
            ]}>
              Completadas
            </Text>
          </TouchableOpacity>

          {/* Futura pantalla de Equipos - solo para managers */}
          {userType === 'manager' && (
            <TouchableOpacity 
              style={[
                styles.navItem,
                activeScreen === 'Teams' && styles.navItemActive
              ]}
              onPress={() => onNavigate('Teams')}
            >
              <Ionicons 
                name="people" 
                size={20} 
                color={activeScreen === 'Teams' ? '#4A6572' : '#5D8AA8'} 
                style={styles.navIcon}
              />
              <Text style={[
                styles.navText,
                activeScreen === 'Teams' && styles.navTextActive
              ]}>
                Equipos
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Botón de Cerrar Sesión */}
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Ionicons name="log-out" size={20} color="#4A6572" style={styles.navIcon} />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Separador entre barra nav y contenido */}
      <View style={styles.navSeparator} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  sideNav: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 280,
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
    alignItems: 'flex-start',
    marginBottom: 30,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(74, 101, 114, 0.2)',
  },
  navTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4A6572',
    marginBottom: 4,
  },
  userInfo: {
    fontSize: 12,
    color: '#5D8AA8',
    fontStyle: 'italic',
  },
  closeButton: {
    padding: 5,
  },
  navItems: {
    flex: 1,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
  navIcon: {
    marginRight: 12,
    width: 24,
  },
  navText: {
    fontSize: 16,
    color: '#5D8AA8',
    fontWeight: '500',
    flex: 1,
  },
  navTextActive: {
    color: '#4A6572',
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(74, 101, 114, 0.2)',
  },
  logoutText: {
    color: '#4A6572',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SideNavbar;
