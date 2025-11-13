import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Task, User, Team } from '../types/navigation';
import taskService from '../services/task.service';
import userService from '../services/user.service';
import teamService from '../services/team.service';

type ManagerDashboardProps = {
  userUID: string;
  userType: 'manager' | 'worker';
  userName: string;
  userTeamUIDs: string[];
};

const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ userUID, userType, userName, userTeamUIDs }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  const userParams = { userType, userUID, userName, userTeamUIDs };

  useEffect(() => {
    const unsubscribeTasks = taskService.subscribeToTasks(
      (fetchedTasks) => {
        setTasks(fetchedTasks);
        setLoading(false);
      },
      (error) => console.error("Error cargando tareas:", error)
    );

    const unsubscribeUsers = userService.subscribeToUsers(
      (fetchedUsers) => setUsers(fetchedUsers),
      (error) => console.error("Error cargando usuarios:", error)
    );

    const unsubscribeTeams = teamService.subscribeToTeams(
      (fetchedTeams) => setTeams(fetchedTeams),
      (error) => console.error("Error cargando equipos:", error)
    );

    return () => {
      unsubscribeTasks();
      unsubscribeUsers();
      unsubscribeTeams();
    };
  }, []);

  // Estadísticas
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter(t => !t.completed).length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const totalWorkers = users.filter(u => u.role === 'worker').length;
  const totalTeams = teams.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Tareas recientes (últimas 5)
  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Tareas por prioridad
  const highPriorityTasks = tasks.filter(t => t.priority === 'alta' && !t.completed).length;

  return (
    <View style={styles.container}>
      {/* Estadísticas principales */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: '#5D8AA8' }]}>
          <Ionicons name="document-text" size={28} color="#FFFFFF" />
          <Text style={styles.statNumber}>{totalTasks}</Text>
          <Text style={styles.statLabel}>Total Tareas</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#F39C12' }]}>
          <Ionicons name="time" size={28} color="#FFFFFF" />
          <Text style={styles.statNumber}>{pendingTasks}</Text>
          <Text style={styles.statLabel}>Pendientes</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#27AE60' }]}>
          <Ionicons name="checkmark-circle" size={28} color="#FFFFFF" />
          <Text style={styles.statNumber}>{completedTasks}</Text>
          <Text style={styles.statLabel}>Completadas</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#E74C3C' }]}>
          <Ionicons name="alert-circle" size={28} color="#FFFFFF" />
          <Text style={styles.statNumber}>{highPriorityTasks}</Text>
          <Text style={styles.statLabel}>Alta Prioridad</Text>
        </View>
      </View>

      {/* Resumen del equipo */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="people" size={20} color="#4A6572" />
          <Text style={styles.sectionTitle}>Resumen del Equipo</Text>
        </View>
        <View style={styles.teamStats}>
          <View style={styles.teamStatItem}>
            <Text style={styles.teamStatNumber}>{totalWorkers}</Text>
            <Text style={styles.teamStatLabel}>Trabajadores</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.teamStatItem}>
            <Text style={styles.teamStatNumber}>{totalTeams}</Text>
            <Text style={styles.teamStatLabel}>Equipos</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.teamStatItem}>
            <Text style={styles.teamStatNumber}>{completionRate}%</Text>
            <Text style={styles.teamStatLabel}>Completado</Text>
          </View>
        </View>
      </View>

      {/* Acciones rápidas */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="flash" size={20} color="#4A6572" />
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        </View>
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Tasks', userParams)}
          >
            <Ionicons name="add-circle" size={24} color="#5D8AA8" />
            <Text style={styles.actionButtonText}>Crear Tarea</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Teams', userParams)}
          >
            <Ionicons name="people" size={24} color="#5D8AA8" />
            <Text style={styles.actionButtonText}>Gestionar Equipos</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('PendingTasks', userParams)}
          >
            <Ionicons name="list" size={24} color="#5D8AA8" />
            <Text style={styles.actionButtonText}>Ver Pendientes</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tareas recientes */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="time-outline" size={20} color="#4A6572" />
          <Text style={styles.sectionTitle}>Tareas Recientes</Text>
        </View>
        <View style={styles.recentTasksList}>
          {loading ? (
            <Text style={styles.emptyText}>Cargando...</Text>
          ) : recentTasks.length === 0 ? (
            <Text style={styles.emptyText}>No hay tareas aún</Text>
          ) : (
            recentTasks.map((task) => (
              <View key={task.uid} style={styles.recentTaskItem}>
                <Ionicons 
                  name={task.completed ? "checkmark-circle" : "ellipse-outline"} 
                  size={20} 
                  color={task.completed ? "#27AE60" : "#F39C12"} 
                />
                <View style={styles.recentTaskInfo}>
                  <Text style={styles.recentTaskTitle} numberOfLines={1}>{task.title}</Text>
                  <Text style={styles.recentTaskMeta}>
                    {task.priority === 'alta' ? '🔴' : task.priority === 'media' ? '🟡' : '🟢'} {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#5D8AA8',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 4,
    opacity: 0.9,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#5D8AA8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f8ff',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A6572',
  },
  teamStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  teamStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  teamStatNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#5D8AA8',
  },
  teamStatLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#E8EEF1',
  },
  quickActions: {
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 14,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E8EEF1',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4A6572',
  },
  recentTasksList: {
    gap: 10,
  },
  recentTaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    gap: 12,
  },
  recentTaskInfo: {
    flex: 1,
  },
  recentTaskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A6572',
    marginBottom: 2,
  },
  recentTaskMeta: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  emptyText: {
    textAlign: 'center',
    color: '#B2BEC3',
    fontSize: 14,
    paddingVertical: 20,
  },
});

export default ManagerDashboard;