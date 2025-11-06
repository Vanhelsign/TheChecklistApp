import React, { useMemo, useState } from 'react';
import { 
  View, 
  Text,
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  TextInput,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, UserType } from '../types/navigation';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { db } from '../config/firebase.config';
import { collection } from 'firebase/firestore';
import authService from '../services/auth.service';

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>;

export default function SignupScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserType | ''>('');

  const usersRef = useMemo(() => collection(db, 'users'), []);

  const handleLogIn = () => {
    navigation.navigate('Login');
  };

  const handleSignUp = async () => {
    await authService.handleSignup(email, password, name, role as UserType, usersRef, navigation);
  }

  return (
    <SafeAreaView style={styles.fullScreen}>
      <LinearGradient 
        colors={['#f7c7c7', '#d05b5b', '#e04b4b']} 
        style={styles.fullScreen}
      >
        <StatusBar style="light" translucent backgroundColor="transparent" />
        
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.welcomeTitle}>Bienvenido</Text>
            <Text style={styles.subtitle}>
              Llena los siguientes datos para crear tu cuenta
            </Text>
          </View>

          {/* Formulario de Signup */}
          <View style={styles.formContainer}>
            {/* Campo Nombre */}
            <View style={styles.inputSection}>
              <Text style={styles.sectionLabel}>Nombre Completo</Text>
              <View style={styles.inputWrapper}>
                <View style={styles.checkboxPlaceholder} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Escribe aquí..."
                  placeholderTextColor="#A0A0A0"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            </View>
            {/* Campo Email */}
            <View style={styles.inputSection}>
              <Text style={styles.sectionLabel}>Correo Electrónico</Text>
              <View style={styles.inputWrapper}>
                <View style={styles.checkboxPlaceholder} />
                <TextInput
                  style={styles.textInput}
                  placeholder="ejemplo@correo.com"
                  placeholderTextColor="#A0A0A0"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
            </View>

            {/* Campo Contraseña */}
            <View style={styles.inputSection}>
              <Text style={styles.sectionLabel}>Contraseña</Text>
              <View style={styles.inputWrapper}>
                <View style={styles.checkboxPlaceholder} />
                <TextInput
                  style={styles.textInput}
                  placeholder="••••••••"
                  placeholderTextColor="#A0A0A0"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoComplete="password"
                />
              </View>
            </View>

            {/* Campo Rol */}
            <View style={styles.inputSection}>
              <Text style={styles.sectionLabel}>Rol</Text>
              <View style={styles.inputWrapper}>
                <View style={styles.checkboxPlaceholder} />
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={role}
                    onValueChange={(value: UserType | '') => setRole(value as UserType)}
                    style={[styles.picker, role ? styles.pickerSelected : styles.pickerPlaceholder]}
                    dropdownIconColor="#a82a2a"
                    itemStyle={styles.pickerItem}
                  >
                    <Picker.Item label="Selecciona un rol" value="" />
                    <Picker.Item label="Gerente" value="manager" />
                    <Picker.Item label="Trabajador" value="worker" />
                  </Picker>
                </View>
              </View>
            </View>

            {/* Separador */}
            <View style={styles.separator} />

            {/* Botón Crear Cuenta */}
            <TouchableOpacity style={styles.loginButton} onPress={handleSignUp}>
              <Text style={styles.loginButtonText}>Crear Cuenta</Text>
            </TouchableOpacity>

            {/* Enlace Crear Cuenta */}
            <View style={styles.createAccountContainer}>
              <Text style={styles.createAccountText}>
                ¿Ya tienes una cuenta? {' '}
              </Text>
              <TouchableOpacity onPress={handleLogIn}>
                <Text style={styles.createAccountLink}>Haz click aquí</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 30,
    width: '100%',
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffdfdfff',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: '80%',
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  inputSection: {
    marginBottom: 18,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#a82a2a',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pickerWrapper: {
    flex: 1,
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  picker: {
    color: '#333333',
    width: '100%',
    borderWidth: 0,
  },
  checkboxPlaceholder: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#a82a2a',
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    padding: 0,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#a82a2a',
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#E8E8E8',
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: '#f28d8d',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#a82a2a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  createAccountContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  createAccountText: {
    fontSize: 14,
    color: '#666666',
  },
  createAccountLink: {
    fontSize: 14,
    color: '#a82a2a',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  roleSelector: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#a82a2a',
    marginBottom: 16,
    textAlign: 'center',
  },
  userButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  userButton: {
    backgroundColor: '#E8E8E8',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  userButtonSelected: {
    backgroundColor: '#f28d8d',
  },
  userButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  demoCredentials: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  demoText: {
    fontSize: 12,
    color: '#F2E8E8',
    marginBottom: 4,
  },
  pickerPlaceholder: {
    color: '#9B9B9B',
  },
  pickerSelected: {
    color: '#333333',
    fontWeight: '600',
  },
  pickerItem: {
    fontSize: 16,
  },
});
