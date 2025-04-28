import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../firebase';
const GlownyEkran = () => {
  const navigation = useNavigation();

  const goToLoginScreen = () => {
    navigation.replace('Login'); 
  };

  const wyloguj = () => {
    auth.signOut()
      .then(() => {
        console.log('Użytkownik wylogował się pomyślnie.');
        navigation.replace('Login'); 
      })
      .catch((error) => alert(error.message)); 
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Usos</Text>

   
      <TouchableOpacity
        style={styles.loginButton}
        onPress={goToLoginScreen}
      >
        <Text style={styles.loginButtonText}>Przejdź do logowania</Text>
      </TouchableOpacity>

    
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={wyloguj} 
      >
        <Text style={styles.logoutButtonText}>Wyloguj</Text>
      </TouchableOpacity>
    </View>
  );
};

export default GlownyEkran;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#303F9F',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 20,
  },
  loginButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#e74c3c', 
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#f39c12', 
    borderRadius: 5,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
