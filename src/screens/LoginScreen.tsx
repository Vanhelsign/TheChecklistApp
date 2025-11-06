import React, { useEffect, useMemo, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { db } from '../config/firebase.config';
import { collection } from 'firebase/firestore';
import authService from '../services/auth.service';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [checking, setChecking] = useState(true);

  const usersRef = useMemo(() => collection(db, 'users'), []);

  useEffect(() => {
    let isSubscribed = true;
    const unsubscribe = authService.verifyIfLoggedIn(
      usersRef, 
      navigation,
      () => {
        if (isSubscribed) {
          setChecking(false);
        }
      }
    );
    return () => {
      isSubscribed = false;
      unsubscribe();
    };
  }, []);
  
  const handleLogIn = async () => {
    await authService.handleLogin(email, password, usersRef, navigation);
  };

  const handleSignUp = () => {
    navigation.navigate('Signup');
  };

  if (checking) {
    return (
      <SafeAreaView style={styles.fullScreen}>
        <LinearGradient 
          colors={['#c7d3eaff', '#6689c5ff', '#5282e3ff']} 
          style={[styles.fullScreen, styles.loadingContainer]}
        >
          <StatusBar style="light" translucent backgroundColor="transparent" />

          <View style={styles.loadingContent}>
            {/* Indicador de carga */}
            <ActivityIndicator 
              size="large" 
              color="#FFFFFF" 
              style={styles.spinner}
            />
            <Text style={styles.loadingText}>Verificando sesión...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }


  return (
    <SafeAreaView style={styles.fullScreen}>
      <LinearGradient 
        colors={['#c7d3eaff', '#6689c5ff', '#5282e3ff']} 
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
              Inicia sesión para empezar con tus deberes
            </Text>
          </View>

          {/* Formulario de Login */}
          <View style={styles.formContainer}>
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

            {/* Enlace Contraseña Olvidada */}
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Contraseña olvidada</Text>
            </TouchableOpacity>

            {/* Separador */}
            <View style={styles.separator} />

            {/* Botón Iniciar Sesión */}
            <TouchableOpacity style={styles.loginButton} onPress={handleLogIn}>
              <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
            </TouchableOpacity>

            {/* Enlace Crear Cuenta */}
            <View style={styles.createAccountContainer}>
              <Text style={styles.createAccountText}>
                ¿Todavía no tienes una cuenta?{' '}
              </Text>
              <TouchableOpacity onPress={handleSignUp}>
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  logoText: {
    fontSize: 60,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 40,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  spinner: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    opacity: 0.9,
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
    color: '#2A5298',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f3f75ff',
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
    color: '#2A5298',
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
  checkboxPlaceholder: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#2A5298',
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
    color: '#2A5298',
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#E8E8E8',
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: '#85c8f2ff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#2A5298',
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
    color: '#2A5298',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
