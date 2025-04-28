import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { auth } from '../firebase'
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';


const LogowanieEkran = () => {
    const [email, setEmail] = useState('')
    const [haslo, setHaslo] = useState('')
    const [resetEmail, setResetEmail] = useState('') 
    const [pokazResetowanieHasla, setPokazResetowanieHasla] = useState(false) 
    const nawigacja = useNavigation()

    useEffect(() => {
      const stanLogowania = auth.onAuthStateChanged(uzytkownik => {
        if (uzytkownik) {
          nawigacja.replace("TabNavigation")
        }
      })
      return stanLogowania
    }, [])

    const zalogujUzytkownika = async () => {
        try {
          // Logowanie użytkownika
          const daneUzytkownika = await signInWithEmailAndPassword(auth, email, haslo);
          const uzytkownik = daneUzytkownika.user;
          console.log('Logowany użytkownik:', uzytkownik.email);
    
          // Sprawdzamy rolę użytkownika w Firestore
          const docRef = doc(firestore, 'users', uzytkownik.uid);
          const docSnap = await getDoc(docRef);
    
          if (docSnap.exists()) {
            const userData = docSnap.data();
            const userRole = userData.role;
    
            // Na podstawie roli użytkownika przekierowujemy do odpowiedniego ekranu
            if (userRole === 'admin') {
              // Przekierowanie do ekranu dla administratora
              nawigacja.replace('AdminScreen');
            } else {
              // Przekierowanie do standardowego ekranu
              nawigacja.replace('TabNavigation');
            }
          } else {
            Alert.alert('Błąd', 'Użytkownik nie ma przypisanej roli w systemie.');
          }
        } catch (error) {
          Alert.alert('Błąd', error.message);
        }
      };

    const resetHaslo = () => {
        if (!resetEmail) {
            Alert.alert('Błąd', 'Musisz podać adres email!');
            return;
        }

        sendPasswordResetEmail(auth, resetEmail)
            .then(() => {
                Alert.alert('Sukces', 'Link do resetowania hasła został wysłany na Twój adres email.');
                setPokazResetowanieHasla(false); 
            })
            .catch(error => {
                console.error('Błąd przy resetowaniu hasła: ', error.message);
                Alert.alert('Błąd', 'Nie udało się wysłać linku do resetowania hasła.');
            });
    };

    return (
      <View style={styles.container}>
        <Text style={styles.logo}>Usos</Text>

        <TextInput
            placeholder="Email"
            value={email}
            onChangeText={text => setEmail(text)}
            style={styles.input}
        />
        <TextInput
            placeholder="Hasło"
            value={haslo}
            onChangeText={text => setHaslo(text)}
            style={styles.input}
            secureTextEntry
        />
      
        <TouchableOpacity
            onPress={zalogujUzytkownika}
            style={styles.loginButton}
        >
            <Text style={styles.loginButtonText}>Zaloguj</Text>
        </TouchableOpacity>

        <TouchableOpacity
            onPress={() => setPokazResetowanieHasla(true)} 
            style={styles.resetPasswordButton}
        >
            <Text style={styles.resetPasswordText}>Zapomniałeś hasła?</Text>
        </TouchableOpacity>

        {pokazResetowanieHasla && (
          <View style={styles.resetPasswordContainer}>
            <TextInput
              placeholder="Wpisz swój email"
              value={resetEmail}
              onChangeText={setResetEmail}
              style={styles.input}
            />
            <TouchableOpacity
              onPress={resetHaslo}
              style={styles.loginButton}
            >
                <Text style={styles.loginButtonText}>Resetuj hasło</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setPokazResetowanieHasla(false)} 
              style={styles.cancelButton}
            >
                <Text style={styles.cancelButtonText}>Anuluj</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Nie masz konta?</Text>
            <TouchableOpacity 
                style={styles.registerButton} 
                onPress={() => nawigacja.navigate('Rejestracja')}
            >
                <Text style={styles.registerButtonText}>Zarejestruj się</Text>
            </TouchableOpacity>
        </View>

      </View>
    )
}

export default LogowanieEkran

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#303F9F',
  },
  logo: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 30,
  },
  input: {
    width: 300,
    height: 40,
    backgroundColor: '#ffffff',
    marginBottom: 20,
    color: '#000000',
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  loginButton: {
    backgroundColor: '#2ecc71', 
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resetPasswordButton: {
    marginTop: 10,
    paddingVertical: 10,
  },
  resetPasswordText: {
    color: '#ffffff',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  resetPasswordContainer: {
    width: '80%',
    alignItems: 'center',
    marginTop: 20,
  },
  cancelButton: {
    marginTop: 10,
    paddingVertical: 10,
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20, 
    width: '100%',
  },
  registerText: {
    color: '#ffffff',
    marginRight: 5,
  },
  registerButton: {
    backgroundColor: '#e74c3c', 
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
