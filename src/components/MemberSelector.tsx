import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import miscService from '../services/misc.service';
import userService from '../services/user.service';
import { User } from '../types/navigation';

type MemberSelectorProps = {
  selectedMemberIds: string[];
  onMembersChange: (memberIds: string[]) => void;
  disabled?: boolean;
};

const MemberSelector: React.FC<MemberSelectorProps> = ({
  selectedMemberIds,
  onMembersChange,
  disabled = false
}) => {
  const [workers, setWorkers] = React.useState<User[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const fetchedWorkers = await userService.getUsersByRole('worker');
      setWorkers(fetchedWorkers);
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

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Miembros del Equipo</Text>
      <Text style={styles.subLabel}>
        {selectedMemberIds.length < 2 
          ? `Selecciona al menos 2 miembros (${selectedMemberIds.length}/2)`
          : `${selectedMemberIds.length} miembros seleccionados`
        }
      </Text>
      
      <ScrollView style={styles.membersList} showsVerticalScrollIndicator={false}>
        {workers.map((worker) => (
          <TouchableOpacity
            key={worker.uid}
            style={[
              styles.memberItem,
              selectedMemberIds.includes(worker.uid) && styles.memberItemSelected,
              disabled && styles.memberItemDisabled
            ]}
            onPress={() => toggleMember(worker.uid)}
            disabled={disabled}
          >
            <View style={[styles.avatar, { backgroundColor: miscService.getAvatarColor(worker.uid, colors) }]}>
              <Text style={styles.avatarText}>
                {worker.name.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
            
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{worker.name}</Text>
              <Text style={styles.memberEmail}>{worker.email}</Text>
              <Text style={styles.memberId}>ID: {worker.uid}</Text>
            </View>
            
            <Ionicons 
              name={selectedMemberIds.includes(worker.uid) ? "checkbox" : "square-outline"} 
              size={24} 
              color={selectedMemberIds.includes(worker.uid) ? '#4A6572' : '#B2BEC3'} 
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
});

export default MemberSelector;