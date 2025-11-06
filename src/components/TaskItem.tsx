import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PriorityBadge from './PriorityBadge';
import { Task, Team, User } from '../types/navigation';

type Props = {
  task: Task;
  users?: User[];
  teams?: Team[];
};


export default function TaskItem({ task, users = [], teams = [] }: Props) {
  const isTeamTask = task.assignedTo === 'team';
  const assignedName = isTeamTask
    ? (() => {
        const team = teams.find(t => t.uid === task.assignedTeamUID);
        return team ? team.name : 'No asignado';
      })()
    : (() => {
        const user = users.find(u => u.uid === task.assignedUserUID);
        return user ? user.name : 'No asignado';
      })();


  return (
    <View style={styles.card}>
      <Text style={styles.title}>{task.title}</Text>
      
      {/* Row with priority badge and assigned name */}
      <View style={styles.footer}>
        <PriorityBadge priority={task.priority} />
        <Text style={
          [styles.assignedTo, 
          { color: isTeamTask ? '#3d6fb1ff' : '#5D8AA8', 
            fontWeight: isTeamTask ? '700' : '500' 
          }]}>
          {assignedName}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  title: { 
    fontSize: 16, 
    fontWeight: '600',
    marginBottom: 12,
    color: '#2C3E50',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  assignedTo: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
});
