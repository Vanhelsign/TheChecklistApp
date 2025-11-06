import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  FlatList,
  Animated,
  Alert,
  ActivityIndicator
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Task, Priority, User, Team } from '../types/navigation';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

// Componentes
import SideNavbar from '../components/SideNavbar';
import MenuButton from '../components/MenuButton';
import TaskFormModal from '../components/TasksComponents/TaskFormModal';

// Datos
import taskService from '../services/task.service';
import userService from '../services/user.service';
import teamService from '../services/team.service';
import authService from '../services/auth.service';

type TaskModalMode = 'create' | 'edit' | 'view';

type Props = NativeStackScreenProps<RootStackParamList, 'Tasks'>;

// TaskCard ahora recibe users como prop
const TaskCard = ({ 
  task, 
  users,
  teams,
  onEdit, 
  onView, 
  onDelete 
}: { 
  task: Task; 
  users: User[];
  teams: Team[];
  onEdit: (task: Task) => void;
  onView: (task: Task) => void;
  onDelete: (task: Task) => void;
}) => {
  const assignedTo = task.assignedTo === 'team' 
    ? teams.find(t => t.uid === task.assignedTeamUID)?.name
    : users.find(u => u.uid === task.assignedUserUID)?.name;
  
  const createdBy = users.find(u => u.uid === task.createdBy)?.name;

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'alta': return '#e74c3c';
      case 'media': return '#f39c12';
      case 'baja': return '#27ae60';
      default: return '#7F8C8D';
    }
  };

  return (
    <View style={styles.taskCard}>
      <View style={styles.taskHeader}>
        <View style={styles.taskInfo}>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <Text style={styles.taskDescription}>{task.description}</Text>
          <View style={styles.taskMeta}>
            <Text style={styles.taskMetaText}>
              Asignada a: {assignedTo || 'No asignada'}
            </Text>
            <Text style={styles.taskMetaText}>
              • Creada por: {createdBy || 'Desconocido'}
            </Text>
          </View>
        </View>
        <View style={styles.taskActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onEdit(task)}
          >
            <Ionicons name="create-outline" size={18} color="#5D8AA8" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onDelete(task)}
          >
            <Ionicons name="trash-outline" size={18} color="#e74c3c" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.taskFooter}>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
          <Text style={styles.priorityText}>{task.priority.toUpperCase()}</Text>
        </View>
        <Text style={styles.dueDate}>
          Vence: {task.dueDate.toLocaleDateString('es-ES')}
        </Text>
        <TouchableOpacity 
          style={styles.viewButton}
          onPress={() => onView(task)}
        >
          <Text style={styles.viewButtonText}>Ver</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function TasksScreen({ route, navigation }: Props) {
  const { userType, userUID, userName, userTeamUIDs } = route.params;

  // Estados para la navbar
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [activeScreen, setActiveScreen] = useState('Tasks');
  const slideAnim = useState(new Animated.Value(-280))[0];

  // Estados para tareas
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<TaskModalMode>('create');
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);

  // Fetch tasks AND users ONCE when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [fetchedTasks, fetchedUsers, fetchedTeams] = await Promise.all([
          taskService.getAllTasks(),
          userService.getAllUsers(),
          teamService.getAllTeams()
        ]);
        setTasks(fetchedTasks);
        setUsers(fetchedUsers);
        setTeams(fetchedTeams);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filtrar tareas creadas por el manager actual
  const managerTasks = tasks.filter(task => task.createdBy === userUID);

  // Funciones de navegación
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
    
    if (screenName === 'Tasks') {
      toggleNav();
      return;
    }

    const userParams = {
      userType: userType,
      userUID: userUID,
      userName: userName,
      userTeamUIDs: userTeamUIDs
    };

    switch (screenName) {
      case 'Home':
        navigation.navigate('Home', userParams);
        break;
      case 'PendingTasks':
        navigation.navigate('PendingTasks', userParams);
        break;
      case 'CompletedTasks':
        navigation.navigate('CompletedTasks', userParams);
        break;
      case 'Teams':
        navigation.navigate('Teams', userParams);
        break;
      case 'Login':
        navigation.navigate('Login');
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

  // Funciones para tareas
  const handleCreateTask = () => {
    setModalMode('create');
    setSelectedTask(undefined);
    setModalVisible(true);
  };

  const handleEditTask = (task: Task) => {
    setModalMode('edit');
    setSelectedTask(task);
    setModalVisible(true);
  };

  const handleViewTask = (task: Task) => {
    setModalMode('view');
    setSelectedTask(task);
    setModalVisible(true);
  };

  const handleDeleteTask = (task: Task) => {
    Alert.alert(
      'Eliminar Tarea',
      `¿Estás seguro de que quieres eliminar la tarea "${task.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await taskService.deleteTask(task.uid);
              setTasks(prevTasks => prevTasks.filter(t => t.uid !== task.uid));
            } catch (error) {
              console.error("Error deleting task:", error);
            }
          }
        },
      ]
    );
  };

  const handleSaveTask = async (taskData: Omit<Task, 'uid' | 'completed' | 'createdAt'>) => {
    const newTask: Omit<Task, 'uid'> = {
      ...taskData,
      completed: false,
      createdAt: new Date(),
    };
    
    try {
      const createdTask = await taskService.createTask(newTask);
      setTasks(prevTasks => [...prevTasks, createdTask]);
      setModalVisible(false);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleUpdateTask = async (taskId: string, taskData: Omit<Task, 'uid' | 'completed' | 'createdBy' | 'createdAt'>) => {
    try {
      await taskService.updateTask(taskId, taskData);
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.uid === taskId 
            ? { ...task, ...taskData }
            : task
        )
      );
      setModalVisible(false);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleDeleteTaskFromModal = async (taskId: string) => {
    try {
      await taskService.deleteTask(taskId);
      setTasks(prevTasks => prevTasks.filter(t => t.uid !== taskId));
      setModalVisible(false);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedTask(undefined);
  };

  // Show loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.fullScreen}>
        <LinearGradient 
          colors={['#ffffff', '#e6f7ff', '#d6f0ff']} 
          style={[styles.fullScreen, { justifyContent: 'center', alignItems: 'center' }]}
        >
          <ActivityIndicator size="large" color="#4A6572" />
          <Text style={{ marginTop: 10, color: '#7F8C8D', fontSize: 16 }}>
            Cargando tareas...
          </Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.fullScreen}>
      <LinearGradient 
        colors={['#ffffff', '#e6f7ff', '#d6f0ff']} 
        style={styles.fullScreen}
      >
        <StatusBar style="auto" />
        
        {/* Botón del menú */}
        <MenuButton onPress={toggleNav} color={getRoleColor()} />

        {/* Barra de Navegación Lateral */}
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

        {/* Overlay para cerrar nav */}
        {isNavOpen && (
          <TouchableOpacity 
            style={styles.overlay}
            onPress={toggleNav}
            activeOpacity={1}
          />
        )}

        {/* Contenido Principal */}
        <View style={styles.mainContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: getRoleColor() }]}>
              Gestión de Tareas
            </Text>
            <Text style={styles.subtitle}>
              {managerTasks.length === 0 
                ? 'Crea tu primera tarea' 
                : `${managerTasks.length} tarea${managerTasks.length !== 1 ? 's' : ''} creada${managerTasks.length !== 1 ? 's' : ''}`
              }
            </Text>
          </View>

          {/* Botón Crear Tarea */}
          <TouchableOpacity 
            style={styles.createButton}
            onPress={handleCreateTask}
          >
            <Ionicons name="add" size={24} color="#fff" />
            <Text style={styles.createButtonText}>Crear Nueva Tarea</Text>
          </TouchableOpacity>

          {/* Lista de Tareas */}
          <View style={styles.container}>
            {managerTasks.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={64} color="#5D8AA8" />
                <Text style={styles.emptyStateText}>No hay tareas creadas</Text>
                <Text style={styles.emptyStateSubtext}>
                  Presiona el botón de arriba para crear tu primera tarea
                </Text>
              </View>
            ) : (
              <FlatList
                data={managerTasks}
                keyExtractor={(item) => item.uid}
                renderItem={({ item }) => (
                  <TaskCard
                    task={item}
                    users={users}
                    teams={teams}
                    onEdit={handleEditTask}
                    onView={handleViewTask}
                    onDelete={handleDeleteTask}
                  />
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
              />
            )}
          </View>
        </View>

        {/* Modal para crear/editar/ver tareas */}
        <TaskFormModal
          visible={modalVisible}
          mode={modalMode}
          task={selectedTask}
          currentUserUID={userUID}
          onSave={handleSaveTask}
          onUpdate={handleUpdateTask}
          onClose={closeModal}
          onDelete={handleDeleteTaskFromModal}
        />

      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
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
  createButton: {
    flexDirection: 'row',
    backgroundColor: '#4A6572',
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: 10,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
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
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 18,
  },
  // Estilos para TaskCard
  taskCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#5D8AA8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#f0f8ff',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  taskInfo: {
    flex: 1,
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A6572',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 6,
    lineHeight: 18,
  },
  taskMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  taskMetaText: {
    fontSize: 12,
    color: '#B2BEC3',
    marginRight: 8,
    marginBottom: 2,
  },
  taskActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 6,
    marginLeft: 8,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f8ff',
    paddingTop: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  dueDate: {
    fontSize: 12,
    color: '#7F8C8D',
    flex: 1,
    marginLeft: 12,
  },
  viewButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f8fdff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e6f7ff',
  },
  viewButtonText: {
    fontSize: 12,
    color: '#4A6572',
    fontWeight: '500',
  },
});