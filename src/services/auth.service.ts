import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase.config";
import simpleAlertService from "./simpleAlert.service";
import { addDoc, CollectionReference, DocumentData, getDocs } from "firebase/firestore";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { UserType } from "../types/navigation";

class AuthService {
  handleLogin = async (
    email: string, 
    password: string,
    usersRef: CollectionReference<DocumentData, DocumentData>,
    navigation: NativeStackNavigationProp<any>
  ) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);

      this.getUserDetailsAndShowHome(usersRef, navigation);
    }
    catch(err) {
      const message = "El correo o la contraseña son incorrectos. Vuelve a intentarlo.";
      simpleAlertService.showError(message);
      console.error(err);
    }
  };

  getUserDetailsAndShowHome = async (usersRef: CollectionReference<any, any>, navigation: NativeStackNavigationProp<any>) => {
    const uid = auth.currentUser?.uid; 
    if(!uid){
      simpleAlertService.showError("No UID provided!");
      return;
    }
    const data = await getDocs(usersRef);
    const filteredData = data.docs.map((user) => ({...user.data()})).find(x => x.uid === uid);
    if(filteredData){
      navigation.replace('Home', { 
      userType: filteredData.role,
      userUID: filteredData.uid,
      userName: filteredData.name,
      userTeamUIDs: filteredData.teamUIDs
      });
    }
    else {
      simpleAlertService.showError("Favor de contactar con un administrador. ERR-001");
    }
  };
  
  handleSignup = async (
    email: string, 
    password: string,
    name: string, 
    role: UserType,
    usersRef: CollectionReference<DocumentData>,
    navigation: NativeStackNavigationProp<any>
  ) => {
    if (!email || !password || !name || !role) {
      simpleAlertService.showError('Por favor completa todos los campos');
      return;
    }

    if (password.length < 6) {
      simpleAlertService.showError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await addDoc(usersRef, {
        uid: user.uid,
        name: name,
        email: email,
        role: role,
        teamIds: []
      });
      
      this.handleLogin(email, password, usersRef, navigation);
    } catch (err: any) {
      let message = 'Error al crear la cuenta';
      
      if (err.code === 'auth/email-already-in-use') {
        message = 'Este correo ya está registrado';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Correo electrónico inválido';
      } else if (err.code === 'auth/weak-password') {
        message = 'La contraseña es muy débil';
      }

      simpleAlertService.showError(message);
      console.error(err);
    }
  };

  handleLogout = (navigation: NativeStackNavigationProp<any>) => {
    auth.signOut()
      .then(() => {
        navigation.replace('Login');
      })
      .catch((err) => {
        simpleAlertService.showError("Error al cerrar sesión");
        console.error(err);
      });
  }

  verifyIfLoggedIn = (
    usersRef: CollectionReference<DocumentData>, 
    navigation: NativeStackNavigationProp<any>,
    onCheckComplete: () => void // NEW: Callback when check is done
  ) => {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const data = await getDocs(usersRef);
          const filteredData = data.docs
            .map((doc) => ({ ...doc.data() }))
            .find(x => x.uid === user.uid);
          
          if (filteredData) {
            navigation.replace('Home', { 
              userType: filteredData.role,
              userUID: filteredData.uid,
              userName: filteredData.name,
              userTeamUIDs: filteredData.teamUIDs
            });
          } else {
            onCheckComplete(); // No user data found, show login
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          onCheckComplete(); // Error occurred, show login
        }
      } else {
        // No user logged in, show login screen
        onCheckComplete();
      }
    });
  }
}

export default new AuthService();