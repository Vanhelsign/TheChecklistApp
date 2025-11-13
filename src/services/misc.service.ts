
class MiscService {
  getAvatarColor = (id: string | number, colorPool: string[]) => {
    let hash = 0;
    const idString = String(id);
    for (let i = 0; i < idString.length; i++) {
      hash = idString.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colorPool[Math.abs(hash) % colorPool.length];
  };

  /**
   * Obtiene las iniciales de un nombre (primer nombre + último apellido)
   * Ejemplo: "Juan Carlos Pérez García" -> "JG"
   */
  getInitials = (fullName: string): string => {
    const nameParts = fullName.trim().split(' ').filter(part => part.length > 0);
    
    if (nameParts.length === 0) return '?';
    if (nameParts.length === 1) return nameParts[0][0].toUpperCase();
    
    // Primera inicial del primer nombre + primera inicial del último apellido
    const firstInitial = nameParts[0][0].toUpperCase();
    const lastInitial = nameParts[nameParts.length - 1][0].toUpperCase();
    
    return firstInitial + lastInitial;
  };
}

export default new MiscService();