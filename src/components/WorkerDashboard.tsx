import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Task, Team } from '../types/navigation';
import taskService from '../services/task.service';
import teamService from '../services/team.service';

type WorkerDashboardProps = {
  userUID: string;
  userType: 'manager' | 'worker';
  userName: string;
  userTeamUIDs: string[];
};

const WorkerDashboard: React.FC<WorkerDashboardProps> = ({ userUID, userType, userName, userTeamUIDs }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [tasks, setTasks] = useState<Task[]>([]);
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

    const unsubscribeTeams = teamService.subscribeToTeams(
      (fetchedTeams) => setTeams(fetchedTeams),
      (error) => console.error("Error cargando equipos:", error)
    );

    return () => {
      unsubscribeTasks();
      unsubscribeTeams();
    };
  }, []);

  // Filtrar tareas del trabajador
  const myTasks = tasks.filter(task => {
    if (task.assignedTo === 'user') {
      return task.assignedUserUID === userUID;
    } else if (task.assignedTo === 'team' && task.assignedTeamUID) {
      const team = teams.find(t => t.uid === task.assignedTeamUID);
      return team?.memberUIDs.includes(userUID);
    }
    return false;
  });

  const myPendingTasks = myTasks.filter(t => !t.completed);
  const myCompletedTasks = myTasks.filter(t => t.completed);
  const completionRate = myTasks.length > 0 ? Math.round((myCompletedTasks.length / myTasks.length) * 100) : 0;

  // Tareas urgentes (próximas a vencer)
  const today = new Date();
  const urgentTasks = myPendingTasks
    .filter(task => {
      const dueDate = new Date(task.dueDate);
      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 3 && diffDays >= 0;
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  // Tareas vencidas
  const overdueTasks = myPendingTasks.filter(task => {
    const dueDate = new Date(task.dueDate);
    return dueDate < today;
  });

  // Mis equipos
  const myTeams = teams.filter(team => team.memberUIDs.includes(userUID));

  // Tareas por prioridad
  const highPriorityTasks = myPendingTasks.filter(t => t.priority === 'alta').length;

  const getDaysUntilDue = (dueDate: Date) => {
    const diffDays = Math.ceil((new Date(dueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'Vencida';
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Mañana';
    return `${diffDays} días`;
  };

  return (
    <View style={styles.container}>
      {/* Progreso personal */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Ionicons name="trending-up" size={24} color="#5D8AA8" />
          <Text style={styles.progressTitle}>Mi Progreso</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${completionRate}%` }]} />
        </View>
        <Text style={styles.progressText}>{completionRate}% completado ({myCompletedTasks.length}/{myTasks.length} tareas)</Text>
      </View>

      {/* Estadísticas principales */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: '#F39C12' }]}>
          <Ionicons name="clipboard" size={24} color="#FFFFFF" />
          <Text style={styles.statNumber}>{myPendingTasks.length}</Text>
          <Text style={styles.statLabel}>Pendientes</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#27AE60' }]}>
          <Ionicons name="checkmark-done" size={24} color="#FFFFFF" />
          <Text style={styles.statNumber}>{myCompletedTasks.length}</Text>
          <Text style={styles.statLabel}>Completadas</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#E74C3C' }]}>
          <Ionicons name="alert-circle" size={24} color="#FFFFFF" />
          <Text style={styles.statNumber}>{highPriorityTasks}</Text>
          <Text style={styles.statLabel}>Alta Prioridad</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#9B59B6' }]}>
          <Ionicons name="people" size={24} color="#FFFFFF" />
          <Text style={styles.statNumber}>{myTeams.length}</Text>
          <Text style={styles.statLabel}>Mis Equipos</Text>
        </View>
      </View>

      {/* Alertas de tareas vencidas */}
      {overdueTasks.length > 0 && (
        <View style={styles.alertSection}>
          <View style={styles.alertHeader}>
            <Ionicons name="warning" size={20} color="#E74C3C" />
            <Text style={styles.alertTitle}>¡Tienes {overdueTasks.length} tarea{overdueTasks.length !== 1 ? 's' : ''} vencida{overdueTasks.length !== 1 ? 's' : ''}!</Text>
          </View>
        </View>
      )}

      {/* Tareas urgentes */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="time" size={20} color="#4A6572" />
          <Text style={styles.sectionTitle}>Tareas Próximas a Vencer</Text>
        </View>
        <View style={styles.urgentTasksList}>
          {loading ? (
            <Text style={styles.emptyText}>Cargando...</Text>
          ) : urgentTasks.length === 0 ? (
            <Text style={styles.emptyText}>No tienes tareas urgentes 🎉</Text>
          ) : (
            urgentTasks.map((task) => (
              <View key={task.uid} style={styles.urgentTaskItem}>
                <View style={styles.urgentTaskLeft}>
                  <Text style={styles.urgentTaskTitle} numberOfLines={1}>{task.title}</Text>
                  <View style={styles.urgentTaskMeta}>
                    <Text style={styles.priorityBadge}>
                      {task.priority === 'alta' ? '🔴' : task.priority === 'media' ? '🟡' : '🟢'}
                    </Text>
                    <Text style={styles.urgentTaskDate}>
                      Vence: {getDaysUntilDue(task.dueDate)}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#B2BEC3" />
              </View>
            ))
          )}
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
            onPress={() => navigation.navigate('PendingTasks', userParams)}
          >
            <Ionicons name="list" size={24} color="#5D8AA8" />
            <Text style={styles.actionButtonText}>Ver Pendientes</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('CompletedTasks', userParams)}
          >
            <Ionicons name="checkmark-done-circle" size={24} color="#5D8AA8" />
            <Text style={styles.actionButtonText}>Ver Completadas</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Mis equipos */}
      {myTeams.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="people-outline" size={20} color="#4A6572" />
            <Text style={styles.sectionTitle}>Mis Equipos</Text>
          </View>
          <View style={styles.teamsList}>
            {myTeams.map((team) => {
              const teamTasks = myPendingTasks.filter(t => t.assignedTeamUID === team.uid);
              return (
                <View key={team.uid} style={styles.teamItem}>
                  <View style={styles.teamIcon}>
                    <Ionicons name="people" size={20} color="#5D8AA8" />
                  </View>
                  <View style={styles.teamInfo}>
                    <Text style={styles.teamName}>{team.name}</Text>
                    <Text style={styles.teamMeta}>{teamTasks.length} tareas pendientes</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressSection: {
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
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A6572',
  },
  progressBar: {
    height: 12,
    backgroundColor: '#E8EEF1',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#5D8AA8',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 13,
    color: '#7F8C8D',
    textAlign: 'center',
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#FFFFFF',
    marginTop: 4,
    opacity: 0.9,
  },
  alertSection: {
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFE0E0',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E74C3C',
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
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A6572',
  },
  urgentTasksList: {
    gap: 8,
  },
  urgentTaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#FFF9F0',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFE8CC',
  },
  urgentTaskLeft: {
    flex: 1,
  },
  urgentTaskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A6572',
    marginBottom: 4,
  },
  urgentTaskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priorityBadge: {
    fontSize: 10,
  },
  urgentTaskDate: {
    fontSize: 12,
    color: '#F39C12',
    fontWeight: '500',
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
  teamsList: {
    gap: 10,
  },
  teamItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    gap: 12,
  },
  teamIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E6F7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A6572',
    marginBottom: 2,
  },
  teamMeta: {
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

export default WorkerDashboard;