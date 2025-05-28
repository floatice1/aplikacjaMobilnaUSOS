import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../serwisy/api';
import { Picker } from '@react-native-picker/picker';
import localStyles from './styles';

export default function EdytUzytScreen({ route, navigation }) {
  const { userId } = route.params;

  const [imie, setImie] = useState('');
  const [rola, setRola] = useState('');
  const [email, setEmail] = useState('');
  const [haslo, setHaslo] = useState('');

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`uzytkownicy/${userId}`);
        setImie(response.name || '');
        setEmail(response.email || '');
        setRola(response.role || '');
        console.log("Fetched user data for ID:", userId, response);

      } catch (error) {
        console.error("Failed to fetch user data:", error);
        Alert.alert("Błąd", "Nie udało się pobrać danych użytkownika.");
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const handleSaveChanges = async () => {
    try {
      await api.put(`uzytkownicy/${userId}`, {
        imie: imie,
        rola: rola,
        email: email,
        ...(haslo !== '' ? { haslo } : {}),
      });
      
      Alert.alert("Sukces", "Dane użytkownika zaktualizowane.");
      navigation.goBack();
    } catch (error) {
      console.error("Failed to update user:", error);
      Alert.alert("Błąd", "Nie udało się zaktualizować danych użytkownika.");
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={localStyles.centered}>
        <Text>Ładowanie danych użytkownika...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={localStyles.safeArea}>
      <View style={localStyles.container}>
        <View style={localStyles.formContainer}>
          <View style={localStyles.inputContainer}>
            <Text style={localStyles.label}>Imię:</Text>
            <TextInput
              style={localStyles.input}
              placeholder="Imię"
              value={imie}
              onChangeText={setImie}
            />
          </View>

          <View style={localStyles.inputContainer}>
            <Text style={localStyles.label}>Email:</Text>
            <TextInput
              style={localStyles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={localStyles.inputContainer}>
              <Text style={localStyles.label}>Nowe Hasło (opcjonalnie):</Text>
              <TextInput
                  style={localStyles.input}
                  placeholder="Wprowadź nowe hasło"
                  value={haslo}
                  onChangeText={setHaslo}
                  secureTextEntry={true}
              />
          </View>

          <View style={localStyles.inputContainer}>
              <Text style={localStyles.label}>Rola:</Text>
              <Picker
                  style={localStyles.input}
                  selectedValue={rola}
                  onValueChange={(itemValue) => setRola(itemValue)}
              >
                  <Picker.Item label="Dziekanat" value="dziekanat" />
                  <Picker.Item label="Student" value="student" />
                  <Picker.Item label="Wykladowca" value="wykladowca" />
              </Picker>
          </View>

          <TouchableOpacity style={localStyles.addButton} onPress={handleSaveChanges}>
            <Text style={localStyles.addButtonText}>Zapisz Zmiany</Text>
          </TouchableOpacity>

        </View>
      </View>
    </SafeAreaView>
  );
}