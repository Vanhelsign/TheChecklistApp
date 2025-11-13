import { db } from "../config/firebase.config";
import { collection, getDocs, onSnapshot, query } from "firebase/firestore";
import { User } from "../types/navigation";

class UserService {
  // Método con listener en tiempo real para usuarios
  subscribeToUsers = (onUpdate: (users: User[]) => void, onError?: (error: Error) => void) => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef);
    
    return onSnapshot(
      q,
      {
        includeMetadataChanges: true
      },
      (snapshot) => {
        const users = snapshot.docs.map(doc => ({
          uid: doc.data().uid,
          email: doc.data().email,
          name: doc.data().name,
          role: doc.data().role,
          teamUIDs: doc.data().teamUIDs || [],
        })) as User[];
        
        onUpdate(users);
      },
      (error) => {
        console.error('Error en suscripción de usuarios:', error);
        if (onError) onError(error);
      }
    );
  };

  getAllUsers = async () => {
    const usersRef = collection(db, 'users');
    const data = await getDocs(usersRef);
    return data.docs.map(doc => ({
      uid: doc.data().uid,
      email: doc.data().email,
      name: doc.data().name,
      role: doc.data().role,
      teamUIDs: doc.data().teamUIDs || [],
    })) as User[];
  }

  getUserById = async (uid: string): Promise<User | null> => {
    const users = await this.getAllUsers();
    return users.find(user => user.uid === uid) || null;
  }

  getUsersByIds = async (uids: string[]): Promise<User[]> => {
    const users = await this.getAllUsers();
    return users.filter(user => uids.includes(user.uid));
  }

  getUsersByRole = async (role: string): Promise<User[]> => {
    const users = await this.getAllUsers();
    return users.filter(user => user.role === role);
  }
}

export default new UserService();