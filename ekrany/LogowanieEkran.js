import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../firebase';
import { signInWithCustomToken, sendPasswordResetEmail } from 'firebase/auth';
import colors from '../assets/colors/colors';
import { api } from '../serwisy/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const LogowanieEkran = () => {
  const [email, setEmail] = useState('');
  const [haslo, setHaslo] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [pokazResetowanieHasla, setPokazResetowanieHasla] = useState(false);
  const nawigacja = useNavigation();

  const zalogujUzytkownika = async () => {
      if (!email || !haslo) {
          Alert.alert('Błąd', 'Proszę wypełnić pola email i hasło.');
          return;
      }
      try {
          const response = await api.post('auth/login', {
              email: email,
              haslo: haslo
          });

          const { token } = response;
          if (!token) {
              Alert.alert('Błąd', 'Nie otrzymano tokena autoryzacyjnego.');
              return;
          }

          const userCredential = await signInWithCustomToken(auth, token);
          const idToken = await userCredential.user.getIdToken();
          await AsyncStorage.setItem('authToken', idToken);

          const userData = userCredential.user;
          const idTokenResult = await userData.getIdTokenResult();
          const userRole = idTokenResult.claims['role'];

          console.log('Rola użytkownika:', userRole);

          if (userRole === 'wykladowca') { 
              nawigacja.replace('ProwadzacyEkran');
          } else if (userRole === 'dziekanat') {
              nawigacja.replace('DziekanatNavigation');
          } else if (userRole === 'student') {
              nawigacja.replace('GlownyEkran');
          } else {
              Alert.alert('Błąd', 'Nieznana rola użytkownika. Skontaktuj się z administratorem.');
              nawigacja.replace('TabNavigation');
          }
      } catch (error) {
          console.error("Login Error:", error);
          let errorMessage = "Wystąpił błąd podczas logowania.";
          if (error.response && error.response.data && error.response.data.detail) {
              errorMessage = error.response.data.detail;
          } else if (error.code) {
              switch (error.code) {
                  case 'auth/invalid-custom-token':
                      errorMessage = 'Token autoryzacyjny jest nieprawidłowy lub wygasł.';
                      break;
                  case 'auth/network-request-failed':
                      errorMessage = 'Błąd sieci. Sprawdź połączenie internetowe.';
                      break;
                  default:
                      errorMessage = `Błąd logowania: ${error.message}`;
              }
          } else if (error.message) {
              errorMessage = error.message;
          }
          Alert.alert('Błąd logowania', errorMessage);
      }
  };

  const resetHaslo = () => {
      if (!resetEmail.trim()) {
          Alert.alert('Błąd', 'Musisz podać adres email do zresetowania hasła.');
          return;
      }
      sendPasswordResetEmail(auth, resetEmail)
          .then(() => {
              Alert.alert('Sukces', 'Link do resetowania hasła został wysłany na Twój adres email (jeśli konto istnieje).');
              setPokazResetowanieHasla(false);
              setResetEmail('');
          })
          .catch(error => {
              console.error('Błąd przy resetowaniu hasła: ', error.message, error.code);
              let resetErrorMessage = 'Nie udało się wysłać linku do resetowania hasła.';
              Alert.alert('Błąd', resetErrorMessage);
          });
  };

  return (
      <SafeAreaView style={styles.safeArea}>
          <StatusBar
              barStyle={Platform.OS === 'ios' ? "dark-content" : "light-content"}
              backgroundColor={colors.statusBarBackground || colors.background || '#FFFFFF'}
          />
          <KeyboardAvoidingView
              style={styles.keyboardAvoidingContainer}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
          >
              <ScrollView
                  contentContainerStyle={styles.scrollContainer}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
              >
                  <Text style={styles.logo}>Usos</Text>

                  <View style={styles.formCard}>
                      <Text style={styles.cardTitle}>Logowanie</Text>
                      <TextInput
                          placeholder="Email"
                          placeholderTextColor={colors.placeholderText || "#A9A9A9"}
                          value={email}
                          onChangeText={text => setEmail(text)}
                          style={styles.input}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          textContentType="emailAddress"
                      />
                      <TextInput
                          placeholder="Hasło"
                          placeholderTextColor={colors.placeholderText || "#A9A9A9"}
                          value={haslo}
                          onChangeText={text => setHaslo(text)}
                          style={styles.input}
                          secureTextEntry
                          textContentType="password"
                      />

                      <TouchableOpacity onPress={zalogujUzytkownika} style={styles.loginButton}>
                          <Text style={styles.loginButtonText}>Zaloguj</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                          onPress={() => setPokazResetowanieHasla(!pokazResetowanieHasla)}
                          style={styles.forgotPasswordButton}
                      >
                          <Text style={styles.forgotPasswordText}>Zapomniałeś hasła?</Text>
                      </TouchableOpacity>

                      {pokazResetowanieHasla && (
                          <View style={styles.resetPasswordSection}>
                              <TextInput
                                  placeholder="Wpisz swój email do resetu"
                                  placeholderTextColor={colors.placeholderText || "#A9A9A9"}
                                  value={resetEmail}
                                  onChangeText={setResetEmail}
                                  style={[styles.input, styles.resetInput]}
                                  keyboardType="email-address"
                                  autoCapitalize="none"
                              />
                              <TouchableOpacity onPress={resetHaslo} style={styles.resetButton}>
                                  <Text style={styles.resetButtonText}>Resetuj hasło</Text>
                              </TouchableOpacity>
                          </View>
                      )}
                  </View>
              </ScrollView>
          </KeyboardAvoidingView>
      </SafeAreaView>
  );
};

