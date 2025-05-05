import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import { auth, firestore } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

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
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>Usos</Text>

        <TextInput 
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="Email"
          style={styles.input}
        />
        <TextInput 
          onChangeText={(text) => setHaslo(text)}
          value={haslo}
          placeholder="Hasło"
          style={styles.input}
          secureTextEntry
        />
        <TextInput 
          onChangeText={(text) => setHaslo2(text)}
          value={haslo2}
          placeholder="Powtórz hasło"
          style={styles.input}
          secureTextEntry
        />

        <TouchableOpacity style={styles.registerButton} onPress={rejestracjaUzytk}>
          <Text style={styles.registerButtonText}>Zarejestruj się</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>Masz już konto?</Text>
        <TouchableOpacity style={styles.loginButton} onPress={() => nawigacja.navigate('Login')}>
          <Text style={styles.loginButtonText}>Zaloguj się</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#303F9F', 
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '80%',
  },
  logo: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 40,
    backgroundColor: '#ffffff', 
    marginBottom: 20,
    color: '#000000',
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  registerButton: {
    backgroundColor: '#e74c3c', 
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    marginBottom: 10,
  },
  loginText: {
    color: '#ffffff',
    marginRight: 5,
  },
  loginButton: {
    backgroundColor: '#2ecc71', 
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
