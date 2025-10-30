import { openDatabase } from './database';
import { Task, Priority } from '../types/navigation';

export const taskOperations = {
  // Crear tarea
  createTask: (task: Omit<Task, 'id' | 'createdAt'>): Promise<number> => {
    return new Promise((resolve, reject) => {
      try {
        const db = openDatabase();
        const result = db.runSync(
          `INSERT INTO tasks (title, description, due_date, priority, completed, assigned_to, assigned_team_id, assigned_user_id, created_by) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            task.title,
            task.description,
            task.dueDate.toISOString(),
            task.priority,
            task.completed ? 1 : 0,
            task.assignedTo,
            task.assignedTeamId || null,
            task.assignedUserId || null,
            task.createdBy
          ]
        );
        resolve(result.lastInsertRowId as number);
      } catch (error) {
        reject(error);
      }
    });
  },

  // Obtener tareas de un manager
  getManagerTasks: (managerId: number): Promise<Task[]> => {
    return new Promise((resolve, reject) => {
      try {
        const db = openDatabase();
        const result = db.getAllSync(
          `SELECT * FROM tasks WHERE created_by = ? ORDER BY created_at DESC`,
          [managerId]
        );
        
        const tasks: Task[] = result.map((row: any) => ({
          id: row.id,
          title: row.title,
          description: row.description,
          dueDate: new Date(row.due_date),
          priority: row.priority as Priority,
          completed: Boolean(row.completed),
          assignedTo: row.assigned_to as 'team' | 'user',
          assignedTeamId: row.assigned_team_id || undefined,
          assignedUserId: row.assigned_user_id || undefined,
          createdBy: row.created_by,
          createdAt: new Date(row.created_at)
        }));

        resolve(tasks);
      } catch (error) {
        reject(error);
      }
    });
  },

  // Obtener tareas pendientes
  getPendingTasks: (): Promise<Task[]> => {
    return new Promise((resolve, reject) => {
      try {
        const db = openDatabase();
        const result = db.getAllSync(
          `SELECT * FROM tasks WHERE completed = 0 ORDER BY due_date ASC`
        );
        
        const tasks: Task[] = result.map((row: any) => ({
          id: row.id,
          title: row.title,
          description: row.description,
          dueDate: new Date(row.due_date),
          priority: row.priority as Priority,
          completed: Boolean(row.completed),
          assignedTo: row.assigned_to as 'team' | 'user',
          assignedTeamId: row.assigned_team_id || undefined,
          assignedUserId: row.assigned_user_id || undefined,
          createdBy: row.created_by,
          createdAt: new Date(row.created_at)
        }));

        resolve(tasks);
      } catch (error) {
        reject(error);
      }
    });
  },

  // Obtener tareas completadas
  getCompletedTasks: (): Promise<Task[]> => {
    return new Promise((resolve, reject) => {
      try {
        const db = openDatabase();
        const result = db.getAllSync(
          `SELECT * FROM tasks WHERE completed = 1 ORDER BY created_at DESC`
        );
        
        const tasks: Task[] = result.map((row: any) => ({
          id: row.id,
          title: row.title,
          description: row.description,
          dueDate: new Date(row.due_date),
          priority: row.priority as Priority,
          completed: Boolean(row.completed),
          assignedTo: row.assigned_to as 'team' | 'user',
          assignedTeamId: row.assigned_team_id || undefined,
          assignedUserId: row.assigned_user_id || undefined,
          createdBy: row.created_by,
          createdAt: new Date(row.created_at)
        }));

        resolve(tasks);
      } catch (error) {
        reject(error);
      }
    });
  },

  // Actualizar tarea
  updateTask: (taskId: number, taskData: Omit<Task, 'id' | 'createdBy' | 'createdAt'>): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        const db = openDatabase();
        db.runSync(
          `UPDATE tasks SET title = ?, description = ?, due_date = ?, priority = ?, completed = ?, assigned_to = ?, assigned_team_id = ?, assigned_user_id = ? WHERE id = ?`,
          [
            taskData.title,
            taskData.description,
            taskData.dueDate.toISOString(),
            taskData.priority,
            taskData.completed ? 1 : 0,
            taskData.assignedTo,
            taskData.assignedTeamId || null,
            taskData.assignedUserId || null,
            taskId
          ]
        );
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },

  // Eliminar tarea
  deleteTask: (taskId: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        const db = openDatabase();
        db.runSync(`DELETE FROM tasks WHERE id = ?`, [taskId]);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },

  // Marcar tarea como completada/pendiente
  toggleTaskCompletion: (taskId: number, completed: boolean): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        const db = openDatabase();
        db.runSync(
          `UPDATE tasks SET completed = ? WHERE id = ?`,
          [completed ? 1 : 0, taskId]
        );
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
};