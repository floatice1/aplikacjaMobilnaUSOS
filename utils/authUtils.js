import { Alert } from 'react-native';
import { getAuth } from 'firebase/auth';

export const handleLogout = (navigation) => {
  const auth = getAuth();
  auth.signOut()
    .then(() => {
      console.log('Użytkownik wylogował się pomyślnie.');
      navigation.replace('Login');
    })
    .catch((error) => {
      Alert.alert('Błąd', 'Nie udało się wylogować.');
      console.error('Błąd wylogowania:', error);
    });
};