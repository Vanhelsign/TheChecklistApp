import { db } from "../config/firebase.config";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { Priority, Task, User } from "../types/navigation";

class TaskService {
  getAllTasks = async () => {
    const tasksRef = collection(db, 'tasks');
    const data = await getDocs(tasksRef);
    return data.docs.map(doc => ({
      uid: doc.id,
      title: doc.data().title,
      description: doc.data().description,
      dueDate: doc.data().dueDate.toDate(),
      priority: doc.data().priority as Priority,
      completed: doc.data().completed,
      createdAt: doc.data().createdAt.toDate(),
      assignedTo: doc.data().assignedTo as 'team' | 'user',
      assignedTeamUID: doc.data().assignedTeamUID,
      assignedUserUID: doc.data().assignedUserUID,
      createdBy: doc.data().createdBy,
    })) as Task[];
  }

  createTask = async (taskData: Omit<Task, 'uid'>): Promise<Task> => {
    try {
      const tasksRef = collection(db, 'tasks');
      
      // Remove undefined fields before sending to Firestore
      const cleanedTaskData: Omit<Task, 'uid'> = {
        title: taskData.title,
        description: taskData.description,
        dueDate: taskData.dueDate,
        priority: taskData.priority,
        completed: taskData.completed,
        createdAt: taskData.createdAt,
        assignedTo: taskData.assignedTo,
        createdBy: taskData.createdBy
      };

      if (taskData.assignedTeamUID) {
        cleanedTaskData.assignedTeamUID = taskData.assignedTeamUID;
      }
      if (taskData.assignedUserUID) {
        cleanedTaskData.assignedUserUID = taskData.assignedUserUID;
      }

      const docRef = await addDoc(tasksRef, cleanedTaskData);
      
      return {
        ...taskData,
        uid: docRef.id,
      } as Task;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  deleteTask = async (taskUID: string): Promise<void> => {}

  updateTask = async (taskUID: string, updatedData: Partial<Task>): Promise<void> => {}
}

export default new TaskService();