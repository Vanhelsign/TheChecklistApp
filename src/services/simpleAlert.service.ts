import { Alert, Platform } from 'react-native';

class SimpleAlertService {
  showAlert(title: string, message?: string) {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && typeof window.alert === 'function') {
        window.alert(`${title ? title : ''}${message ? '\n' + message : ''}`);
      } else {
        console.warn('Alert attempt:', title, message);
      }
    } else {
      Alert.alert(title ?? '', message);
    }
  }

  showError(message: string) {
    this.showAlert('Error', message);
  }

  showInfo(message: string) {
    this.showAlert('Info', message);
  }

  showSuccess(message: string) {
    this.showAlert('Éxito', message);
  }
}

export default new SimpleAlertService();