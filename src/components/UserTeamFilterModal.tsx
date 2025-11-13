import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { User, Team } from '../types/navigation';
import userService from '../services/user.service';
import teamService from '../services/team.service';
import miscService from '../services/misc.service';

type FilterType = 'user' | 'team' | null;

type UserTeamFilterModalProps = {
  visible: boolean;
  onClose: () => void;
  onApplyFilter: (type: FilterType, id: string | null) => void;
  currentFilterType: FilterType;
  currentFilterId: string | null;
};

const UserTeamFilterModal: React.FC<UserTeamFilterModalProps> = ({
  visible,
  onClose,
  onApplyFilter,
  currentFilterType,
  currentFilterId,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<FilterType>(currentFilterType);
  const [selectedId, setSelectedId] = useState<string | null>(currentFilterId);
  const [viewMode, setViewMode] = useState<'user' | 'team'>('user'); // Toggle entre usuarios y equipos

  useEffect(() => {
    const unsubscribeUsers = userService.subscribeToUsers(
      (fetchedUsers) => setUsers(fetchedUsers),
      (error) => console.error("Error en suscripción de usuarios:", error)
    );

    const unsubscribeTeams = teamService.subscribeToTeams(
      (fetchedTeams) => setTeams(fetchedTeams),
      (error) => console.error("Error en suscripción de equipos:", error)
    );

    return () => {
      unsubscribeUsers();
      unsubscribeTeams();
    };
  }, []);

  // Resetear selección al abrir el modal con los valores actuales
  useEffect(() => {
    if (visible) {
      setSelectedType(currentFilterType);
      setSelectedId(currentFilterId);
      setSearchQuery('');
      // Establecer el modo de vista según el tipo de filtro actual
      if (currentFilterType === 'user') {
        setViewMode('user');
      } else if (currentFilterType === 'team') {
        setViewMode('team');
      }
    }
  }, [visible, currentFilterType, currentFilterId]);

  const handleSelectUser = (userId: string) => {
    if (selectedType === 'user' && selectedId === userId) {
      // Deseleccionar si ya está seleccionado
      setSelectedType(null);
      setSelectedId(null);
    } else {
      setSelectedType('user');
      setSelectedId(userId);
    }
  };

  const handleSelectTeam = (teamId: string) => {
    if (selectedType === 'team' && selectedId === teamId) {
      // Deseleccionar si ya está seleccionado
      setSelectedType(null);
      setSelectedId(null);
    } else {
      setSelectedType('team');
      setSelectedId(teamId);
    }
  };

  const handleApply = () => {
    onApplyFilter(selectedType, selectedId);
    onClose();
  };

  const handleClear = () => {
    setSelectedType(null);
    setSelectedId(null);
    onApplyFilter(null, null);
    onClose();
  };

  const colors = ['#4A6572', '#344955', '#5D8AA8', '#7F8C8D', '#B2BEC3'];

  // Filtrar usuarios y equipos por búsqueda
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (team.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Filtrar Tareas</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#4A6572" />
            </TouchableOpacity>
          </View>

          {/* Buscador */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#5D8AA8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar usuarios o equipos..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#B2BEC3"
            />
          </View>

          {/* Toggle entre Usuarios y Equipos */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, viewMode === 'user' && styles.toggleButtonActive]}
              onPress={() => setViewMode('user')}
            >
              <Ionicons 
                name="person" 
                size={18} 
                color={viewMode === 'user' ? '#FFFFFF' : '#5D8AA8'} 
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.toggleButtonText, viewMode === 'user' && styles.toggleButtonTextActive]}>
                Personas
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, viewMode === 'team' && styles.toggleButtonActive]}
              onPress={() => setViewMode('team')}
            >
              <Ionicons 
                name="people" 
                size={18} 
                color={viewMode === 'team' ? '#FFFFFF' : '#5D8AA8'} 
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.toggleButtonText, viewMode === 'team' && styles.toggleButtonTextActive]}>
                Equipos
              </Text>
            </TouchableOpacity>
          </View>

          {/* Contenido scrollable */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {viewMode === 'user' ? (
              /* Sección de Usuarios */
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Usuarios</Text>
                {filteredUsers.map((user) => (
                  <TouchableOpacity
                    key={user.uid}
                    style={[
                      styles.item,
                      selectedType === 'user' && selectedId === user.uid && styles.itemSelected,
                    ]}
                    onPress={() => handleSelectUser(user.uid)}
                  >
                    <View style={[styles.avatar, { backgroundColor: miscService.getAvatarColor(user.uid, colors) }]}>
                      <Text style={styles.avatarText}>
                        {miscService.getInitials(user.name)}
                      </Text>
                    </View>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{user.name}</Text>
                      <Text style={styles.itemDetail}>{user.email}</Text>
                    </View>
                    <Ionicons
                      name={selectedType === 'user' && selectedId === user.uid ? "radio-button-on" : "radio-button-off"}
                      size={24}
                      color={selectedType === 'user' && selectedId === user.uid ? '#5D8AA8' : '#B2BEC3'}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              /* Sección de Equipos */
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Equipos</Text>
                {filteredTeams.map((team) => (
                  <TouchableOpacity
                    key={team.uid}
                    style={[
                      styles.item,
                      selectedType === 'team' && selectedId === team.uid && styles.itemSelected,
                    ]}
                    onPress={() => handleSelectTeam(team.uid)}
                  >
                    <View style={[styles.teamIcon]}>
                      <Ionicons name="people" size={24} color="#5D8AA8" />
                    </View>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{team.name}</Text>
                      <Text style={styles.itemDetail}>
                        {team.memberUIDs.length} {team.memberUIDs.length === 1 ? 'miembro' : 'miembros'}
                      </Text>
                    </View>
                    <Ionicons
                      name={selectedType === 'team' && selectedId === team.uid ? "radio-button-on" : "radio-button-off"}
                      size={24}
                      color={selectedType === 'team' && selectedId === team.uid ? '#5D8AA8' : '#B2BEC3'}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Botones de acción */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
              <Text style={styles.clearButtonText}>Limpiar Selección</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Seleccionar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EEF1',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A6572',
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    margin: 20,
    marginBottom: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8EEF1',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#4A6572',
    marginLeft: 10,
    padding: 0,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  toggleButtonActive: {
    backgroundColor: '#5D8AA8',
  },
  toggleButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#5D8AA8',
  },
  toggleButtonTextActive: {
    color: '#FFFFFF',
  },
  content: {
    maxHeight: 400,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7F8C8D',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  itemSelected: {
    backgroundColor: '#E6F7FF',
    borderColor: '#5D8AA8',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  teamIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E6F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A6572',
    marginBottom: 2,
  },
  itemDetail: {
    fontSize: 13,
    color: '#7F8C8D',
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8EEF1',
  },
  clearButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E8EEF1',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#5D8AA8',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default UserTeamFilterModal;
