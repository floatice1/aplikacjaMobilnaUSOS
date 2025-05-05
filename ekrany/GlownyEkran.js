import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, TouchableOpacity } from 'react-native';
import { firestore } from '../firebase';
import { getAuth } from 'firebase/auth';
import { collection, doc, getDocs, query, where } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native'; 

const GlownyEkran = () => {
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const navigation = useNavigation();

  useEffect(() => {
    if (currentUser) {
      fetchSubjectsAndGrades(currentUser.uid);
    }
  }, [currentUser]);

  const fetchSubjectsAndGrades = async (studentId) => {
    try {
      const q = query(collection(firestore, 'subjects'), where('students', 'array-contains', studentId));
      const querySnapshot = await getDocs(q);
      
      const subjectsList = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Przedmiot:', data.name, 'Oceny:', data.grades);
        return {
          id: doc.id,
          name: data.name,
          grades: data.grades[studentId] || [] 
        };
      });
  
      setSubjects(subjectsList);
    } catch (err) {
      Alert.alert('Błąd', 'Nie udało się pobrać przedmiotów i ocen.');
    }
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.row}>
        <Text style={styles.cell}>{item.name}</Text>
        <Text style={styles.cell}>
          {(Array.isArray(item.grades) && item.grades.length > 0) ? item.grades.join(', ') : 'Brak ocen'}
        </Text>
      </View>
    );
  };
  const handleLogout = () => {
    auth.signOut()
      .then(() => {
        console.log('Użytkownik wylogował się pomyślnie.');
        navigation.replace('Login');
      })
      .catch((error) => {
        Alert.alert('Błąd', 'Nie udało się wylogować.');
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Usos</Text>

      <FlatList
        data={subjects}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListHeaderComponent={<Text style={styles.subtitle}>Twoje przedmioty i oceny</Text>}
      />

      {/* Przycisk Wyloguj */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Wyloguj</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#303F9F',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#303F9F',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  cell: {
    fontSize: 16,
    color: '#303F9F',
    flex: 1,
    textAlign: 'center',
  },
  logoutButton: {
    marginTop: 20,
    paddingVertical: 10,
    backgroundColor: '#f39c12',
    borderRadius: 5,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default GlownyEkran;
