export type UserType = 'manager' | 'worker';

export type Priority = 'alta' | 'media' | 'baja';

export type TeamModalMode = 'create' | 'edit' | 'view';


// Tipo para los parámetros de usuario que se pasan entre pantallas
export type UserParams = {
  userType: UserType;
  userId: number;
  userName: string;
  userTeamIds: number[];
};

export type Task = {
  id: number;
  title: string;
  description: string;
  dueDate: Date;
  priority: Priority;
  completed: boolean;
  createdAt: Date;
  assignedTo: 'team' | 'user'; // Si es para equipo o usuario específico
  assignedTeamId?: number; // ID del equipo asignado (si assignedTo === 'team')
  assignedUserId?: number; // ID del usuario asignado (si assignedTo === 'user')
  createdBy: number; // ID del manager que creó la tarea
};

export type User = {
  id: number;
  email: string;
  password: string;
  name: string;
  role: 'manager' | 'worker';
  teamIds: number[]; // IDs de equipos a los que pertenece
};

export type Team = {
  id: number;
  name: string;
  description: string;
  managerId: number;    // ← QUIÉN creó el equipo (manager)
  memberIds: number[];  // ← QUIÉNES están en el equipo (workers)
  createdAt: Date;
};

export type RootStackParamList = {
  Login: undefined;
  Home: UserParams;
  PendingTasks: UserParams;
  CompletedTasks: UserParams;
  Tasks: UserParams;
  Teams: UserParams;
};