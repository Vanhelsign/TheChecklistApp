export type UserType = 'manager' | 'worker';

export type Priority = 'alta' | 'media' | 'baja';

export type TeamModalMode = 'create' | 'edit' | 'view';


// Tipo para los parámetros de usuario que se pasan entre pantallas
export type UserParams = {
  userType: UserType;
  userUID: string;
  userName: string;
  userTeamUIDs: string[];
};

export type Task = {
  uid: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: Priority;
  completed: boolean;
  createdAt: Date;
  assignedTo: 'team' | 'user'; // Si es para equipo o usuario específico
  assignedTeamUID?: string; // ID del equipo asignado (si assignedTo === 'team')
  assignedUserUID?: string; // ID del usuario asignado (si assignedTo === 'user')
  createdBy: string; // ID del manager que creó la tarea
  checklistItems?: CheckListItem[];
};

export type CheckListItem = {
  id: string;
  text: string;
  type: CheckListItemTypes;
  completed: boolean;
  value?: string;
  numberValue?: number;
  fileUri?: string;
  signatureUri?: string;
}

export type CheckListItemTypes = 'checkbox' | 'textInput' | 'numberInput' | 'fileUpload' | 'signUpload';

export const TaskStatus = {
  Pending: false,
  Completed: true
}

export type User = {
  uid: string;
  email: string;
  password?: string;
  name: string;
  role: 'manager' | 'worker';
  teamUIDs: string[]; // IDs de equipos a los que pertenece
};

export type Team = {
  uid: string;
  name: string;
  description?: string;
  managerUID: string;    // ← QUIÉN creó el equipo (manager)
  memberUIDs: string[];  // ← QUIÉNES están en el equipo (workers)
  createdAt: Date;
};

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Home: UserParams;
  PendingTasks: UserParams;
  CompletedTasks: UserParams;
  Tasks: UserParams;
  Teams: UserParams;
};