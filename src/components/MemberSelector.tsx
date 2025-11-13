import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import miscService from '../services/misc.service';
import userService from '../services/user.service';
import { User } from '../types/navigation';

type MemberSelectorProps = {
  selectedMemberIds: string[];
  onMembersChange: (memberIds: string[]) => void;
  disabled?: boolean;
  viewMode?: boolean;
};

const MemberSelector: React.FC<MemberSelectorProps> = ({
  selectedMemberIds,
  onMembersChange,
  disabled = false,
  viewMode = false
}) => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const users = await userService.getAllUsers();
      setAllUsers(users);
    };
    fetchData();
  }, []);

  const toggleMember = (memberId: string) => {
    if (disabled) return;
    
    const isSelected = selectedMemberIds.includes(memberId);
    let newSelectedMembers: string[];

    if (isSelected) {
      newSelectedMembers = selectedMemberIds.filter(id => id !== memberId);
    } else {
      newSelectedMembers = [...selectedMemberIds, memberId];
    }
    
    onMembersChange(newSelectedMembers);
  };

  const colors = ['#4A6572', '#344955', '#5D8AA8', '#7F8C8D', '#B2BEC3'];

  // Filtrar usuarios por búsqueda
  const filteredUsers = allUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Modo vista: solo mostrar los miembros seleccionados
  if (viewMode) {
    const selectedUsers = allUsers.filter(u => selectedMemberIds.includes(u.uid));
    
    return (
      <View style={styles.container}>
        <Text style={styles.label}>Miembros del Equipo</Text>
        <View style={styles.viewModeContainer}>
          {selectedUsers.map((user) => (
            <View key={user.uid} style={styles.viewModeMemberCard}>
              <View style={[styles.avatar, { backgroundColor: miscService.getAvatarColor(user.uid, colors) }]}>
                <Text style={styles.avatarText}>
                  {user.name.split(' ').map(n => n[0]).join('')}
                </Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{user.name}</Text>
                <Text style={styles.memberEmail}>{user.email}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  // Modo edición/creación: mostrar lista completa con checkboxes
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Miembros del Equipo</Text>
      <Text style={styles.subLabel}>
        {selectedMemberIds.length < 2 
          ? `Selecciona al menos 2 miembros (${selectedMemberIds.length}/2)`
          : `${selectedMemberIds.length} miembros seleccionados`
        }
      </Text>
      
      {/* Buscador */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#5D8AA8" />
        <TextInput
          style={[styles.searchInput, disabled && styles.inputDisabled]}
          placeholder="Buscar miembros..."
          value={searchQuery}
          onChangeText={text => !disabled && setSearchQuery(text)}
          editable={!disabled}
        />
      </View>
      
      <ScrollView 
        style={styles.membersList} 
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {filteredUsers.map((user) => (
          <TouchableOpacity
            key={user.uid}
            style={[
              styles.memberItem,
              selectedMemberIds.includes(user.uid) && styles.memberItemSelected,
              disabled && styles.memberItemDisabled
            ]}
            onPress={() => toggleMember(user.uid)}
            disabled={disabled}
          >
            <View style={[styles.avatar, { backgroundColor: miscService.getAvatarColor(user.uid, colors) }]}>
              <Text style={styles.avatarText}>
                {user.name.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
            
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{user.name}</Text>
              <Text style={styles.memberEmail}>{user.email}</Text>
              <Text style={styles.memberId}>ID: {user.uid}</Text>
            </View>
            
            <Ionicons 
              name={selectedMemberIds.includes(user.uid) ? "checkbox" : "square-outline"} 
              size={24} 
              color={selectedMemberIds.includes(user.uid) ? '#4A6572' : '#B2BEC3'} 
            />
          </TouchableOpacity>
        ))}
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
    marginBottom: 4,
  },
  subLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 12,
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
  inputDisabled: {
    opacity: 0.6,
  },
  membersList: {
    maxHeight: 200,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fdff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e6f7ff',
  },
  memberItemSelected: {
    backgroundColor: '#e6f7ff',
    borderColor: '#5D8AA8',
  },
  memberItemDisabled: {
    opacity: 0.6,
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
    fontSize: 14,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A6572',
    marginBottom: 2,
  },
  memberEmail: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 2,
  },
  memberId: {
    fontSize: 10,
    color: '#B2BEC3',
    fontStyle: 'italic',
  },
  viewModeContainer: {
    gap: 10,
  },
  viewModeMemberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fdff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e6f7ff',
  },
});

export default MemberSelector;