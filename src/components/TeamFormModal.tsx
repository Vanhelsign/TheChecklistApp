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
import { Team, TeamModalMode } from '../types/navigation';
import MemberSelector from './MemberSelector';

type TeamFormModalProps = {
  visible: boolean;
  mode: TeamModalMode;
  team?: Team;
  currentUserUID: string;
  onSave: (teamData: Omit<Team, 'uid' | 'createdAt'>) => void;
  onUpdate: (teamId: string, teamData: Omit<Team, 'uid' | 'managerUID' | 'createdAt'>) => void;
  onClose: () => void;
  onDelete?: (teamId: string) => void;
};

const TeamFormModal: React.FC<TeamFormModalProps> = ({
  visible,
  mode,
  team,
  currentUserUID,
  onSave,
  onUpdate,
  onClose,
  onDelete,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ name?: string; members?: string }>({});

  // Reset form cuando se abre/cierra el modal o cambia el equipo
  useEffect(() => {
    if (visible) {
      if (mode === 'edit' || mode === 'view') {
        setName(team?.name || '');
        setDescription(team?.description || '');
        setSelectedMemberIds(team?.memberUIDs || []);
      } else {
        // Modo create - reset form
        setName('');
        setDescription('');
        setSelectedMemberIds([]);
      }
      setErrors({});
    }
  }, [visible, mode, team]);

  const validateForm = (): boolean => {
    const newErrors: { name?: string; members?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'El nombre del equipo es obligatorio';
    }

    if (selectedMemberIds.length < 2) {
      newErrors.members = 'Selecciona al menos 2 miembros';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const teamData = {
      name: name.trim(),
      description: description.trim(),
      managerUID: currentUserUID,
      memberUIDs: selectedMemberIds,
    };

    if (mode === 'create') {
      onSave(teamData);
    } else if (mode === 'edit' && team) {
      onUpdate(team.uid, teamData);
    }

    onClose();
  };

  const handleDelete = () => {
    if (!team) return;

    Alert.alert(
      'Eliminar Equipo',
      `¿Estás seguro de que quieres eliminar el equipo "${team.name}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: () => {
            onDelete?.(team.uid);
            onClose();
          }
        },
      ]
    );
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
                {isCreateMode && 'Crear Nuevo Equipo'}
                {mode === 'edit' && 'Editar Equipo'}
                {isViewMode && 'Detalles del Equipo'}
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#4A6572" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {/* Campo Nombre */}
              <View style={styles.formSection}>
                <Text style={styles.sectionLabel}>Nombre del Equipo *</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    errors.name && styles.inputError,
                    isViewMode && styles.inputDisabled
                  ]}
                  placeholder="Ingresa el nombre del equipo"
                  value={name}
                  onChangeText={setName}
                  editable={!isViewMode}
                />
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>

              {/* Campo Descripción */}
              <View style={styles.formSection}>
                <Text style={styles.sectionLabel}>Descripción</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    styles.textArea,
                    isViewMode && styles.inputDisabled
                  ]}
                  placeholder="Describe el propósito del equipo"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  editable={!isViewMode}
                />
              </View>

              {/* Selector de Miembros */}
              <MemberSelector
                selectedMemberIds={selectedMemberIds}
                onMembersChange={setSelectedMemberIds}
                disabled={isViewMode}
              />
              {errors.members && <Text style={styles.errorText}>{errors.members}</Text>}
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
                    {isCreateMode ? 'Crear Equipo' : 'Guardar'}
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
    maxHeight: '80%',
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
    paddingHorizontal: 20,
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
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    color: '#7F8C8D',
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
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 6,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8fdff',
    borderWidth: 1,
    borderColor: '#e6f7ff',
  },
  saveButton: {
    backgroundColor: '#4A6572',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    flex: 0.8,
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
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 6,
  },
});

export default TeamFormModal;