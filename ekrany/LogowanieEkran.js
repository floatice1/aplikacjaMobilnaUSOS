import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert,ScrollView,Platform, KeyboardAvoidingView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { auth,firestore } from '../firebase'
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import colors from '../assets/colors/colors';

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
          const daneUzytkownika = await signInWithEmailAndPassword(auth, email, haslo);
          const uzytkownik = daneUzytkownika.user;
          console.log('Logowany użytkownik:', uzytkownik.email);
    
          const docRef = doc(firestore, 'users', uzytkownik.uid);
          const docSnap = await getDoc(docRef);
    
          if (docSnap.exists()) {
            const userData = docSnap.data();
            const userRole = userData.role;
    
            if (userRole === 'admin') {
              nawigacja.replace('AdminEkran');
            } else if (userRole === 'prowadzacy') {
              nawigacja.replace('ProwadzacyEkran'); 
            } else if (userRole === 'dziekanat') {
              nawigacja.replace('DziekanatNavigation');
            }else if (userRole === 'student') {
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
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
        <Text style={styles.logo}>Usos</Text>

        <View style={styles.formCard}>
          <TextInput
            placeholder="Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={text => setEmail(text)}
            style={styles.input}
          />
          <TextInput
            placeholder="Hasło"
            placeholderTextColor="#999"
            value={haslo}
            onChangeText={text => setHaslo(text)}
            style={styles.input}
            secureTextEntry
          />

          <TouchableOpacity onPress={zalogujUzytkownika} style={styles.loginButton}>
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
                placeholderTextColor="#999"
                value={resetEmail}
                onChangeText={setResetEmail}
                style={styles.input}
              />
              <TouchableOpacity onPress={resetHaslo} style={styles.resetButton}>
                <Text style={styles.resetButtonText}>Resetuj hasło</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setPokazResetowanieHasla(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Anuluj</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Nie masz konta?</Text>
          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => nawigacja.navigate('Rejestracja')}
          >
            <Text style={styles.registerButtonText}>Zarejestruj się</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    )
}

export default LogowanieEkran

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },  
  logo: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.darkYellow,
    marginBottom: 30,
  },
  formCard: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  input: {
    backgroundColor: '#F4F4F4',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 12,
    color: '#000',
  },
  loginButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 15,
    borderRadius: 50,
    alignItems: 'center',
    marginBottom: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resetPasswordButton: {
    marginTop: 5,
    alignItems: 'center',
  },
  resetPasswordText: {
    color: colors.fontEN,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  resetPasswordContainer: {
    marginTop: 15,
  },
  resetButton: {
    backgroundColor: '#FF9500',
    paddingVertical: 12,
    borderRadius: 50,
    alignItems: 'center',
    marginTop: 10,
  },
  resetButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.darkFont,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  registerContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  registerText: {
    color: colors.darkFont,
    fontSize: 14,
    marginTop: 10,
  },
  registerButton: {
    backgroundColor: colors.fontEN,
    paddingVertical: 15,
    borderRadius: 50,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 20,
    width: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  registerButtonText: {
    color: colors.lightWhite,
    fontSize: 16,
    fontWeight: 'bold',
  },
});