import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView,Platform, KeyboardAvoidingView } from 'react-native';
import React, { useState } from 'react';
import { auth, firestore } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import colors from '../assets/colors/colors';

export default function RejestracjaEkran() {
  const [email, setEmail] = useState('');
  const [haslo, setHaslo] = useState('');
  const [haslo2, setHaslo2] = useState('');

  const nawigacja = useNavigation();

  const rejestracjaUzytk = () => {
    if (haslo !== haslo2) {
      alert("Hasła się nie zgadzają! Proszę spróbować ponownie.");
      return;
    }

    createUserWithEmailAndPassword(auth, email, haslo)
      .then(async (userCredentials) => {
        const uzytkownik = userCredentials.user;
        console.log('Rejestracja za pomocą:', uzytkownik.email);

        await setDoc(doc(firestore, 'users', uzytkownik.uid), {
          email: uzytkownik.email,
          role: 'student', 
        });

        nawigacja.replace('TabNavigation');
      })
      .catch(error => alert(error.message));
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
            onChangeText={(text) => setEmail(text)}
            value={email}
            placeholder="Email"
            placeholderTextColor="#999"
            style={styles.input}
          />
          <TextInput 
            onChangeText={(text) => setHaslo(text)}
            value={haslo}
            placeholder="Hasło"
            placeholderTextColor="#999"
            style={styles.input}
            secureTextEntry
          />
          <TextInput 
            onChangeText={(text) => setHaslo2(text)}
            value={haslo2}
            placeholder="Powtórz hasło"
            placeholderTextColor="#999"
            style={styles.input}
            secureTextEntry
          />
  
          <TouchableOpacity style={styles.registerButton} onPress={rejestracjaUzytk}>
            <Text style={styles.registerButtonText}>Zarejestruj się</Text>
          </TouchableOpacity>
        </View>
  
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Masz już konto?</Text>
          <TouchableOpacity style={styles.loginButton} onPress={() => nawigacja.navigate('Login')}>
            <Text style={styles.loginButtonText}>Zaloguj się</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },  
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
    width:150,
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
    borderRadius: 10,
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
    color: '#666',
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
    marginBottom: 5,
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
