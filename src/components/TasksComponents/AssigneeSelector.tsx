import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { mockUsers } from '../../data/users';
import { mockTeams } from '../../data/teams';

type AssigneeType = 'team' | 'user';

type AssigneeSelectorProps = {
  assigneeType: AssigneeType;
  onAssigneeTypeChange: (type: AssigneeType) => void;
  selectedTeamId?: number;
  onTeamChange: (teamId?: number) => void;
  selectedUserId?: number;
  onUserChange: (userId?: number) => void;
};

const AssigneeSelector: React.FC<AssigneeSelectorProps> = ({
  assigneeType,
  onAssigneeTypeChange,
  selectedTeamId,
  onTeamChange,
  selectedUserId,
  onUserChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrar equipos y usuarios basado en la búsqueda
  const filteredTeams = mockTeams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAvatarColor = (id: number) => {
    const colors = ['#4A6572', '#344955', '#5D8AA8', '#7F8C8D', '#B2BEC3'];
    return colors[id % colors.length];
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Asignar a *</Text>
      
      {/* Selector de tipo */}
      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            assigneeType === 'team' && styles.typeButtonSelected
          ]}
          onPress={() => onAssigneeTypeChange('team')}
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
            assigneeType === 'user' && styles.typeButtonSelected
          ]}
          onPress={() => onAssigneeTypeChange('user')}
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
          style={styles.searchInput}
          placeholder={`Buscar ${assigneeType === 'team' ? 'equipos' : 'personas'}...`}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Lista de resultados */}
      <ScrollView style={styles.resultsList} showsVerticalScrollIndicator={false}>
        {assigneeType === 'team' ? (
          filteredTeams.map(team => (
            <TouchableOpacity
              key={team.id}
              style={[
                styles.resultItem,
                selectedTeamId === team.id && styles.resultItemSelected
              ]}
              onPress={() => onTeamChange(team.id)}
            >
              <View style={[styles.avatar, { backgroundColor: getAvatarColor(team.id) }]}>
                <Ionicons name="people" size={16} color="#FFFFFF" />
              </View>
              <View style={styles.resultInfo}>
                <Text style={styles.resultName}>{team.name}</Text>
                <Text style={styles.resultDescription}>{team.description}</Text>
                <Text style={styles.resultMeta}>
                  {team.memberIds.length} miembros
                </Text>
              </View>
              <Ionicons 
                name={selectedTeamId === team.id ? "radio-button-on" : "radio-button-off"} 
                size={20} 
                color={selectedTeamId === team.id ? '#4A6572' : '#B2BEC3'} 
              />
            </TouchableOpacity>
          ))
        ) : (
          filteredUsers.map(user => (
            <TouchableOpacity
              key={user.id}
              style={[
                styles.resultItem,
                selectedUserId === user.id && styles.resultItemSelected
              ]}
              onPress={() => onUserChange(user.id)}
            >
              <View style={[styles.avatar, { backgroundColor: getAvatarColor(user.id) }]}>
                <Text style={styles.avatarText}>
                  {user.name.split(' ').map(n => n[0]).join('')}
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
                name={selectedUserId === user.id ? "radio-button-on" : "radio-button-off"} 
                size={20} 
                color={selectedUserId === user.id ? '#4A6572' : '#B2BEC3'} 
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
});

export default AssigneeSelector;