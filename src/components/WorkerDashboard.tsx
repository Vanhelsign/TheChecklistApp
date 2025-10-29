import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const WorkerDashboard = () => {
  return (
    <>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionNumber}>Mis Tareas</Text>
        </View>
        <View style={styles.sectionContent}>
          <Text style={styles.placeholderText}>
            Revisa y gestiona tus tareas asignadas
          </Text>
          <Text style={styles.comingSoonText}>
            Próximamente...
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionNumber}>Mi Progreso</Text>
        </View>
        <View style={styles.sectionContent}>
          <Text style={styles.placeholderText}>
            Visualiza tu progreso semanal y métricas personales
          </Text>
          <Text style={styles.comingSoonText}>
            Próximamente...
          </Text>
        </View>
      </View>
    </>
  );
};

// Reutiliza los mismos estilos o personalízalos
const styles = StyleSheet.create({
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginVertical: 10,
    shadowColor: '#5D8AA8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#f0f8ff',
    minHeight: 150,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f8ff',
    backgroundColor: '#f8fdff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  sectionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A6572',
  },
  sectionContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '500',
  },
  comingSoonText: {
    fontSize: 12,
    color: '#B2BEC3',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default WorkerDashboard;