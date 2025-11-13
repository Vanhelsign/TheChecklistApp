import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import userService from '../../services/user.service';
import { Team, User } from '../../types/navigation';
import miscService from '../../services/misc.service';
import teamService from '../../services/team.service';

type AssigneeType = 'team' | 'user';

type AssigneeSelectorProps = {
  assigneeType: AssigneeType;
  onAssigneeTypeChange: (type: AssigneeType) => void;
  selectedTeamUID?: string;
  onTeamChange: (teamId?: string) => void;
  selectedUserUID?: string;
  onUserChange: (userId?: string) => void;
  disabled?: boolean;
  viewMode?: boolean;
};

const AssigneeSelector: React.FC<AssigneeSelectorProps> = ({
  assigneeType,
  onAssigneeTypeChange,
  selectedTeamUID,
  onTeamChange,
  selectedUserUID,
  onUserChange,
  disabled = false,
  viewMode = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setLoading(true);

    // Suscribirse a usuarios en tiempo real
    const unsubscribeUsers = userService.subscribeToUsers(
      (fetchedUsers) => {
        setUsers(fetchedUsers);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading users:', error);
        setLoading(false);
      }
    );

    // Suscribirse a equipos en tiempo real
    const unsubscribeTeams = teamService.subscribeToTeams(
      (fetchedTeams) => {
        setTeams(fetchedTeams);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading teams:', error);
        setLoading(false);
      }
    );

    // Cleanup: cancelar ambas suscripciones
    return () => {
      unsubscribeUsers();
      unsubscribeTeams();
    };
  }, []);

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const colors = ['#4A6572', '#344955', '#5D8AA8', '#7F8C8D', '#B2BEC3'];

  // Si está en modo vista, solo mostrar quien está asignado
  if (viewMode) {
    const assignedTeam = assigneeType === 'team' && selectedTeamUID 
      ? teams.find(t => t.uid === selectedTeamUID)
      : null;
    
    const assignedUser = assigneeType === 'user' && selectedUserUID
      ? users.find(u => u.uid === selectedUserUID)
      : null;

    return (
      <View style={styles.container}>
        <Text style={styles.label}>Asignado a</Text>
        
        {assigneeType === 'team' && assignedTeam ? (
          <View style={styles.viewModeCard}>
            <View style={[styles.avatar, { backgroundColor: miscService.getAvatarColor(assignedTeam.uid, colors) }]}>
              <Ionicons name="people" size={16} color="#FFFFFF" />
            </View>
            <View style={styles.resultInfo}>
              <Text style={styles.resultName}>{assignedTeam.name}</Text>
              <Text style={styles.resultDescription}>{assignedTeam.description}</Text>
              <Text style={styles.resultMeta}>
                {assignedTeam.memberUIDs.length} miembros
              </Text>
            </View>
          </View>
        ) : assigneeType === 'user' && assignedUser ? (
          <View style={styles.viewModeCard}>
            <View style={[styles.avatar, { backgroundColor: miscService.getAvatarColor(assignedUser.uid, colors) }]}>
              <Text style={styles.avatarText}>
                {miscService.getInitials(assignedUser.name)}
              </Text>
            </View>
            <View style={styles.resultInfo}>
              <Text style={styles.resultName}>{assignedUser.name}</Text>
              <Text style={styles.resultDescription}>{assignedUser.email}</Text>
              <Text style={styles.resultMeta}>
                {assignedUser.role === 'manager' ? 'Manager' : 'Trabajador'}
              </Text>
            </View>
          </View>
        ) : (
          <Text style={styles.noAssigneeText}>Sin asignar</Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Asignar a *</Text>
      
      {/* Selector de tipo */}
      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            assigneeType === 'team' && styles.typeButtonSelected,
            disabled && styles.disabled,
          ]}
          onPress={() => !disabled && onAssigneeTypeChange('team')}
          activeOpacity={disabled ? 1 : 0.7}
        >
          <Ionicons 
            name="people" 
            size={20} 
            color={assigneeType === 'team' ? '#FFFFFF' : '#5D8AA8'} 
          />
          <Text style={[
            styles.typeButtonText,
            assigneeType === 'team' && styles.typeButtonTextSelected
          ]}>
            Equipo
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.typeButton,
            assigneeType === 'user' && styles.typeButtonSelected,
            disabled && styles.disabled,
          ]}
          onPress={() => !disabled && onAssigneeTypeChange('user')}
          activeOpacity={disabled ? 1 : 0.7}
        >
          <Ionicons 
            name="person" 
            size={20} 
            color={assigneeType === 'user' ? '#FFFFFF' : '#5D8AA8'} 
          />
          <Text style={[
            styles.typeButtonText,
            assigneeType === 'user' && styles.typeButtonTextSelected
          ]}>
            Persona
          </Text>
        </TouchableOpacity>
      </View>

      {/* Buscador */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#5D8AA8" />
        <TextInput
          style={[styles.searchInput, disabled && styles.disabled]}
          placeholder={`Buscar ${assigneeType === 'team' ? 'equipos' : 'personas'}...`}
          value={searchQuery}
          onChangeText={text => !disabled && setSearchQuery(text)}
          editable={!disabled}
        />
      </View>

      {/* Lista de resultados */}
      <ScrollView style={styles.resultsList} showsVerticalScrollIndicator={false}>
        {assigneeType === 'team' ? (
          filteredTeams.map(team => (
            <TouchableOpacity
              key={team.uid}
              style={[
                styles.resultItem,
                selectedTeamUID === team.uid && styles.resultItemSelected,
                disabled && styles.disabled,
              ]}
              onPress={() => !disabled && onTeamChange(team.uid)}
              activeOpacity={disabled ? 1 : 0.7}
            >
              <View style={[styles.avatar, { backgroundColor: miscService.getAvatarColor(team.uid, colors) }]}>
                <Ionicons name="people" size={16} color="#FFFFFF" />
              </View>
              <View style={styles.resultInfo}>
                <Text style={styles.resultName}>{team.name}</Text>
                <Text style={styles.resultDescription}>{team.description}</Text>
                <Text style={styles.resultMeta}>
                  {team.memberUIDs.length} miembros
                </Text>
              </View>
              <Ionicons 
                name={selectedTeamUID === team.uid ? "radio-button-on" : "radio-button-off"} 
                size={20} 
                color={selectedTeamUID === team.uid ? '#4A6572' : '#B2BEC3'} 
              />
            </TouchableOpacity>
          ))
        ) : (
          filteredUsers.map(user => (
            <TouchableOpacity
              key={user.uid}
              style={[
                styles.resultItem,
                selectedUserUID === user.uid && styles.resultItemSelected,
                disabled && styles.disabled,
              ]}
              onPress={() => !disabled && onUserChange(user.uid)}
              activeOpacity={disabled ? 1 : 0.7}
            >
              <View style={[styles.avatar, { backgroundColor: miscService.getAvatarColor(user.uid, colors) }]}>
                <Text style={styles.avatarText}>
                  {miscService.getInitials(user.name)}
                </Text>
              </View>
              <View style={styles.resultInfo}>
                <Text style={styles.resultName}>{user.name}</Text>
                <Text style={styles.resultDescription}>{user.email}</Text>
                <Text style={styles.resultMeta}>
                  {user.role === 'manager' ? 'Manager' : 'Trabajador'}
                </Text>
              </View>
              <Ionicons 
                name={selectedUserUID === user.uid ? "radio-button-on" : "radio-button-off"} 
                size={20} 
                color={selectedUserUID === user.uid ? '#4A6572' : '#B2BEC3'} 
              />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A6572',
    marginBottom: 12,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f8fdff',
    borderWidth: 1,
    borderColor: '#e6f7ff',
    marginHorizontal: 4,
  },
  typeButtonSelected: {
    backgroundColor: '#4A6572',
    borderColor: '#4A6572',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5D8AA8',
    marginLeft: 6,
  },
  typeButtonTextSelected: {
    color: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fdff',
    borderWidth: 1,
    borderColor: '#e6f7ff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#4A6572',
    marginLeft: 8,
    padding: 0,
  },
  resultsList: {
    maxHeight: 200,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fdff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e6f7ff',
  },
  resultItemSelected: {
    backgroundColor: '#e6f7ff',
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
    fontWeight: 'bold',
    fontSize: 12,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A6572',
    marginBottom: 2,
  },
  resultDescription: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 2,
  },
  resultMeta: {
    fontSize: 10,
    color: '#B2BEC3',
    fontStyle: 'italic',
  },
  disabled: {
    opacity: 0.5,
  },
  viewModeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fdff',
    borderWidth: 1,
    borderColor: '#e6f7ff',
    borderRadius: 12,
    padding: 12,
  },
  noAssigneeText: {
    fontSize: 16,
    color: '#7F8C8D',
    fontStyle: 'italic',
  },
});

export default AssigneeSelector;