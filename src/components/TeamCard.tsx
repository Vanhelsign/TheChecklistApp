import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Team, TeamModalMode, User } from '../types/navigation';
import { mockUsers } from '../data/users';

type TeamCardProps = {
  team: Team;
  onEdit: (team: Team) => void;
  onView: (team: Team) => void;
  onDelete: (team: Team) => void;
  isOwner: boolean;
};

const TeamCard: React.FC<TeamCardProps> = ({ team, onEdit, onView, onDelete, isOwner }) => {
  const teamMembers = mockUsers.filter(user => team.memberIds.includes(user.id));
  const manager = mockUsers.find(user => user.id === team.managerId);

  const getAvatarColor = (userId: number) => {
    const colors = ['#4A6572', '#344955', '#5D8AA8', '#7F8C8D', '#B2BEC3'];
    return colors[userId % colors.length];
  };

  return (
    <View style={styles.card}>
      {/* Header de la tarjeta */}
      <View style={styles.cardHeader}>
        <View style={styles.teamInfo}>
          <Text style={styles.teamName}>{team.name}</Text>
          <Text style={styles.teamDescription}>{team.description}</Text>
          <Text style={styles.teamMeta}>
            Creado por: {manager?.name} • {teamMembers.length} miembros
          </Text>
        </View>
        
        {/* Botones de acción */}
        {isOwner && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => onEdit(team)}
            >
              <Ionicons name="create-outline" size={20} color="#5D8AA8" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => onDelete(team)}
            >
              <Ionicons name="trash-outline" size={20} color="#e74c3c" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Lista de miembros */}
      <View style={styles.membersSection}>
        <Text style={styles.membersLabel}>Miembros:</Text>
        <View style={styles.membersList}>
          {teamMembers.map((member) => (
            <View key={member.id} style={styles.memberBadge}>
              <View style={[styles.smallAvatar, { backgroundColor: getAvatarColor(member.id) }]}>
                <Text style={styles.smallAvatarText}>
                  {member.name.split(' ').map(n => n[0]).join('')}
                </Text>
              </View>
              <Text style={styles.memberName}>{member.name}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Footer con fecha y botón ver */}
      <View style={styles.cardFooter}>
        <Text style={styles.createdDate}>
          Creado: {team.createdAt.toLocaleDateString('es-ES')}
        </Text>
        <TouchableOpacity 
          style={styles.viewButton}
          onPress={() => onView(team)}
        >
          <Text style={styles.viewButtonText}>Ver Detalles</Text>
          <Ionicons name="chevron-forward" size={16} color="#4A6572" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#5D8AA8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#f0f8ff',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  teamInfo: {
    flex: 1,
    marginRight: 12,
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A6572',
    marginBottom: 4,
  },
  teamDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 4,
    lineHeight: 18,
  },
  teamMeta: {
    fontSize: 12,
    color: '#B2BEC3',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 6,
    marginLeft: 8,
  },
  membersSection: {
    marginBottom: 12,
  },
  membersLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A6572',
    marginBottom: 8,
  },
  membersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fdff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#e6f7ff',
  },
  smallAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  smallAvatarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 8,
  },
  memberName: {
    fontSize: 12,
    color: '#5D8AA8',
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f8ff',
    paddingTop: 12,
  },
  createdDate: {
    fontSize: 12,
    color: '#B2BEC3',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewButtonText: {
    fontSize: 14,
    color: '#4A6572',
    fontWeight: '500',
    marginRight: 4,
  },
});

export default TeamCard;