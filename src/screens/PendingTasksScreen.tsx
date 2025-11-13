import React, {use, useEffect, useState} from 'react';
import { 
  View, 
  FlatList, 
  Text, 
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  TextInput
} from 'react-native';
import TaskCard from '../components/TaskCard';
import TaskFormModal from '../components/TasksComponents/TaskFormModal';
import UserTeamFilterModal from '../components/UserTeamFilterModal';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, UserType, Task, User, Team } from '../types/navigation';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import SideNavbar from '../components/SideNavbar';
import MenuButton from '../components/MenuButton';
import taskService from '../services/task.service';
import authService from '../services/auth.service';
import userService from '../services/user.service';
import teamService from '../services/team.service';

type Props = NativeStackScreenProps<RootStackParamList, 'PendingTasks'>;

export default function PendingTasksScreen({ route, navigation }: Props) {

  const { userType, userUID, userName, userTeamUIDs } = route.params;

  const userParams = {
    userType: userType,
    userUID: userUID,
    userName: userName,
    userTeamUIDs: userTeamUIDs
  };

  // Estados para la navbar
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [activeScreen, setActiveScreen] = useState('PendingTasks');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]); // Todas las tareas sin filtrar
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('view');
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const slideAnim = useState(new Animated.Value(-280))[0];
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterType, setFilterType] = useState<'user' | 'team' | null>(null);
  const [filterId, setFilterId] = useState<string | null>(null);
  // Filtro para workers: 'all' | 'personal' | 'team'
  const [workerFilter, setWorkerFilter] = useState<'all' | 'personal' | 'team'>('all');

  // Cargar usuarios, equipos y tareas
  useEffect(() => {
    const unsubscribeUsers = userService.subscribeToUsers(
      (fetchedUsers) => setUsers(fetchedUsers),
      (error) => console.error("Error en suscripción de usuarios:", error)
    );

    const unsubscribeTeams = teamService.subscribeToTeams(
      (fetchedTeams) => setTeams(fetchedTeams),
      (error) => console.error("Error en suscripción de equipos:", error)
    );

    const unsubscribeTasks = taskService.subscribeToTasks(
      (fetchedTasks) => setAllTasks(fetchedTasks),
      (error) => console.error("Error en suscripción de tareas:", error)
    );

    return () => {
      unsubscribeUsers();
      unsubscribeTeams();
      unsubscribeTasks();
    };
  }, []);

  // Filtrar tareas cuando cambien allTasks o teams
  useEffect(() => {
    // Si es trabajador y aún no se han cargado los equipos, esperar
    if (userType === 'worker' && teams.length === 0) {
      return;
    }

    let filteredTasks = allTasks.filter(task => !task.completed);
    
    // Si el usuario es trabajador, filtrar solo sus tareas asignadas
    if (userType === 'worker') {
      filteredTasks = filteredTasks.filter((task) => {
        if (task.assignedTo === 'user') {
          return task.assignedUserUID === userUID;
        } else if (task.assignedTo === 'team') {
          if (!task.assignedTeamUID) return false;
          
          const team = teams.find(t => t.uid === task.assignedTeamUID);
          if (!team) return false;
          
          return team.memberUIDs.includes(userUID);
        }
        
        return false;
      });
    }
    
    setTasks(filteredTasks);
  }, [allTasks, teams, userType, userUID]);

  // Aplicar filtro de usuario/equipo (solo para managers)
  const applyUserTeamFilter = (type: 'user' | 'team' | null, id: string | null) => {
    setFilterType(type);
    setFilterId(id);
  };

  // Filtrar tareas según el filtro seleccionado (managers)
  const getManagerFilteredTasks = () => {
    if (userType !== 'manager' || !filterType || !filterId) {
      return tasks;
    }

    if (filterType === 'user') {
      // Filtrar por usuario: tareas asignadas al usuario o creadas por él
      return tasks.filter(task => 
        task.assignedUserUID === filterId || task.createdBy === filterId
      );
    } else if (filterType === 'team') {
      // Filtrar por equipo: tareas asignadas al equipo
      return tasks.filter(task => task.assignedTeamUID === filterId);
    }

    return tasks;
  };

  // Filtrar tareas según el filtro de worker
  const getWorkerFilteredTasks = () => {
    if (userType !== 'worker') {
      return tasks;
    }

    if (workerFilter === 'all') {
      return tasks;
    } else if (workerFilter === 'personal') {
      // Solo tareas asignadas directamente al usuario
      return tasks.filter(task => task.assignedTo === 'user' && task.assignedUserUID === userUID);
    } else if (workerFilter === 'team') {
      // Solo tareas asignadas a equipos
      return tasks.filter(task => task.assignedTo === 'team');
    }

    return tasks;
  };

  // Aplicar filtros según el tipo de usuario
  const filteredTasks = userType === 'manager' ? getManagerFilteredTasks() : getWorkerFilteredTasks();

  // Filtrar tareas por búsqueda
  const searchedTasks = filteredTasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Obtener nombre del filtro activo
  const getFilterLabel = () => {
    if (!filterType || !filterId) return null;
    
    if (filterType === 'user') {
      const user = users.find(u => u.uid === filterId);
      return user ? `Usuario: ${user.name}` : null;
    } else if (filterType === 'team') {
      const team = teams.find(t => t.uid === filterId);
      return team ? `Equipo: ${team.name}` : null;
    }
    
    return null;
  };

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
    
    if (screenName === 'PendingTasks') {
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
      case 'CompletedTasks':
        navigation.navigate('CompletedTasks', userParams);
        break;
      case 'Tasks':
        navigation.navigate('Tasks', userParams);
        break;
      case 'Teams':
        navigation.navigate('Teams', userParams);
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
              Tareas Pendientes
            </Text>
            <Text style={styles.subtitle}>
              {tasks.length === 0 
                ? 'No hay tareas' 
                : tasks.length === 1 
                  ? 'Hay una tarea pendiente'
                  : `Hay ${tasks.length} tareas pendientes`
              }
            </Text>
          </View>

          {/* Segmented Control para Workers */}
          {userType === 'worker' && tasks.length > 0 && (
            <View style={styles.workerFilterContainer}>
              <View style={styles.segmentedControl}>
                <TouchableOpacity
                  style={[styles.segment, workerFilter === 'all' && styles.segmentActive]}
                  onPress={() => setWorkerFilter('all')}
                >
                  <Ionicons 
                    name="apps" 
                    size={16} 
                    color={workerFilter === 'all' ? '#FFFFFF' : '#5D8AA8'} 
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[styles.segmentText, workerFilter === 'all' && styles.segmentTextActive]}>
                    Todos
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.segment, workerFilter === 'personal' && styles.segmentActive]}
                  onPress={() => setWorkerFilter('personal')}
                >
                  <Ionicons 
                    name="person" 
                    size={16} 
                    color={workerFilter === 'personal' ? '#FFFFFF' : '#5D8AA8'} 
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[styles.segmentText, workerFilter === 'personal' && styles.segmentTextActive]}>
                    Personal
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.segment, workerFilter === 'team' && styles.segmentActive]}
                  onPress={() => setWorkerFilter('team')}
                >
                  <Ionicons 
                    name="people" 
                    size={16} 
                    color={workerFilter === 'team' ? '#FFFFFF' : '#5D8AA8'} 
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[styles.segmentText, workerFilter === 'team' && styles.segmentTextActive]}>
                    Equipos
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Botón de Filtro y Barra de Búsqueda */}
          {tasks.length > 0 && (
            <View style={styles.searchRow}>
              {/* Botón de Filtro (solo para managers) */}
              {userType === 'manager' && (
                <TouchableOpacity 
                  style={[styles.filterButton, (filterType && filterId) && styles.filterButtonActive]}
                  onPress={() => setFilterModalVisible(true)}
                >
                  <Ionicons 
                    name="person-outline" 
                    size={20} 
                    color={(filterType && filterId) ? '#FFFFFF' : '#5D8AA8'} 
                  />
                </TouchableOpacity>
              )}

              {/* Barra de Búsqueda */}
              <View style={[styles.searchContainer, userType === 'manager' && styles.searchContainerWithFilter]}>
                <Ionicons name="search" size={20} color="#5D8AA8" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar tareas por título o descripción..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={20} color="#B2BEC3" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Etiqueta de filtro activo */}
          {userType === 'manager' && getFilterLabel() && (
            <View style={styles.filterLabelContainer}>
              <Text style={styles.filterLabelText}>{getFilterLabel()}</Text>
              <TouchableOpacity onPress={() => applyUserTeamFilter(null, null)}>
                <Ionicons name="close-circle" size={16} color="#5D8AA8" />
              </TouchableOpacity>
            </View>
          )}

          {/* Lista de Tareas Pendientes */}
          <View style={styles.container}>
            {tasks.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="checkmark-done-circle" size={64} color="#5D8AA8" />
                <Text style={styles.emptyStateText}>No hay tareas pendientes</Text>
                <Text style={styles.emptyStateSubtext}>
                  Las tareas pendientes aparecerán aquí
                </Text>
              </View>
            ) : searchedTasks.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="search" size={64} color="#5D8AA8" />
                <Text style={styles.emptyStateText}>No se encontraron tareas</Text>
                <Text style={styles.emptyStateSubtext}>
                  Intenta con otros términos de búsqueda
                </Text>
              </View>
            ) : (
              <FlatList
                data={searchedTasks}
                keyExtractor={(item) => item.uid}
                renderItem={({ item }) => (
                  <TaskCard
                    task={item}
                    users={users}
                    teams={teams}
                    onView={(t) => {
                      setSelectedTask(t);
                      setModalMode('view');
                      setModalVisible(true);
                    }}
                  />
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
              />
            )}
          </View>
        </View>
        {/* Modal for viewing a task */}
        <TaskFormModal
          visible={modalVisible}
          mode={modalMode}
          task={selectedTask}
          currentUserUID={userUID}
          onSave={async (taskData) => {
            // not used in view mode
          }}
          onUpdate={async (taskUID, taskData) => {
            try {
              await taskService.updateTask(taskUID, taskData as any);
              // If the task was marked completed, remove it from pending list
              if ((taskData as any).completed === true) {
                setTasks(prev => prev.filter(t => t.uid !== taskUID));
              } else {
                setTasks(prev => prev.map(t => t.uid === taskUID ? { ...t, ...taskData } : t));
              }
              // Close modal after applying changes
              setModalVisible(false);
              setSelectedTask(undefined);
            } catch (err) {
              console.error('Error updating task from modal:', err);
            }
          }}
          onClose={() => { setModalVisible(false); setSelectedTask(undefined); }}
          onDelete={async (taskUID) => {
            try {
              await taskService.deleteTask(taskUID);
              setTasks(prev => prev.filter(t => t.uid !== taskUID));
              setModalVisible(false);
            } catch (err) {
              console.error('Error deleting task from modal:', err);
            }
          }}
        />

        {/* Modal de filtro de usuario/equipo */}
        <UserTeamFilterModal
          visible={filterModalVisible}
          onClose={() => setFilterModalVisible(false)}
          onApplyFilter={applyUserTeamFilter}
          currentFilterType={filterType}
          currentFilterId={filterId}
        />
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
  workerFilterContainer: {
    marginHorizontal: 20,
    marginBottom: 15,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  segmentActive: {
    backgroundColor: '#5D8AA8',
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5D8AA8',
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  searchRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 15,
    gap: 12,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e6f7ff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterButtonActive: {
    backgroundColor: '#5D8AA8',
    borderColor: '#5D8AA8',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e6f7ff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchContainerWithFilter: {
    flex: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#4A6572',
    marginLeft: 12,
    padding: 0,
  },
  filterLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F7FF',
    marginHorizontal: 20,
    marginBottom: 15,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  filterLabelText: {
    flex: 1,
    fontSize: 13,
    color: '#4A6572',
    fontWeight: '500',
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
