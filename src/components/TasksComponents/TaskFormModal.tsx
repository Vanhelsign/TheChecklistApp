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
import { Task, Priority, TaskStatus, CheckListItem, CheckListItemTypes } from '../../types/navigation';
import AssigneeSelector from './AssigneeSelector';
import simpleAlertService from '../../services/simpleAlert.service';
import taskService from '../../services/task.service';

type TaskModalMode = 'create' | 'edit' | 'view';

type TaskFormModalProps = {
  visible: boolean;
  mode: TaskModalMode;
  task?: Task;
  currentUserUID: string;
  onSave: (taskData: Omit<Task, 'uid' | 'createdAt'>) => void;
  onUpdate: (taskUID: string, taskData: Omit<Task, 'uid' | 'createdBy' | 'createdAt'>) => void;
  onClose: () => void;
  onDelete?: (taskUID: string) => void;
};

const TaskFormModal: React.FC<TaskFormModalProps> = ({
  visible,
  mode,
  task,
  currentUserUID,
  onSave,
  onUpdate,
  onClose,
  onDelete,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [priority, setPriority] = useState<Priority>('media');
  const [status, setStatus] = useState<boolean>(TaskStatus.Pending);
  const [checklistItems, setChecklistItems] = useState<CheckListItem[]>([]);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [newChecklistType, setNewChecklistType] = useState<CheckListItemTypes>('checkbox');
  const [newChecklistValue, setNewChecklistValue] = useState('');
  const [assigneeType, setAssigneeType] = useState<'team' | 'user'>('user');
  const [selectedTeamUID, setSelectedTeamUID] = useState<string | undefined>(undefined);
  const [selectedUserUID, setSelectedUserUID] = useState<string | undefined>(undefined);
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
        setStatus(task?.completed ?? TaskStatus.Pending);
        setAssigneeType(task?.assignedTo || 'user');
        setSelectedTeamUID(task?.assignedTeamUID);
        setSelectedUserUID(task?.assignedUserUID);
        setChecklistItems(task?.checklistItems ?? []);
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
    setStatus(TaskStatus.Pending);
    setAssigneeType('user');
    setSelectedTeamUID(undefined);
    setSelectedUserUID(currentUserUID); // Por defecto asignar al usuario actual
    setChecklistItems([]);
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) {
      newErrors.title = 'El título es obligatorio';
    }

    if (!description.trim()) {
      newErrors.description = 'La descripción es obligatoria';
    }

    if (assigneeType === 'team' && !selectedTeamUID) {
      newErrors.assignee = 'Selecciona un equipo';
    }

    if (assigneeType === 'user' && !selectedUserUID) {
      newErrors.assignee = 'Selecciona una persona';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Checklist helpers
  const addChecklistItem = async (text: string, type?: CheckListItemTypes, value?: string) => {
    if (!text.trim() && (type === 'checkbox' || !value)) return;
    const id = Date.now().toString() + Math.random().toString(36).slice(2);
    const item: CheckListItem = {
      id,
      text: text.trim() || (type === 'checkbox' ? '' : ''),
      type: type || newChecklistType,
      completed: false,
    };

    // set appropriate value fields depending on type
    const finalType = type || newChecklistType;
    if (finalType === 'textInput') item.value = value ?? newChecklistValue;
    if (finalType === 'numberInput') item.numberValue = value ? Number(value) : undefined;
    if (finalType === 'fileUpload') item.fileUri = value ?? newChecklistValue;
    if (finalType === 'signUpload') item.signatureUri = value ?? newChecklistValue;

    // Optimistically update local state
    setChecklistItems(prev => [...prev, item]);
    setNewChecklistText('');
    setNewChecklistValue('');
    setNewChecklistType('checkbox');

    // If we're viewing an existing task, persist append atomically with arrayUnion
    if (isViewMode && task?.uid) {
      try {
        await taskService.addChecklistItem(task.uid, item);
      } catch (err) {
        console.error('Failed to add checklist item to Firestore:', err);
        simpleAlertService.showAlert('Error', 'No se pudo guardar la subtarea en el servidor.');
      }
    }
  };

  const updateChecklistItemText = (id: string, text: string) => {
    setChecklistItems(prev => {
      const updated = prev.map(i => i.id === id ? { ...i, text } : i);
      // Persist full-array replace when editing an existing item
      if (isViewMode && task?.uid) {
        taskService.updateTask(task.uid, { checklistItems: updated }).catch(err => {
          console.error('Failed to update checklist text:', err);
          simpleAlertService.showAlert('Error', 'No se pudo actualizar la subtarea en el servidor.');
        });
      }
      return updated;
    });
  };

  const updateChecklistItemValue = (id: string, value: string) => {
    setChecklistItems(prev => {
      const updated = prev.map(i => {
        if (i.id !== id) return i;
        if (i.type === 'textInput') return { ...i, value };
        if (i.type === 'numberInput') {
          // Validar que solo contenga números, punto decimal o esté vacío
          if (value === '' || value === '-') {
            return { ...i, numberValue: undefined };
          }
          const numValue = Number(value);
          // Solo actualizar si es un número válido
          if (!isNaN(numValue)) {
            return { ...i, numberValue: numValue };
          }
          // Si no es válido, mantener el valor anterior
          return i;
        }
        if (i.type === 'fileUpload') return { ...i, fileUri: value };
        if (i.type === 'signUpload') return { ...i, signatureUri: value };
        return i;
      });
      if (isViewMode && task?.uid) {
        taskService.updateTask(task.uid, { checklistItems: updated }).catch(err => {
          console.error('Failed to update checklist value:', err);
          simpleAlertService.showAlert('Error', 'No se pudo actualizar la subtarea en el servidor.');
        });
      }
      return updated;
    });
  };

  const toggleChecklistItemCompleted = (id: string) => {
    setChecklistItems(prev => {
      const updated = prev.map(i => i.id === id ? { ...i, completed: !i.completed } : i);
      if (isViewMode && task?.uid) {
        // Persist full-array replace when toggling completion
        taskService.updateTask(task.uid, { checklistItems: updated }).catch(err => {
          console.error('Failed to toggle checklist completion:', err);
          simpleAlertService.showAlert('Error', 'No se pudo actualizar la subtarea en el servidor.');
        });
      }
      return updated;
    });
  };

  const removeChecklistItem = async (id: string) => {
    const itemToRemove = checklistItems.find(i => i.id === id);
    // Optimistically update local state
    setChecklistItems(prev => prev.filter(i => i.id !== id));

    if (isViewMode && task?.uid && itemToRemove) {
      try {
        // Use arrayRemove to delete the exact item value atomically
        await taskService.removeChecklistItem(task.uid, itemToRemove);
      } catch (err) {
        console.error('Failed to remove checklist item from Firestore:', err);
        simpleAlertService.showAlert('Error', 'No se pudo eliminar la subtarea en el servidor.');
      }
    }
  };

  const moveChecklistItem = (id: string, direction: 'up' | 'down') => {
    setChecklistItems(prev => {
      const index = prev.findIndex(i => i.id === id);
      if (index === -1) return prev;
      
      // No mover si ya está en el límite
      if ((direction === 'up' && index === 0) || (direction === 'down' && index === prev.length - 1)) {
        return prev;
      }

      const newItems = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      
      // Intercambiar posiciones
      [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
      
      // Persistir si está en modo vista
      if (isViewMode && task?.uid) {
        taskService.updateTask(task.uid, { checklistItems: newItems }).catch(err => {
          console.error('Failed to reorder checklist:', err);
          simpleAlertService.showAlert('Error', 'No se pudo reordenar la subtarea en el servidor.');
        });
      }
      
      return newItems;
    });
  };

  const handleSave = () => {
    if (!validateForm()) return;

  const taskData: Omit<Task, 'uid' | 'createdAt'> = {
        title: title.trim(),
        description: description.trim(),
        dueDate: dueDate,
        priority: priority,
        completed: status,
    checklistItems: checklistItems,
        assignedTo: assigneeType,
        assignedTeamUID: assigneeType === 'team' ? selectedTeamUID : undefined,
        assignedUserUID: assigneeType === 'user' ? selectedUserUID : undefined,
        createdBy: currentUserUID,
    };

    if (mode === 'create') {
      onSave(taskData);
    } else if (mode === 'edit' && task) {
      onUpdate(task.uid, taskData);
    }

    onClose();
  };

  const handleDelete = () => {
    if (!task) return;

    simpleAlertService.showOptions(
      'Eliminar Tarea',
      `¿Estás seguro de que quieres eliminar la tarea "${task.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => {} },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            onDelete?.(task.uid);
            onClose();
          }
        },
      ]
    );
  };

  // Close handler that persists checklist changes when in view mode
  const handleClose = () => {
    if (isViewMode && task) {
      try {
        const original = JSON.stringify(task.checklistItems ?? []);
        const current = JSON.stringify(checklistItems ?? []);
        if (original !== current) {
          // Build a full update payload (onUpdate expects most task fields except uid/createdBy/createdAt)
          const taskDataToUpdate: Omit<Task, 'uid' | 'createdBy' | 'createdAt'> = {
            title: title.trim(),
            description: description.trim(),
            dueDate,
            priority,
            completed: status,
            checklistItems,
            assignedTo: assigneeType,
            assignedTeamUID: assigneeType === 'team' ? selectedTeamUID : undefined,
            assignedUserUID: assigneeType === 'user' ? selectedUserUID : undefined,
          };

          onUpdate(task.uid, taskDataToUpdate);
          return;
        }
      } catch (e) {
        // If stringify fails for some reason, fall back to not updating
        console.error('Error comparing checklist items:', e);
      }
    }

    // Default: just close
    onClose();
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
      onRequestClose={handleClose}
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
              <TouchableOpacity onPress={handleClose}>
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
                <Text style={styles.sectionLabel}>Título{!isViewMode && ' *'}</Text>
                {isViewMode ? (
                  <Text style={styles.viewModeText}>{title}</Text>
                ) : (
                  <TextInput
                    style={[
                      styles.textInput,
                      errors.title && styles.inputError
                    ]}
                    placeholder="Ingresa el título de la tarea"
                    value={title}
                    onChangeText={setTitle}
                    editable={true}
                  />
                )}
                {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
              </View>

              {/* Campo Descripción */}
              <View style={styles.formSection}>
                <Text style={styles.sectionLabel}>Descripción{!isViewMode && ' *'}</Text>
                {isViewMode ? (
                  <Text style={styles.viewModeText}>{description}</Text>
                ) : (
                  <TextInput
                    style={[
                      styles.textInput,
                      styles.textArea,
                      errors.description && styles.inputError
                    ]}
                    placeholder="Describe los detalles de la tarea"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    editable={true}
                  />
                )}
                {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
              </View>

              {/* Campo Subtareas */}
              <View style={styles.formSection}>
                <Text style={styles.sectionLabel}>Subtareas</Text>
                {/* Lista de items existentes */}
                {checklistItems.length === 0 ? (
                  <Text style={{ color: '#7F8C8D', marginBottom: 10 }}>No hay subtareas</Text>
                ) : (
                  checklistItems.map(item => (
                    <View key={item.id} style={styles.checklistItem}>
                      <TouchableOpacity
                        onPress={() => toggleChecklistItemCompleted(item.id)}
                        disabled={false}
                        style={styles.checkToggle}
                      >
                        <Ionicons
                          name={item.completed ? 'checkbox' : 'square-outline'}
                          size={22}
                          color={item.completed ? '#27ae60' : '#5D8AA8'}
                        />
                      </TouchableOpacity>

                      <View style={{ flex: 1 }}>
                        {/* Label */}
                        {isViewMode ? (
                          <Text style={[styles.checklistText, item.completed && styles.checklistTextCompleted]}>{item.text}</Text>
                        ) : (
                          <TextInput
                            value={item.text}
                            onChangeText={(t) => updateChecklistItemText(item.id, t)}
                            style={[styles.checklistInput, item.completed && styles.checklistTextCompleted]}
                          />
                        )}

                        {/* Type-specific value */}
                        {item.type === 'textInput' && (
                          <TextInput
                            placeholder="Ingresa un valor..."
                            value={item.value ?? ''}
                            onChangeText={(v) => updateChecklistItemValue(item.id, v)}
                            editable={true}
                            style={[styles.checklistValueInput, item.completed && styles.checklistTextCompleted]}
                          />
                        )}

                        {item.type === 'numberInput' && (
                          <TextInput
                            placeholder="Ingresa un número..."
                            value={item.numberValue !== undefined && !isNaN(item.numberValue) ? String(item.numberValue) : ''}
                            onChangeText={(v) => {
                              // Permitir solo números, punto decimal, y signo negativo al inicio
                              const sanitized = v.replace(/[^0-9.-]/g, '');
                              updateChecklistItemValue(item.id, sanitized);
                            }}
                            editable={true}
                            keyboardType="numeric"
                            style={[styles.checklistValueInput, item.completed && styles.checklistTextCompleted]}
                          />
                        )}

                        {item.type === 'fileUpload' && (
                          <View style={styles.fileRow}>
                            <TextInput
                              placeholder="Ingresa un URI..."
                              value={item.fileUri ?? ''}
                              onChangeText={(v) => updateChecklistItemValue(item.id, v)}
                              style={styles.fileInput}
                              editable={true}
                            />
                          </View>
                        )}

                        {item.type === 'signUpload' && (
                          <View style={styles.fileRow}>
                            <TextInput
                              placeholder="Ingresa un URI de firma..."
                              value={item.signatureUri ?? ''}
                              onChangeText={(v) => updateChecklistItemValue(item.id, v)}
                              style={styles.fileInput}
                              editable={true}
                            />
                          </View>
                        )}
                      </View>

                      {!isViewMode && (
                        <View style={styles.checklistActions}>
                          <View style={styles.reorderButtons}>
                            <TouchableOpacity 
                              onPress={() => moveChecklistItem(item.id, 'up')} 
                              style={styles.reorderBtn}
                              disabled={checklistItems.indexOf(item) === 0}
                            >
                              <Ionicons 
                                name="chevron-up" 
                                size={16} 
                                color={checklistItems.indexOf(item) === 0 ? '#ccc' : '#5D8AA8'} 
                              />
                            </TouchableOpacity>
                            <TouchableOpacity 
                              onPress={() => moveChecklistItem(item.id, 'down')} 
                              style={styles.reorderBtn}
                              disabled={checklistItems.indexOf(item) === checklistItems.length - 1}
                            >
                              <Ionicons 
                                name="chevron-down" 
                                size={16} 
                                color={checklistItems.indexOf(item) === checklistItems.length - 1 ? '#ccc' : '#5D8AA8'} 
                              />
                            </TouchableOpacity>
                          </View>
                          <TouchableOpacity onPress={() => removeChecklistItem(item.id)} style={styles.removeChecklistBtn}>
                            <Ionicons name="trash-outline" size={18} color="#e74c3c" />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  ))
                )}

                {/* Agregar nuevo item */}
                {!isViewMode && (
                  <>
                    {/* Selector de tipo en su propia fila para mejor visual en móviles */}
                    <View style={styles.typeSelectorRow}>
                      <View style={styles.typeSelector}>
                        {(['checkbox','textInput','numberInput','fileUpload','signUpload'] as CheckListItemTypes[]).map(t => (
                          <TouchableOpacity
                            key={t}
                            onPress={() => setNewChecklistType(t)}
                            style={[styles.typeButton, newChecklistType === t && styles.typeButtonSelected]}
                          >
                            <Text style={{ fontSize: 12, color: newChecklistType === t ? '#fff' : '#5D8AA8' }}>{
                              t === 'checkbox' ? 'CB' : t === 'textInput' ? 'TXT' : t === 'numberInput' ? '# ' : t === 'fileUpload' ? 'FILE' : 'SIGN'
                            }</Text>
                          </TouchableOpacity>
                        ))}
                      </View>

                      {/* Botón de agregar ahora junto a los botones de tipo */}
                      <TouchableOpacity
                        style={[styles.addChecklistBtn, styles.addChecklistBtnInline]}
                        onPress={() => addChecklistItem(newChecklistText, newChecklistType, newChecklistValue)}
                      >
                        <Ionicons name="add" size={20} color="#fff" />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.addChecklistRow}>
                      <TextInput
                        placeholder="Etiqueta de la subtarea"
                        value={newChecklistText}
                        onChangeText={setNewChecklistText}
                        style={styles.addChecklistInput}
                      />

                      {newChecklistType !== 'checkbox' && (
                        <TextInput
                          placeholder={newChecklistType === 'numberInput' ? 'Número' : newChecklistType === 'fileUpload' ? 'URI archivo' : newChecklistType === 'signUpload' ? 'URI firma' : 'Valor'}
                          value={newChecklistValue}
                          onChangeText={setNewChecklistValue}
                          style={styles.addChecklistValueInput}
                          keyboardType={newChecklistType === 'numberInput' ? 'numeric' : 'default'}
                        />
                      )}
                    </View>
                  </>
                )}
              </View>

              {/* Selector de Fecha */}
              <View style={styles.formSection}>
                <Text style={styles.sectionLabel}>Fecha Límite</Text>
                {isViewMode ? (
                  <View style={styles.viewModeDateContainer}>
                    <Ionicons name="calendar" size={20} color="#5D8AA8" />
                    <Text style={styles.viewModeText}>{formatDate(dueDate)}</Text>
                  </View>
                ) : (
                  <>
                    <TouchableOpacity 
                      style={styles.dateButton}
                      onPress={() => setShowDatePicker(true)}
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
                  </>
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

              {/* Selector de Estado de Tarea */}
              <View style={styles.formSection}>
                <Text style={styles.sectionLabel}>Estatus</Text>
                <View style={styles.priorityButtons}>
                  {([TaskStatus.Pending, TaskStatus.Completed] as boolean[]).map((stat) => (
                      <TouchableOpacity
                        key={stat.toString()}
                        style={[
                          styles.priorityButton,
                          status === stat && styles.priorityButtonSelected,
                          stat === TaskStatus.Completed && status === stat && styles.completedButtonSelected,
                        ]}
                        onPress={() => {
                          if (isViewMode && task) {
                            // Optimistically update local state
                            setStatus(stat);

                            // Build minimal payload and persist immediately via onUpdate
                            const payload: Omit<Task, 'uid' | 'createdBy' | 'createdAt'> = {
                              title: title.trim(),
                              description: description.trim(),
                              dueDate,
                              priority,
                              completed: stat,
                              checklistItems,
                              assignedTo: assigneeType,
                              assignedTeamUID: assigneeType === 'team' ? selectedTeamUID : undefined,
                              assignedUserUID: assigneeType === 'user' ? selectedUserUID : undefined,
                            };

                            try {
                              onUpdate?.(task.uid, payload);
                            } catch (e) {
                              console.error('Failed to update status from view mode', e);
                              simpleAlertService.showAlert('Error', 'No se pudo actualizar el estatus en el servidor.');
                            }
                          } else {
                            setStatus(stat);
                          }
                        }}
                      >
                        <Text style={[
                          styles.priorityButtonText,
                          status === stat && styles.priorityButtonTextSelected
                        ]}>
                          {stat ? 'Completado' : 'Pendiente'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                </View>
              </View>

              {/* Selector de Asignación */}
              <AssigneeSelector
                assigneeType={assigneeType}
                onAssigneeTypeChange={setAssigneeType}
                selectedTeamUID={selectedTeamUID}
                onTeamChange={setSelectedTeamUID}
                selectedUserUID={selectedUserUID}
                onUserChange={setSelectedUserUID}
                disabled={isViewMode}
                viewMode={isViewMode}
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
                onPress={handleClose}
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
  completedButtonSelected : {
    backgroundColor: '#88ff98ff',
    borderColor: '#6da971ff',
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
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkToggle: {
    marginRight: 10,
  },
  checklistText: {
    flex: 1,
    fontSize: 15,
    color: '#4A6572',
    fontWeight: '600',
  },
  checklistTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#95a5a6',
  },
  checklistInput: {
    flex: 1,
    backgroundColor: '#f8fdff',
    borderWidth: 1,
    borderColor: '#e6f7ff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#4A6572',
    fontWeight: '600',
  },
  removeChecklistBtn: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addChecklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  addChecklistInput: {
    flex: 1,
    backgroundColor: '#f8fdff',
    borderWidth: 1,
    borderColor: '#e6f7ff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#4A6572',
    marginRight: 8,
  },
  addChecklistBtn: {
    backgroundColor: '#4A6572',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addChecklistValueInput: {
    width: 100,
    backgroundColor: '#f8fdff',
    borderWidth: 1,
    borderColor: '#e6f7ff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: '#4A6572',
    marginRight: 8,
  },
  checklistValueInput: {
    marginTop: 8,
    backgroundColor: '#f8fdff',
    borderWidth: 1,
    borderColor: '#e6f7ff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: '#4A6572',
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  fileInput: {
    flex: 1,
    backgroundColor: '#f8fdff',
    borderWidth: 1,
    borderColor: '#e6f7ff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: '#4A6572',
  },
  typeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    flexWrap: 'wrap',
    flex: 1,
  },
  typeButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e6f7ff',
    backgroundColor: '#f8fdff',
    marginRight: 6,
  },
  typeButtonSelected: {
    backgroundColor: '#4A6572',
    borderColor: '#4A6572',
  },
  typeSelectorRow: {
    marginBottom: 0,
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addChecklistBtnInline: {
    marginLeft: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
  },
  viewModeText: {
    fontSize: 16,
    color: '#4A6572',
    lineHeight: 24,
    marginLeft: 8,
  },
  viewModeDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  checklistActions: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  reorderButtons: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reorderBtn: {
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
  },
});

export default TaskFormModal;