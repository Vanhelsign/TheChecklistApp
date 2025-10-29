import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PriorityBadge from './PriorityBadge';
import { Task } from '../types/navigation';

type Props = {
  task: Task;
};

export default function TaskItem({ task }: { task: Task }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{task.title}</Text>
      <PriorityBadge priority={task.priority} />
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
  },
  title: { fontSize: 16, fontWeight: '500' },
});
