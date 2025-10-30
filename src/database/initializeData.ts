import { openDatabase } from './database';
import { userOperations } from './userOperations';
import { teamOperations } from './teamOperations';
import { taskOperations } from './taskOperations';

export const initializeSampleData = async (): Promise<void> => {
  const db = openDatabase();
  
  return new Promise((resolve, reject) => {
    try {
      // Verificar si ya existen datos
      const result = db.getAllSync('SELECT COUNT(*) as count FROM users');
      const userCount = (result[0] as any).count;

      if (userCount === 0) {
        console.log('Insertando datos de ejemplo...');
        insertSampleData().then(resolve).catch(reject);
      } else {
        console.log('La base de datos ya contiene datos, omitiendo inserción de ejemplos');
        resolve();
      }
    } catch (error) {
      reject(error);
    }
  });
};

const insertSampleData = async (): Promise<void> => {
  try {
    // 1. Insertar usuarios
    console.log('Creando usuarios...');
    
    const managerId = await userOperations.createUser({
      email: 'manager@empresa.com',
      password: 'manager123',
      name: 'Ana García',
      role: 'manager'
    });

    const adminId = await userOperations.createUser({
      email: 'admin@empresa.com',
      password: 'admin123',
      name: 'Carlos López',
      role: 'manager'
    });

    const worker1Id = await userOperations.createUser({
      email: 'worker1@empresa.com',
      password: 'worker123',
      name: 'María Rodríguez',
      role: 'worker'
    });

    const worker2Id = await userOperations.createUser({
      email: 'worker2@empresa.com',
      password: 'worker123',
      name: 'José Martínez',
      role: 'worker'
    });

    const worker3Id = await userOperations.createUser({
      email: 'worker3@empresa.com',
      password: 'worker123',
      name: 'Laura Fernández',
      role: 'worker'
    });

    // 2. Insertar equipos
    console.log('Creando equipos...');
    
    const frontendTeamId = await teamOperations.createTeam({
      name: 'Equipo Desarrollo Frontend',
      description: 'Equipo encargado del desarrollo de interfaces de usuario',
      managerId: managerId
    });

    const backendTeamId = await teamOperations.createTeam({
      name: 'Equipo Backend',
      description: 'Equipo encargado de APIs y base de datos',
      managerId: managerId
    });

    const qaTeamId = await teamOperations.createTeam({
      name: 'Equipo QA',
      description: 'Equipo de control de calidad y testing',
      managerId: adminId
    });

    // 3. Asignar miembros a equipos
    console.log('Asignando miembros a equipos...');
    
    // Equipo Frontend: María y José
    await teamOperations.addTeamMember(frontendTeamId, worker1Id);
    await teamOperations.addTeamMember(frontendTeamId, worker2Id);
    
    // Equipo Backend: José y Laura
    await teamOperations.addTeamMember(backendTeamId, worker2Id);
    await teamOperations.addTeamMember(backendTeamId, worker3Id);
    
    // Equipo QA: María y Laura
    await teamOperations.addTeamMember(qaTeamId, worker1Id);
    await teamOperations.addTeamMember(qaTeamId, worker3Id);

    // 4. Insertar tareas de ejemplo
    console.log('Creando tareas de ejemplo...');
    
    // Tareas asignadas a equipos
    await taskOperations.createTask({
      title: 'Diseñar nueva interfaz de dashboard',
      description: 'Crear mockups y prototipos para el nuevo dashboard administrativo',
      dueDate: new Date('2024-11-15'),
      priority: 'alta',
      completed: false,
      assignedTo: 'team',
      assignedTeamId: frontendTeamId,
      assignedUserId: undefined,
      createdBy: managerId
    });

    await taskOperations.createTask({
      title: 'Optimizar consultas de base de datos',
      description: 'Revisar y optimizar las consultas SQL para mejorar rendimiento',
      dueDate: new Date('2024-11-10'),
      priority: 'media',
      completed: true,
      assignedTo: 'team',
      assignedTeamId: backendTeamId,
      assignedUserId: undefined,
      createdBy: managerId
    });

    await taskOperations.createTask({
      title: 'Ejecutar pruebas de integración',
      description: 'Realizar pruebas completas del sistema integrado',
      dueDate: new Date('2024-11-05'),
      priority: 'alta',
      completed: false,
      assignedTo: 'team',
      assignedTeamId: qaTeamId,
      assignedUserId: undefined,
      createdBy: adminId
    });

    // Tareas asignadas a personas específicas
    await taskOperations.createTask({
      title: 'Revisar documentación técnica',
      description: 'Revisar y actualizar la documentación del proyecto',
      dueDate: new Date('2024-10-30'),
      priority: 'baja',
      completed: false,
      assignedTo: 'user',
      assignedTeamId: undefined,
      assignedUserId: worker1Id,
      createdBy: managerId
    });

    await taskOperations.createTask({
      title: 'Preparar presentación para cliente',
      description: 'Crear presentación con los avances del proyecto',
      dueDate: new Date('2024-11-01'),
      priority: 'media',
      completed: true,
      assignedTo: 'user',
      assignedTeamId: undefined,
      assignedUserId: worker2Id,
      createdBy: adminId
    });

    await taskOperations.createTask({
      title: 'Configurar ambiente de desarrollo',
      description: 'Configurar nuevo ambiente de desarrollo para proyecto interno',
      dueDate: new Date('2024-11-12'),
      priority: 'media',
      completed: false,
      assignedTo: 'team',
      assignedTeamId: frontendTeamId,
      assignedUserId: undefined,
      createdBy: managerId
    });

    console.log('✅ Datos de ejemplo insertados correctamente');
  } catch (error) {
    console.error('❌ Error insertando datos de ejemplo:', error);
    throw error;
  }
};