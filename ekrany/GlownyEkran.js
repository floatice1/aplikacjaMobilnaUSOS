import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, TouchableOpacity } from 'react-native';
import { firestore } from '../firebase';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native'; 
import colors from '../assets/colors/colors';

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
      <Text style={styles.appTitle}>Usos</Text>
      <Text style={styles.sectionSubtitle}>Twoje przedmioty i oceny</Text>

      {subjects.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <View style={styles.gradeRow}>
            {item.grades.length > 0 ? (
              item.grades.map((grade, index) => (
                <View key={index} style={styles.gradeBox}>
                  <Text style={styles.gradeText}>{grade}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noGradesText}>Brak ocen</Text>
            )}
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Wyloguj</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 30,
    paddingHorizontal:10,
    backgroundColor: '#f4f4f4',
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.darkYellow,
    textAlign: 'center',
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  card: {
    backgroundColor: colors.lightWhite,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderColor: colors.darkFont,
    borderWidth: 1.2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.fontEN,
    marginBottom: 10,
  },
  gradeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gradeBox: {
    backgroundColor: '#E3E3E3',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 6,
  },
  gradeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  noGradesText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#999',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 15,
    borderRadius: 50,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 20,
    width: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  logoutButtonText: {
    color: colors.lightWhite,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GlownyEkran;
