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

  showOptions(
    title: string,
    message: string,
    options: { text: string, style: 'default' | 'cancel' | 'destructive', onPress: () => void }[]) {
    if (Platform.OS === 'web') {
      const optionTexts = options.map((opt, index) => `${index + 1}: ${opt.text}`).join('\n');
      const selectedOption = window.prompt(`${title}\n${message}\n\n${optionTexts}`);
      const selectedIndex = parseInt(selectedOption || '', 10) - 1;
      if (selectedIndex >= 0 && selectedIndex < options.length) {
        options[selectedIndex].onPress();
      }
    } else {
      Alert.alert(title ?? '', message, options.map(opt => ({
        text: opt.text,
        style: opt.style,
        onPress: opt.onPress
      })));
    }
  }
}

export default new SimpleAlertService();