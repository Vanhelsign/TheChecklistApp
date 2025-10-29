import { Team } from '../types/navigation';

export const mockTeams = [
  {
    id: 1,
    name: 'Equipo Desarrollo Frontend',
    description: 'Equipo encargado del desarrollo de interfaces',
    managerId: 1,  // ← Creado por Ana García (manager id: 1)
    memberIds: [3, 4], // ← Tiene a María (id:3) y José (id:4)
    createdAt: new Date('2024-01-15')
  },
  {
    id: 2, 
    name: 'Equipo Backend',
    description: 'Equipo encargado de APIs y base de datos',
    managerId: 1,  // ← También creado por Ana García
    memberIds: [4], // ← Solo José (id:4)
    createdAt: new Date('2024-01-20')
  },
  {
    id: 3,
    name: 'Equipo QA',
    description: 'Equipo de control de calidad', 
    managerId: 2,  // ← Creado por Carlos López (manager id: 2)
    memberIds: [3], // ← Solo María (id:3)
    createdAt: new Date('2024-02-01')
  }
] as Team[];