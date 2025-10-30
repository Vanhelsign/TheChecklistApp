import * as SQLite from 'expo-sqlite';

export { initializeSampleData } from './initializeData';

// Abrir/Crear la base de datos - NUEVA API
export const openDatabase = () => {
  return SQLite.openDatabaseSync('checklistapp.db');
};

// Inicializar la base de datos
export const initDatabase = () => {
  const db = openDatabase();
  
  // Con la nueva API, usamos ejecución directa
  try {
    // Tabla de usuarios
    db.execSync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('manager', 'worker'))
      );
    `);

    // Tabla de equipos
    db.execSync(`
      CREATE TABLE IF NOT EXISTS teams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        manager_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (manager_id) REFERENCES users (id)
      );
    `);

    // Tabla de relación usuarios-equipos
    db.execSync(`
      CREATE TABLE IF NOT EXISTS user_teams (
        user_id INTEGER,
        team_id INTEGER,
        PRIMARY KEY (user_id, team_id),
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (team_id) REFERENCES teams (id)
      );
    `);

    // Tabla de tareas
    db.execSync(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        due_date DATETIME NOT NULL,
        priority TEXT NOT NULL CHECK(priority IN ('alta', 'media', 'baja')),
        completed BOOLEAN DEFAULT 0,
        assigned_to TEXT NOT NULL CHECK(assigned_to IN ('team', 'user')),
        assigned_team_id INTEGER,
        assigned_user_id INTEGER,
        created_by INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assigned_team_id) REFERENCES teams (id),
        FOREIGN KEY (assigned_user_id) REFERENCES users (id),
        FOREIGN KEY (created_by) REFERENCES users (id)
      );
    `);

    console.log('Base de datos inicializada correctamente');
  } catch (error) {
    console.error('Error inicializando base de datos:', error);
    throw error;
  }

  
};