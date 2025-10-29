import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  FlatList,
  Animated,
  Alert
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Team, TeamModalMode } from '../types/navigation';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

// Componentes
import SideNavbar from '../components/SideNavbar';
import MenuButton from '../components/MenuButton';
import TeamCard from '../components/TeamCard';
import TeamFormModal from '../components/TeamFormModal';

// Datos
import { mockTeams } from '../data/teams';
import { mockUsers } from '../data/users';

type Props = NativeStackScreenProps<RootStackParamList, 'Teams'>;

export default function TeamsScreen({ route, navigation }: Props) {
  const { userType, userId, userName, userTeamIds } = route.params;

  // Estados para la navbar
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [activeScreen, setActiveScreen] = useState('Teams');
  const slideAnim = useState(new Animated.Value(-280))[0];

  // Estados para equipos
  const [teams, setTeams] = useState<Team[]>(mockTeams);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<TeamModalMode>('create');
  const [selectedTeam, setSelectedTeam] = useState<Team | undefined>(undefined);

  // Filtrar equipos del manager actual
  const managerTeams = teams.filter(team => team.managerId === userId);

  // Funciones de navegación
  const toggleNav = () => {
    if (isNavOpen) {
      Animated.timing(slideAnim, {
        toValue: -280,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
    setIsNavOpen(!isNavOpen);
  };

  const navigateTo = (screenName: keyof RootStackParamList) => {
    setActiveScreen(screenName);
    
    if (screenName === 'Teams') {
      toggleNav();
      return;
    }

    const userParams = {
      userType: userType,
      userId: userId,
      userName: userName,
      userTeamIds: userTeamIds
    };

    switch (screenName) {
      case 'Home':
        navigation.navigate('Home', userParams);
        break;
      case 'Tasks':
        navigation.navigate('Tasks', userParams);
        break;
      case 'PendingTasks':
        navigation.navigate('PendingTasks', userParams);
        break;
      case 'CompletedTasks':
        navigation.navigate('CompletedTasks', userParams);
        break;
      case 'Login':
        navigation.navigate('Login');
        break;
      default:
        navigation.navigate(screenName as any);
        break;
    }
    
    toggleNav();
  };

  const handleLogout = () => {
    navigation.replace('Login');
  };

  const getRoleColor = () => {
    return userType === 'manager' ? '#4A6572' : '#344955';
  };

  // Funciones para equipos
  const handleCreateTeam = () => {
    setModalMode('create');
    setSelectedTeam(undefined);
    setModalVisible(true);
  };

  const handleEditTeam = (team: Team) => {
    setModalMode('edit');
    setSelectedTeam(team);
    setModalVisible(true);
  };

  const handleViewTeam = (team: Team) => {
    setModalMode('view');
    setSelectedTeam(team);
    setModalVisible(true);
  };

  const handleDeleteTeam = (team: Team) => {
    Alert.alert(
      'Eliminar Equipo',
      `¿Estás seguro de que quieres eliminar el equipo "${team.name}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: () => {
            setTeams(prevTeams => prevTeams.filter(t => t.id !== team.id));
          }
        },
      ]
    );
  };

  const handleSaveTeam = (teamData: Omit<Team, 'id' | 'createdAt'>) => {
    const newTeam: Team = {
      ...teamData,
      id: Math.max(...teams.map(t => t.id), 0) + 1, // Generar nuevo ID
      createdAt: new Date(),
    };
    setTeams(prevTeams => [...prevTeams, newTeam]);
  };

  const handleUpdateTeam = (teamId: number, teamData: Omit<Team, 'id' | 'managerId' | 'createdAt'>) => {
    setTeams(prevTeams => 
      prevTeams.map(team => 
        team.id === teamId 
          ? { ...team, ...teamData }
          : team
      )
    );
  };

  const handleDeleteTeamFromModal = (teamId: number) => {
    setTeams(prevTeams => prevTeams.filter(t => t.id !== teamId));
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedTeam(undefined);
  };

  // Si el usuario no es manager, mostrar mensaje
  if (userType !== 'manager') {
    return (
      <SafeAreaView style={styles.fullScreen}>
        <LinearGradient 
          colors={['#ffffff', '#e6f7ff', '#d6f0ff']} 
          style={styles.fullScreen}
        >
          <StatusBar style="auto" />
          <View style={styles.accessDenied}>
            <Ionicons name="lock-closed" size={64} color="#5D8AA8" />
            <Text style={styles.accessDeniedText}>Acceso Restringido</Text>
            <Text style={styles.accessDeniedSubtext}>
              Solo los managers pueden acceder a la gestión de equipos
            </Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.fullScreen}>
      <LinearGradient 
        colors={['#ffffff', '#e6f7ff', '#d6f0ff']} 
        style={styles.fullScreen}
      >
        <StatusBar style="auto" />
        
        {/* Botón del menú */}
        <MenuButton onPress={toggleNav} color={getRoleColor()} />

        {/* Barra de Navegación Lateral */}
        <SideNavbar
          isOpen={isNavOpen}
          onClose={toggleNav}
          activeScreen={activeScreen}
          onNavigate={navigateTo}
          onLogout={handleLogout}
          userType={userType}
          userName={userName}
          slideAnim={slideAnim}
        />

        {/* Overlay para cerrar nav */}
        {isNavOpen && (
          <TouchableOpacity 
            style={styles.overlay}
            onPress={toggleNav}
            activeOpacity={1}
          />
        )}

        {/* Contenido Principal */}
        <View style={styles.mainContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: getRoleColor() }]}>
              Gestión de Equipos
            </Text>
            <Text style={styles.subtitle}>
              {managerTeams.length === 0 
                ? 'Crea tu primer equipo' 
                : `Tienes ${managerTeams.length} equipo${managerTeams.length !== 1 ? 's' : ''}`
              }
            </Text>
          </View>

          {/* Botón Crear Equipo */}
          <TouchableOpacity 
            style={styles.createButton}
            onPress={handleCreateTeam}
          >
            <Ionicons name="people" size={24} color="#fff" />
            <Text style={styles.createButtonText}>Crear Nuevo Equipo</Text>
          </TouchableOpacity>

          {/* Lista de Equipos */}
          <View style={styles.container}>
            {managerTeams.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={64} color="#5D8AA8" />
                <Text style={styles.emptyStateText}>No hay equipos creados</Text>
                <Text style={styles.emptyStateSubtext}>
                  Presiona el botón de arriba para crear tu primer equipo
                </Text>
              </View>
            ) : (
              <FlatList
                data={managerTeams}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TeamCard
                    team={item}
                    onEdit={handleEditTeam}
                    onView={handleViewTeam}
                    onDelete={handleDeleteTeam}
                    isOwner={item.managerId === userId}
                  />
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
              />
            )}
          </View>
        </View>

        {/* Modal para crear/editar/ver equipos */}
        <TeamFormModal
          visible={modalVisible}
          mode={modalMode}
          team={selectedTeam}
          currentUserId={userId}
          onSave={handleSaveTeam}
          onUpdate={handleUpdateTeam}
          onClose={closeModal}
          onDelete={handleDeleteTeamFromModal}
        />

      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    width: '100%',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 100,
    paddingBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#5D8AA8',
    fontWeight: '500',
  },
  createButton: {
    flexDirection: 'row',
    backgroundColor: '#4A6572',
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: 10,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A6572',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 18,
  },
  accessDenied: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  accessDeniedText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A6572',
    marginTop: 16,
    marginBottom: 8,
  },
  accessDeniedSubtext: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 22,
  },
});