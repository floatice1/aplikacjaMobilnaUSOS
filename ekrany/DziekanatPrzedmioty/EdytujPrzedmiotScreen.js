import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../serwisy/api';
import localStyles from './styles';

export default function EdytujPrzedmiotScreen({ route, navigation }) {
  const { subjectId } = route.params;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubjectData = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`przedmioty/${subjectId}`);
        setName(response.name || '');
        setDescription(response.description || '');
        console.log("Pobrano dane przedmiotu dla ID:", subjectId, response);

      } catch (error) {
        console.error("Nie udało się pobrać danych przedmiotu:", error);
        Alert.alert("Błąd", "Nie udało się pobrać danych przedmiotu.");
      } finally {
        setIsLoading(false);
      }
    };

    if (subjectId) {
      fetchSubjectData();
    }
  }, [subjectId]);

  const handleSaveChanges = async () => {
    try {
      await api.put(`przedmioty/${subjectId}`, {
        nazwa: name,
        opis: description
      });
      
      Alert.alert("Sukces", "Dane przedmiotu zaktualizowane.");
      navigation.goBack();
    } catch (error) {
      console.error("Nie udało się zaktualizować przedmiotu:", error);
      Alert.alert("Błąd", "Nie udało się zaktualizować danych przedmiotu.");
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={localStyles.centered}>
        <Text>Ładowanie danych przedmiotu...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={localStyles.safeArea}>
      <ScrollView>
        <View style={localStyles.container}>
          <View style={localStyles.formContainer}>
            <View style={localStyles.inputContainer}>
              <Text style={localStyles.label}>Nazwa przedmiotu:</Text>
              <TextInput
                style={localStyles.input}
                placeholder="Nazwa przedmiotu"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={localStyles.inputContainer}>
              <Text style={localStyles.label}>Opis przedmiotu:</Text>
              <TextInput
                style={[localStyles.input, { height: 100, textAlignVertical: 'top' }]}
                placeholder="Opis przedmiotu"
                value={description}
                onChangeText={setDescription}
                multiline={true}
                numberOfLines={4}
              />
            </View>

            <TouchableOpacity style={localStyles.addButton} onPress={handleSaveChanges}>
              <Text style={localStyles.addButtonText}>Zapisz Zmiany</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}