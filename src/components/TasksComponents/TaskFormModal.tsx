import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Task, Priority } from '../../types/navigation';
import AssigneeSelector from './AssigneeSelector';

type TaskModalMode = 'create' | 'edit' | 'view';

type TaskFormModalProps = {
  visible: boolean;
  mode: TaskModalMode;
  task?: Task;
  currentUserId: number;
  onSave: (taskData: Omit<Task, 'id' | 'completed' | 'createdAt'>) => void;
  onUpdate: (taskId: number, taskData: Omit<Task, 'id' | 'createdBy' | 'createdAt'>) => void;
  onClose: () => void;
  onDelete?: (taskId: number) => void;
};

const TaskFormModal: React.FC<TaskFormModalProps> = ({
  visible,
  mode,
  task,
  currentUserId,
  onSave,
  onUpdate,
  onClose,
  onDelete,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [priority, setPriority] = useState<Priority>('media');
  const [assigneeType, setAssigneeType] = useState<'team' | 'user'>('user');
  const [selectedTeamId, setSelectedTeamId] = useState<number | undefined>(undefined);
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Reset form cuando se abre/cierra el modal
  useEffect(() => {
    if (visible) {
      if (mode === 'edit' || mode === 'view') {
        setTitle(task?.title || '');
        setDescription(task?.description || '');
        setDueDate(task?.dueDate ? new Date(task.dueDate) : new Date());
        setPriority(task?.priority || 'media');
        setAssigneeType(task?.assignedTo || 'user');
        setSelectedTeamId(task?.assignedTeamId);
        setSelectedUserId(task?.assignedUserId);
      } else {
        // Modo create - reset form
        resetForm();
      }
      setErrors({});
    }
  }, [visible, mode, task]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate(new Date());
    setPriority('media');
    setAssigneeType('user');
    setSelectedTeamId(undefined);
    setSelectedUserId(currentUserId); // Por defecto asignar al usuario actual
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) {
      newErrors.title = 'El título es obligatorio';
    }

    if (!description.trim()) {
      newErrors.description = 'La descripción es obligatoria';
    }

    if (assigneeType === 'team' && !selectedTeamId) {
      newErrors.assignee = 'Selecciona un equipo';
    }

    if (assigneeType === 'user' && !selectedUserId) {
      newErrors.assignee = 'Selecciona una persona';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const taskData: Omit<Task, 'id' | 'createdAt'> = {
        title: title.trim(),
        description: description.trim(),
        dueDate: dueDate,
        priority: priority,
        completed: task?.completed || false, // Preservar el estado de completado
        assignedTo: assigneeType,
        assignedTeamId: assigneeType === 'team' ? selectedTeamId : undefined,
        assignedUserId: assigneeType === 'user' ? selectedUserId : undefined,
        createdBy: currentUserId,
    };

    if (mode === 'create') {
      onSave(taskData);
    } else if (mode === 'edit' && task) {
      onUpdate(task.id, taskData);
    }

    onClose();
  };

  const handleDelete = () => {
    if (!task) return;

    Alert.alert(
      'Eliminar Tarea',
      `¿Estás seguro de que quieres eliminar la tarea "${task.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: () => {
            onDelete?.(task.id);
            onClose();
          }
        },
      ]
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const isViewMode = mode === 'view';
  const isCreateMode = mode === 'create';

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header del Modal */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isCreateMode && 'Crear Nueva Tarea'}
                {mode === 'edit' && 'Editar Tarea'}
                {isViewMode && 'Detalles de Tarea'}
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#4A6572" />
              </TouchableOpacity>
            </View>

            <ScrollView 
            style={styles.modalScroll} 
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.modalScrollContent}
            bounces={true}
            alwaysBounceVertical={true}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            scrollEventThrottle={16}
            >
              {/* Campo Título */}
              <View style={styles.formSection}>
                <Text style={styles.sectionLabel}>Título *</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    errors.title && styles.inputError,
                    isViewMode && styles.inputDisabled
                  ]}
                  placeholder="Ingresa el título de la tarea"
                  value={title}
                  onChangeText={setTitle}
                  editable={!isViewMode}
                />
                {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
              </View>

              {/* Campo Descripción */}
              <View style={styles.formSection}>
                <Text style={styles.sectionLabel}>Descripción *</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    styles.textArea,
                    errors.description && styles.inputError,
                    isViewMode && styles.inputDisabled
                  ]}
                  placeholder="Describe los detalles de la tarea"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  editable={!isViewMode}
                />
                {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
              </View>

              {/* Selector de Fecha */}
              <View style={styles.formSection}>
                <Text style={styles.sectionLabel}>Fecha Límite</Text>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => !isViewMode && setShowDatePicker(true)}
                  disabled={isViewMode}
                >
                  <Ionicons name="calendar" size={20} color="#5D8AA8" />
                  <Text style={styles.dateButtonText}>
                    {formatDate(dueDate)}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={dueDate}
                    mode="date"
                    display="default"
                    onChange={(event, date) => {
                      setShowDatePicker(false);
                      if (date) {
                        setDueDate(date);
                      }
                    }}
                  />
                )}
              </View>

              {/* Selector de Prioridad */}
              <View style={styles.formSection}>
                <Text style={styles.sectionLabel}>Prioridad</Text>
                <View style={styles.priorityButtons}>
                  {(['alta', 'media', 'baja'] as Priority[]).map((prio) => (
                    <TouchableOpacity
                      key={prio}
                      style={[
                        styles.priorityButton,
                        priority === prio && styles.priorityButtonSelected,
                        isViewMode && styles.priorityButtonDisabled
                      ]}
                      onPress={() => !isViewMode && setPriority(prio)}
                      disabled={isViewMode}
                    >
                      <Text style={[
                        styles.priorityButtonText,
                        priority === prio && styles.priorityButtonTextSelected
                      ]}>
                        {prio.charAt(0).toUpperCase() + prio.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Selector de Asignación */}
              <AssigneeSelector
                assigneeType={assigneeType}
                onAssigneeTypeChange={setAssigneeType}
                selectedTeamId={selectedTeamId}
                onTeamChange={setSelectedTeamId}
                selectedUserId={selectedUserId}
                onUserChange={setSelectedUserId}
              />
              {errors.assignee && <Text style={styles.errorText}>{errors.assignee}</Text>}
            </ScrollView>

            {/* Botones del Modal */}
            <View style={styles.modalButtons}>
              {mode === 'edit' && (
                <TouchableOpacity 
                  style={[styles.modalButton, styles.deleteButton]}
                  onPress={handleDelete}
                >
                  <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>
                  {isViewMode ? 'Cerrar' : 'Cancelar'}
                </Text>
              </TouchableOpacity>
              
              {!isViewMode && (
                <TouchableOpacity 
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSave}
                >
                  <Text style={styles.saveButtonText}>
                    {isCreateMode ? 'Crear' : 'Guardar'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    maxHeight: '85%',
    width: '90%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f8ff',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A6572',
  },
  modalScroll: {
    paddingHorizontal: 10,
    
    width: '100%',
    height: '80%',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(0,0,0,0.1)',
  },
  formSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A6572',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#f8fdff',
    borderWidth: 1,
    borderColor: '#e6f7ff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#4A6572',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    color: '#7F8C8D',
  },
  dateButton: {
    flexDirection: 'row',
    backgroundColor: '#f8fdff',
    borderWidth: 1,
    borderColor: '#e6f7ff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#4A6572',
    marginLeft: 8,
  },
  priorityButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityButton: {
    flex: 1,
    backgroundColor: '#f8fdff',
    borderWidth: 1,
    borderColor: '#e6f7ff',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  priorityButtonSelected: {
    backgroundColor: '#e6f7ff',
    borderColor: '#5D8AA8',
  },
  priorityButtonDisabled: {
    opacity: 0.6,
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#5D8AA8',
  },
  priorityButtonTextSelected: {
    color: '#4A6572',
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 14,
    color: '#e74c3c',
    marginTop: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f8ff',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  cancelButton: {
    backgroundColor: '#f8fdff',
    borderWidth: 1,
    borderColor: '#e6f7ff',
    flex: 1,
    marginHorizontal: 6,
  },
  saveButton: {
    backgroundColor: '#4A6572',
    flex: 1,
    marginHorizontal: 6,
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    width: 50,
    marginHorizontal: 6,
  },
  cancelButtonText: {
    color: '#5D8AA8',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalScrollContent: {
  paddingHorizontal: 20,
  paddingBottom: 20, 
  paddingRight: 15,
},
});

export default TaskFormModal;