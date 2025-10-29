import React from 'react';
import { Text, StyleSheet } from 'react-native';

type Props = { priority: 'alta' | 'media' | 'baja' };

export default function PriorityBadge({ priority }: Props) {
  const color =
    priority === 'alta' ? '#e74c3c' :
    priority === 'media' ? '#f1c40f' :
    '#2ecc71';

  return <Text style={[styles.badge, { backgroundColor: color }]}>{priority.toUpperCase()}</Text>;
}

const styles = StyleSheet.create({
  badge: {
    color: 'white',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    textTransform: 'uppercase',
  },
});
