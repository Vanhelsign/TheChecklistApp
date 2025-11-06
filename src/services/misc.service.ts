
class MiscService {
  getAvatarColor = (id: string | number, colorPool: string[]) => {
    let hash = 0;
    const idString = String(id);
    for (let i = 0; i < idString.length; i++) {
      hash = idString.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colorPool[Math.abs(hash) % colorPool.length];
  };
}

export default new MiscService();