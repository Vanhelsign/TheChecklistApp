import { User } from '../types/navigation';

export const mockUsers: User[] = [
  // Managers - Solo información de usuario
  {
    id: 1,
    email: 'manager@empresa.com',
    password: 'manager123',
    name: 'Ana García',
    role: 'manager',
    teamIds: [] // Los managers NO están en equipos, ellos CREAN equipos
  },
  {
    id: 2,
    email: 'admin@empresa.com', 
    password: 'admin123',
    name: 'Carlos López',
    role: 'manager',
    teamIds: []
  },
  
  // Workers - Están en múltiples equipos
  {
    id: 3,
    email: 'worker1@empresa.com',
    password: 'worker123',
    name: 'María Rodríguez',
    role: 'worker',
    teamIds: [1, 3] // En Equipo A y Equipo C
  },
  {
    id: 4,
    email: 'worker2@empresa.com',
    password: 'worker123', 
    name: 'José Martínez',
    role: 'worker',
    teamIds: [1, 2] // En Equipo A y Equipo B
  }
];