//Ejemplos de prueba mientras aun no se agrega una base de datos

import { Task } from '../types/navigation';

export const mockTasks: Task[] = [
  // Tareas asignadas a EQUIPOS
  {
    id: 1,
    title: 'Diseñar nueva interfaz de usuario',
    description: 'Crear mockups y prototipos para la nueva funcionalidad de dashboard',
    dueDate: new Date('2024-11-15'),
    priority: 'alta',
    completed: false,
    createdAt: new Date('2024-10-20'),
    assignedTo: 'team',
    assignedTeamId: 1, // Equipo Frontend
    createdBy: 1 // Ana García
  },
  {
    id: 2,
    title: 'Optimizar consultas de base de datos',
    description: 'Revisar y optimizar las consultas SQL para mejorar rendimiento',
    dueDate: new Date('2024-11-10'),
    priority: 'media',
    completed: true,
    createdAt: new Date('2024-10-18'),
    assignedTo: 'team', 
    assignedTeamId: 2, // Equipo Backend
    createdBy: 1 // Ana García
  },
  {
    id: 3,
    title: 'Ejecutar pruebas de integración',
    description: 'Realizar pruebas completas del sistema integrado',
    dueDate: new Date('2024-11-05'),
    priority: 'alta',
    completed: false,
    createdAt: new Date('2024-10-22'),
    assignedTo: 'team',
    assignedTeamId: 3, // Equipo QA
    createdBy: 2 // Carlos López
  },
  
  // Tareas asignadas a USUARIOS específicos
  {
    id: 4,
    title: 'Revisar documentación técnica',
    description: 'Revisar y actualizar la documentación del proyecto',
    dueDate: new Date('2024-10-30'),
    priority: 'baja',
    completed: false,
    createdAt: new Date('2024-10-23'),
    assignedTo: 'user',
    assignedUserId: 3, // María específicamente
    createdBy: 1 // Ana García
  },
  {
    id: 5,
    title: 'Preparar presentación para cliente',
    description: 'Crear presentación con los avances del proyecto',
    dueDate: new Date('2024-11-01'),
    priority: 'media',
    completed: true,
    createdAt: new Date('2024-10-19'),
    assignedTo: 'user',
    assignedUserId: 4, // José específicamente  
    createdBy: 2 // Carlos López
  },
  {
    id: 6,
    title: 'Configurar ambiente de desarrollo',
    description: 'Configurar nuevo ambiente de desarrollo para proyecto interno',
    dueDate: new Date('2024-11-12'),
    priority: 'media', 
    completed: false,
    createdAt: new Date('2024-10-21'),
    assignedTo: 'team',
    assignedTeamId: 1, // Equipo Frontend
    createdBy: 1 // Ana García
  }
];