import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task, User, Team, Priority } from '../types/navigation';

type TaskCardProps = {
  task: Task;
  users: User[];
  teams: Team[];
  onEdit?: (task: Task) => void;
  onView: (task: Task) => void;
  onDelete?: (task: Task) => void;
};

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  users,
  teams,
  onEdit, 
  onView, 
  onDelete 
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
        {(onEdit || onDelete) && (
          <View style={styles.taskActions}>
            {onEdit && (
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => onEdit(task)}
              >
                <Ionicons name="create-outline" size={18} color="#5D8AA8" />
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => onDelete(task)}
              >
                <Ionicons name="trash-outline" size={18} color="#e74c3c" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <View style={styles.taskFooter}>
        <View style={styles.taskBadges}>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
            <Text style={styles.priorityText}>{task.priority.toUpperCase()}</Text>
          </View>
          {task.completed && (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" />
              <Text style={styles.completedText}>Completado</Text>
            </View>
          )}
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

const styles = StyleSheet.create({
  taskCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  taskInfo: {
    flex: 1,
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  taskMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  taskMetaText: {
    fontSize: 12,
    color: '#95A5A6',
    marginRight: 8,
  },
  taskActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  taskBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  completedText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  dueDate: {
    fontSize: 12,
    color: '#7F8C8D',
    marginRight: 8,
  },
  viewButton: {
    backgroundColor: '#5D8AA8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default TaskCard;