export default LogowanieEkran;

const styles = StyleSheet.create({
  safeArea: {
      flex: 1,
      backgroundColor: colors.background || '#F7F9FC',
  },
  keyboardAvoidingContainer: {
      flex: 1,
  },
  scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 30,
  },
  logo: {
      fontSize: width * 0.12,
      fontWeight: 'bold',
      color: colors.darkYellow || '#FFA500',
      marginBottom: 30,
      textAlign: 'center',
  },
  formCard: {
      backgroundColor: colors.cardBackground || '#FFFFFF',
      padding: 25,
      borderRadius: 20,
      width: '100%',
      maxWidth: 400,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.1,
      shadowRadius: 15,
      elevation: 8,
      marginBottom: 30,
  },
  cardTitle: {
      fontSize: 22,
      fontWeight: '600',
      color: colors.darkFont || '#333333',
      marginBottom: 20,
      textAlign: 'center',
  },
  input: {
      backgroundColor: colors.inputBackground || '#F4F4F8',
      paddingVertical: Platform.OS === 'ios' ? 15 : 12,
      paddingHorizontal: 15,
      borderRadius: 10,
      marginBottom: 15,
      fontSize: 16,
      color: colors.inputText || '#000000',
      borderWidth: 1,
      borderColor: colors.inputBorder || '#E0E0E0', 
  },
  loginButton: {
      backgroundColor: colors.primaryAction || '#2ecc71', 
      paddingVertical: 15,
      borderRadius: 25,
      alignItems: 'center',
      marginBottom: 15,
      shadowColor: colors.primaryAction || '#2ecc71',
      shadowOffset: { width: 0, height: 4},
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 4,
  },
  loginButtonText: {
      color: colors.primaryActionText || '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
  },
  forgotPasswordButton: {
      alignSelf: 'center',
      paddingVertical: 8,
  },
  forgotPasswordText: {
      color: colors.linkText || colors.fontEN || '#007AFF',
      fontSize: 14,
  },
  resetPasswordSection: {
      marginTop: 20,
      borderTopWidth: 1,
      borderTopColor: colors.separator || '#EEEEEE',
      paddingTop: 20,
  },
  resetInput: {
      marginBottom: 10,
  },
  resetButton: {
      backgroundColor: colors.secondaryAction || '#FF9500',
      paddingVertical: 12,
      borderRadius: 25,
      alignItems: 'center',
      marginTop: 10,
  },
  resetButtonText: {
      color: colors.secondaryActionText || '#FFFFFF',
      fontWeight: 'bold',
      fontSize: 15,
  },
  registerContainer: {
      marginTop: 20,
      alignItems: 'center',
      paddingBottom: 20,
  },
  registerText: {
      color: colors.secondaryText || colors.darkFont || '#555555',
      fontSize: 14,
      marginBottom: 10,
  },
  registerButton: {
      backgroundColor: colors.tertiaryAction || colors.fontEN || '#007AFF', 
      paddingVertical: 15,
      paddingHorizontal: 30,
      borderRadius: 25,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
  },
  registerButtonText: {
      color: colors.tertiaryActionText || colors.lightWhite || '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
  },
});