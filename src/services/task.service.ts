import { db } from "../config/firebase.config";
import { addDoc, collection, getDocs, doc, updateDoc, deleteDoc, arrayUnion, arrayRemove, onSnapshot, query } from "firebase/firestore";
import { Priority, Task, User } from "../types/navigation";

class TaskService {
  // Método mejorado con listener en tiempo real y caché offline
  subscribeToTasks = (onUpdate: (tasks: Task[]) => void, onError?: (error: Error) => void) => {
    const tasksRef = collection(db, 'tasks');
    const q = query(tasksRef);
    
    return onSnapshot(
      q, 
      {
        // Esta opción permite que el listener funcione con datos de caché
        includeMetadataChanges: true
      },
      (snapshot) => {
        const tasks = snapshot.docs.map(doc => ({
          uid: doc.id,
          title: doc.data().title,
          description: doc.data().description,
          dueDate: doc.data().dueDate.toDate(),
          priority: doc.data().priority as Priority,
          completed: doc.data().completed,
          checklistItems: doc.data().checklistItems ?? [],
          createdAt: doc.data().createdAt.toDate(),
          assignedTo: doc.data().assignedTo as 'team' | 'user',
          assignedTeamUID: doc.data().assignedTeamUID,
          assignedUserUID: doc.data().assignedUserUID,
          createdBy: doc.data().createdBy,
        })) as Task[];
        
        onUpdate(tasks);
      },
      (error) => {
        console.error('Error en subscripción de tareas:', error);
        if (onError) onError(error);
      }
    );
  }

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
      checklistItems: doc.data().checklistItems ?? [],
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
      // Remove undefined fields before sending to Firestore and sanitize nested checklist items
      const cleanedTaskData: any = {
        title: taskData.title,
        description: taskData.description,
        dueDate: taskData.dueDate,
        priority: taskData.priority,
        completed: taskData.completed,
        checklistItems: taskData.checklistItems ?? [],
        // Ensure createdAt exists (avoid undefined which Firestore rejects)
        createdAt: taskData.createdAt ?? new Date(),
        assignedTo: taskData.assignedTo,
        createdBy: taskData.createdBy
      };

      if (taskData.assignedTeamUID) {
        cleanedTaskData.assignedTeamUID = taskData.assignedTeamUID;
      }
      if (taskData.assignedUserUID) {
        cleanedTaskData.assignedUserUID = taskData.assignedUserUID;
      }

      // sanitize checklist item objects (remove undefined and NaN fields)
      if (Array.isArray(cleanedTaskData.checklistItems)) {
        cleanedTaskData.checklistItems = cleanedTaskData.checklistItems.map((it: any) => {
          const out: any = {};
          Object.keys(it || {}).forEach(k => {
            const v = it[k];
            if (v === undefined) return;
            if (typeof v === 'number' && Number.isNaN(v)) return;
            out[k] = v;
          });
          return out;
        });
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

  deleteTask = async (taskUID: string): Promise<void> => {
    try {
      const docRef = doc(db, 'tasks', taskUID);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  updateTask = async (taskUID: string, updatedData: Partial<Task>): Promise<void> => {
    try {
      const filteredData: any = {};
      Object.keys(updatedData).forEach(key => {
        const value = updatedData[key as keyof Task];
        if (value !== undefined) {
          filteredData[key] = value;
        }
      });

      // If checklistItems is provided, sanitize nested items
      if (Array.isArray(filteredData.checklistItems)) {
        filteredData.checklistItems = filteredData.checklistItems.map((it: any) => {
          const out: any = {};
          Object.keys(it || {}).forEach(k => {
            const v = it[k];
            if (v === undefined) return;
            if (typeof v === 'number' && Number.isNaN(v)) return;
            out[k] = v;
          });
          return out;
        });
      }
      const docRef = doc(db, 'tasks', taskUID);
      await updateDoc(docRef, filteredData);
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  addChecklistItem = async (taskUID: string, item: any): Promise<void> => {
    try {
      const docRef = doc(db, 'tasks', taskUID);
      // Clean the item before sending so Firestore stores a predictable object
      const cleanedItem: any = {};
      Object.keys(item).forEach(key => {
        const val = item[key];
        if (val === undefined) return;
        // drop NaN values
        if (typeof val === 'number' && Number.isNaN(val)) return;
        cleanedItem[key] = val;
      });

      await updateDoc(docRef, { checklistItems: arrayUnion(cleanedItem) });
    } catch (error) {
      console.error('Error adding checklist item:', error);
      throw error;
    }
  }

  removeChecklistItem = async (taskUID: string, item: any): Promise<void> => {
    try {
      const docRef = doc(db, 'tasks', taskUID);
      // When removing, the object must match exactly what's stored. Remove undefined/NaN
      const cleanedItem: any = {};
      Object.keys(item).forEach(key => {
        const val = item[key];
        if (val === undefined) return;
        if (typeof val === 'number' && Number.isNaN(val)) return;
        cleanedItem[key] = val;
      });

      await updateDoc(docRef, { checklistItems: arrayRemove(cleanedItem) });
    } catch (error) {
      console.error('Error removing checklist item:', error);
      throw error;
    }
  }
}

export default new TaskService();