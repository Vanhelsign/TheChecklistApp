import { db } from "../config/firebase.config";
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { Team } from "../types/navigation";

class TeamService {
  getAllTeams = async () => {
    const teamsRef = collection(db, 'teams');
    const data = await getDocs(teamsRef);
    return data.docs.map(doc => ({
        uid: doc.id,
        name: doc.data().name,
        description: doc.data().description,
        managerUID: doc.data().managerUID,
        memberUIDs: doc.data().memberUIDs || [],
        createdAt: doc.data().createdAt.toDate(),
    })) as Team[];
  };

  createTeam = async (teamData: Omit<Team, 'uid'>): Promise<Team> => {
    try {
      const teamsRef = collection(db, 'teams');
      
      // Remove undefined fields before sending to Firestore
      const cleanedTeamData: Omit<Team, 'uid'> = {
        name: teamData.name,
        managerUID: teamData.managerUID,
        memberUIDs: teamData.memberUIDs || [],
        createdAt: teamData.createdAt
      };

      if (teamData.description) {
        cleanedTeamData.description = teamData.description;
      }

      const docRef = await addDoc(teamsRef, cleanedTeamData);
      
      return {
        ...cleanedTeamData,
        uid: docRef.id,
      } as Team;
    } catch (error) {
      console.error('Error creating team:', error);
      throw error;
    }
  };

  deleteTeam = async (teamUID: string): Promise<void> => {
    try {
      const docRef = doc(db, 'teams', teamUID);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting team:', error);
      throw error;
    }
  };

  updateTeam = async (teamUID: string, updatedData: Partial<Team>): Promise<void> => {
    try {
      const filteredData: any = {};
      Object.keys(updatedData).forEach(key => {
        const value = updatedData[key as keyof Team];
        if (value !== undefined) {
          filteredData[key] = value;
        }
      });
      const docRef = doc(db, 'teams', teamUID);
      await updateDoc(docRef, filteredData);
    } catch (error) {
      console.error('Error updating team:', error);
      throw error;
    }
  }
}

export default new TeamService();