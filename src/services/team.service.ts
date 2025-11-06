import { db } from "../config/firebase.config";
import { collection, getDocs } from "firebase/firestore";
import { Team, User } from "../types/navigation";

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
  }
}

export default new TeamService();