import { openDatabase } from './database';
import { User } from '../types/navigation';

export const userOperations = {
  // Insertar usuario
  createUser: (user: Omit<User, 'id' | 'teamIds'>): Promise<number> => {
    return new Promise((resolve, reject) => {
      try {
        const db = openDatabase();
        const result = db.runSync(
          `INSERT INTO users (email, password, name, role) 
           VALUES (?, ?, ?, ?)`,
          [user.email, user.password, user.name, user.role]
        );
        resolve(result.lastInsertRowId as number);
      } catch (error) {
        reject(error);
      }
    });
  },

  // Obtener usuario por email y password (login)
  getUserByCredentials: (email: string, password: string): Promise<User | null> => {
    return new Promise((resolve, reject) => {
      try {
        const db = openDatabase();
        const result = db.getAllSync(
          `SELECT * FROM users WHERE email = ? AND password = ?`,
          [email, password]
        );
        
        if (result.length > 0) {
          const user = result[0] as any;
          resolve({
            id: user.id,
            email: user.email,
            password: user.password,
            name: user.name,
            role: user.role,
            teamIds: [] // Se llenará después
          });
        } else {
          resolve(null);
        }
      } catch (error) {
        reject(error);
      }
    });
  },

  // Obtener equipos de un usuario
  getUserTeams: (userId: number): Promise<number[]> => {
    return new Promise((resolve, reject) => {
      try {
        const db = openDatabase();
        const result = db.getAllSync(
          `SELECT team_id FROM user_teams WHERE user_id = ?`,
          [userId]
        );
        
        const teamIds: number[] = result.map((row: any) => row.team_id);
        resolve(teamIds);
      } catch (error) {
        reject(error);
      }
    });
  },

  // Obtener todos los workers
  getAllWorkers: (): Promise<User[]> => {
    return new Promise(async (resolve, reject) => {
      try {
        const db = openDatabase();
        const result = db.getAllSync(
          `SELECT * FROM users WHERE role = 'worker'`
        );
        
        const workers: User[] = [];
        for (const row of result as any[]) {
          const teamIds = await userOperations.getUserTeams(row.id);
          workers.push({
            id: row.id,
            email: row.email,
            password: row.password,
            name: row.name,
            role: row.role,
            teamIds: teamIds
          });
        }
        resolve(workers);
      } catch (error) {
        reject(error);
      }
    });
  },

  // Obtener usuario por ID
  getUserById: (userId: number): Promise<User | null> => {
    return new Promise(async (resolve, reject) => {
      try {
        const db = openDatabase();
        const result = db.getAllSync(
          `SELECT * FROM users WHERE id = ?`,
          [userId]
        );
        
        if (result.length > 0) {
          const user = result[0] as any;
          const teamIds = await userOperations.getUserTeams(userId);
          resolve({
            id: user.id,
            email: user.email,
            password: user.password,
            name: user.name,
            role: user.role,
            teamIds: teamIds
          });
        } else {
          resolve(null);
        }
      } catch (error) {
        reject(error);
      }
    });
  }
};