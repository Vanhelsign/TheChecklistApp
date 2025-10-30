import { openDatabase } from './database';
import { Team } from '../types/navigation';

export const teamOperations = {
  // Crear equipo
  createTeam: (team: Omit<Team, 'id' | 'memberIds' | 'createdAt'>): Promise<number> => {
    return new Promise((resolve, reject) => {
      try {
        const db = openDatabase();
        const result = db.runSync(
          `INSERT INTO teams (name, description, manager_id) 
           VALUES (?, ?, ?)`,
          [team.name, team.description, team.managerId]
        );
        resolve(result.lastInsertRowId as number);
      } catch (error) {
        reject(error);
      }
    });
  },

  // Agregar miembro a equipo
  addTeamMember: (teamId: number, userId: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        const db = openDatabase();
        db.runSync(
          `INSERT OR IGNORE INTO user_teams (user_id, team_id) VALUES (?, ?)`,
          [userId, teamId]
        );
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },

  // Obtener equipos de un manager
  getManagerTeams: (managerId: number): Promise<Team[]> => {
    return new Promise((resolve, reject) => {
      try {
        const db = openDatabase();
        const result = db.getAllSync(
          `SELECT * FROM teams WHERE manager_id = ? ORDER BY created_at DESC`,
          [managerId]
        );
        
        const teams: Team[] = result.map((row: any) => ({
          id: row.id,
          name: row.name,
          description: row.description,
          managerId: row.manager_id,
          memberIds: [], // Se llenará después
          createdAt: new Date(row.created_at)
        }));

        // Obtener miembros para cada equipo
        const teamsWithMembers = teams.map(async (team) => {
          const members = await teamOperations.getTeamMembers(team.id);
          return {
            ...team,
            memberIds: members
          };
        });

        Promise.all(teamsWithMembers).then(resolve);
      } catch (error) {
        reject(error);
      }
    });
  },

  // Obtener miembros de un equipo
  getTeamMembers: (teamId: number): Promise<number[]> => {
    return new Promise((resolve, reject) => {
      try {
        const db = openDatabase();
        const result = db.getAllSync(
          `SELECT user_id FROM user_teams WHERE team_id = ?`,
          [teamId]
        );
        
        const memberIds: number[] = result.map((row: any) => row.user_id);
        resolve(memberIds);
      } catch (error) {
        reject(error);
      }
    });
  },

  // Obtener todos los equipos
  getAllTeams: (): Promise<Team[]> => {
    return new Promise((resolve, reject) => {
      try {
        const db = openDatabase();
        const result = db.getAllSync(
          `SELECT * FROM teams ORDER BY created_at DESC`
        );
        
        const teams: Team[] = result.map((row: any) => ({
          id: row.id,
          name: row.name,
          description: row.description,
          managerId: row.manager_id,
          memberIds: [], // Se llenará después
          createdAt: new Date(row.created_at)
        }));

        // Obtener miembros para cada equipo
        const teamsWithMembers = teams.map(async (team) => {
          const members = await teamOperations.getTeamMembers(team.id);
          return {
            ...team,
            memberIds: members
          };
        });

        Promise.all(teamsWithMembers).then(resolve);
      } catch (error) {
        reject(error);
      }
    });
  },

  // Actualizar equipo
  updateTeam: (teamId: number, teamData: Omit<Team, 'id' | 'managerId' | 'createdAt'>): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        const db = openDatabase();
        db.runSync(
          `UPDATE teams SET name = ?, description = ? WHERE id = ?`,
          [teamData.name, teamData.description, teamId]
        );
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },

  // Eliminar equipo
  deleteTeam: (teamId: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        const db = openDatabase();
        
        // Primero eliminar relaciones en user_teams
        db.runSync(`DELETE FROM user_teams WHERE team_id = ?`, [teamId]);
        
        // Luego eliminar el equipo
        db.runSync(`DELETE FROM teams WHERE id = ?`, [teamId]);
        
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },

  // Actualizar miembros del equipo
  updateTeamMembers: (teamId: number, memberIds: number[]): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        const db = openDatabase();
        
        // Eliminar miembros actuales
        db.runSync(`DELETE FROM user_teams WHERE team_id = ?`, [teamId]);
        
        // Agregar nuevos miembros
        for (const userId of memberIds) {
          db.runSync(
            `INSERT INTO user_teams (user_id, team_id) VALUES (?, ?)`,
            [userId, teamId]
          );
        }
        
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
};