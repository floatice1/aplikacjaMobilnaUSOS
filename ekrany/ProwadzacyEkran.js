import React, { useEffect, useState } from 'react';
import {
  View, 
  Text, 
  TextInput, 
  Alert, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions,
  SafeAreaView, // Dodano SafeAreaView
  ScrollView,
  FlatList
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getAuth } from 'firebase/auth';
import colors from '../assets/colors/colors';
import { useNavigation } from '@react-navigation/native'; 
import { api } from '../serwisy/api';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const ProwadzacyEkran = () => {
  const [subjectsWithGroupsAndStudents, setSubjectsWithGroupsAndStudents] = useState([]);
  const [expandedSubjectId, setExpandedSubjectId] = useState(null);
  const [expandedGroupId, setExpandedGroupId] = useState(null);
  const [gradeToAdd, setGradeToAdd] = useState('');
  const [selectedStudentIdForGrade, setSelectedStudentIdForGrade] = useState('');
  const [allGrades, setAllGrades] = useState([]); // Dodano stan do przechowywania wszystkich ocen

  const auth = getAuth();
  const currentUser = auth.currentUser;
  const navigation = useNavigation();

  const handleLogout = () => {
    auth.signOut()
      .then(() => {
        console.log('Użytkownik wylogował się pomyślnie.');
        navigation.replace('Login');
      })
      .catch((error) => {
        Alert.alert('Błąd', 'Nie udało się wylogować.');
        console.log(error);
      });
  };

  useEffect(() => {
    if (currentUser) {
      fetchLecturerData(currentUser.uid);
    }
  }, [currentUser]);

  const fetchLecturerData = async (lecturerId) => {
    try {
      const allSubjects = await api.get('przedmioty/');
      const allGroups = await api.get('grupy/');
      const allUsers = await api.get('uzytkowniki/');
      const fetchedGrades = await api.get('oceny/'); 
      setAllGrades(fetchedGrades); 

      // Najpierw mapujemy wszystkie przedmioty, aby znaleźć grupy prowadzącego
      const processedSubjects = await Promise.all(allSubjects.map(async subject => {
        const subjectGroups = allGroups.filter(group => group.subjectId === subject.id && group.lecturerId === lecturerId);

        // Jeśli nie ma grup dla tego przedmiotu prowadzonych przez tego wykładowcę, zwracamy null lub obiekt z pustą tablicą grup
        if (subjectGroups.length === 0) {
          return {
            id: subject.id,
            name: subject.name,
            groups: [], // Pusta tablica grup
          };
        }

        const groupsWithStudents = await Promise.all(subjectGroups.map(async group => {
          const studentsInGroup = group.studentsIds ? await Promise.all(group.studentsIds.map(async studentId => {
            const studentData = allUsers.find(u => u.uid === studentId);
            // Pobierz oceny dla tego studenta w tej grupie
            const studentGradesObjects = fetchedGrades.filter(g => g.studentId === studentId && g.groupId === group.id);
            return {
              id: studentId,
              name: studentData ? `${studentData.name} ${studentData.surname}` : 'Nieznany student',
              email: studentData ? studentData.email : '',
              grades: studentGradesObjects, // Przechowuj całe obiekty ocen
            };
          })) : [];
          return {
            ...group,
            students: studentsInGroup,
            groupType: group.name.includes('_WYK') ? 'Wykład' : group.name.includes('_CW') ? 'Ćwiczenia' : group.name.includes('_LAB') ? 'Laboratoria' : group.name.includes('_PRO')? 'Projekt' : 'Nieznany typ zajęć',
          };
        }));

        return {
          id: subject.id,
          name: subject.name,
          groups: groupsWithStudents,
        };
      }));

      // Następnie filtrujemy te przedmioty, które mają co najmniej jedną grupę
      const structuredData = processedSubjects.filter(subject => subject.groups.length > 0);

      setSubjectsWithGroupsAndStudents(structuredData);
    } catch (err) {
      Alert.alert('Błąd', 'Nie udało się pobrać danych prowadzącego.');
      console.error('Błąd pobierania danych:', err);
    }
  };

  const toggleSubjectExpansion = (subjectId) => {
    setExpandedSubjectId(expandedSubjectId === subjectId ? null : subjectId);
    setExpandedGroupId(null); // Zwiń grupy przy zmianie przedmiotu
  };

  const toggleGroupExpansion = (groupId) => {
    setExpandedGroupId(expandedGroupId === groupId ? null : groupId);
  };

  const handleAddGrade = async (studentId, groupId, subjectId) => {
    if (!gradeToAdd) {
      Alert.alert('Błąd', 'Wpisz ocenę.');
      return;
    }
    const numericGrade = parseFloat(gradeToAdd);
    if (isNaN(numericGrade) || numericGrade < 2 || numericGrade > 5 || !Number.isInteger(numericGrade * 2)) {
        Alert.alert('Błąd', 'Ocena musi być liczbą od 2 do 5, z dokładnością do 0.5 (np. 2, 2.5, 3, 3.5, 4, 4.5, 5).');
        return;
    }

    try {
      const existingGrade = allGrades.find(g => g.studentId === studentId && g.groupId === groupId);

      const payload = {
        studentId: studentId,
        grupaId: groupId, 
        wystawionePrzez: currentUser.uid, 
        wartoscOceny: numericGrade.toString(),
      };

      if (existingGrade) {
        await api.put(`oceny/${existingGrade.id}`, payload);
        Alert.alert('Sukces', 'Ocena została zaktualizowana.');
      } else {
        await api.post('oceny/', payload);
        Alert.alert('Sukces', 'Ocena została dodana.');
      }
      
      setGradeToAdd('');
      setSelectedStudentIdForGrade('');
      fetchLecturerData(currentUser.uid); 
    } catch (error) {
      console.error('Błąd podczas zapisywania oceny:', error);
      Alert.alert('Błąd', 'Nie udało się zapisać oceny. ' + (error.response?.data?.detail || error.message));
    }
  };


  const renderStudentItem = (student, group) => {
    // Znajdź oceny studenta dla konkretnej grupy
    const currentGroupGrades = student.grades.filter(grade => grade.groupId === group.id);
    const gradeValues = currentGroupGrades.map(g => g.value);

    return (
    <View key={student.id} style={styles.studentCard}>
      <Text style={styles.studentName}>{student.name} ({student.email})</Text>
      {gradeValues.length > 0 ? (
        <Text style={styles.gradesText}>Istniejące oceny: {gradeValues.join(', ')}</Text>
      ) : (
        <Text style={styles.gradesText}>Brak ocen.</Text>
      )}
      <View style={styles.gradeInputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Wpisz ocenę (2-5)"
          placeholderTextColor={colors.mediumGrey}
          value={selectedStudentIdForGrade === student.id ? gradeToAdd : ''}
          onChangeText={(text) => {
            setSelectedStudentIdForGrade(student.id);
            setGradeToAdd(text);
          }}
          keyboardType="numeric"
        />
        <TouchableOpacity
          style={[styles.button, styles.addGradeButton]}
          onPress={() => handleAddGrade(student.id, group.id, group.subjectId)}
        >
          <Text style={styles.buttonText}>Dodaj</Text>
        </TouchableOpacity>
      </View>
    </View>
  );}

  const renderGroupItem = (group) => {
    const isExpanded = expandedGroupId === group.id;
    return (
      <View key={group.id} style={styles.groupContainer}>
        <TouchableOpacity onPress={() => toggleGroupExpansion(group.id)} style={styles.groupHeader}>
          <Text style={styles.groupTitle}>{group.name} ({group.groupType})</Text>
          <MaterialIcons name={isExpanded ? 'expand-less' : 'expand-more'} size={24} color={colors.primary} />
        </TouchableOpacity>
        {isExpanded && (
          <View style={styles.studentsListContainer}>
            {group.students && group.students.length > 0 ? (
              group.students.map(student => renderStudentItem(student, group))
            ) : (
              <Text style={styles.noStudentsText}>Brak studentów w tej grupie.</Text>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderSubjectItem = ({ item: subject }) => {
    const isExpanded = expandedSubjectId === subject.id;
    return (
      <View style={styles.subjectContainer}>
        <TouchableOpacity onPress={() => toggleSubjectExpansion(subject.id)} style={styles.subjectHeader}>
          <Text style={styles.subjectTitle}>{subject.name}</Text>
          <MaterialIcons name={isExpanded ? 'expand-less' : 'expand-more'} size={24} color={colors.primary} />
        </TouchableOpacity>
        {isExpanded && (
          <View style={styles.groupsListContainer}>
            {subject.groups && subject.groups.length > 0 ? (
              subject.groups.map(group => renderGroupItem(group))
            ) : (
              <Text style={styles.noGroupsText}>Brak grup dla tego przedmiotu.</Text>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.appTitle}>Usos</Text>
        <Text style={styles.sectionSubtitle}>Twoje przedmioty i grupy</Text>

        {subjectsWithGroupsAndStudents.length > 0 ? (
          <FlatList
            data={subjectsWithGroupsAndStudents}
            renderItem={renderSubjectItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <Text style={styles.noDataText}>Nie prowadzisz żadnych przedmiotów lub brak danych.</Text>
        )}

<View style={{alignItems:'center', paddingVertical:20}}>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Wyloguj</Text>
      </TouchableOpacity>
    </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 10,
  },
  appTitle: {
    fontSize: width * 0.12, // Responsive font size
      fontWeight: 'bold',
      color: colors.darkYellow || '#FFA500', 
      marginBottom: 30,
      textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: 'gray',
    marginBottom: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  subjectContainer: {
    backgroundColor: colors.lightWhite,
    borderRadius: 10,
    marginBottom: 15,
    borderColor: colors.grey,
    borderWidth: 1,
    overflow: 'hidden',
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: colors.white,
  },
  subjectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  groupsListContainer: {
    paddingHorizontal: 15,
    paddingBottom: 10, 
  },
  groupContainer: { // Kontener dla pojedynczej grupy
    backgroundColor: colors.white, 
    borderRadius: 8,
    paddingVertical: 5, // Mniejszy padding pionowy dla nagłówka grupy
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.lightGrey,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10, // Mniejszy padding dla nagłówka grupy
    paddingVertical: 8,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkFont,
  },
  studentsListContainer: {
    paddingHorizontal: 10, 
    paddingBottom: 10,
  },
  studentCard: {
    backgroundColor: colors.lightWhite, // Lekkie tło dla karty studenta
    borderRadius: 6,
    padding: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.extraLightGrey, // Bardzo jasna ramka
  },
  studentName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.darkFont,
    marginBottom: 5, // Zmniejszony margines dolny
  },
  gradesText: { // Nowy styl dla tekstu ocen
    fontSize: 14,
    color: colors.mediumGrey,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  gradeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  input: {
    flex: 1, // Aby input zajął dostępną przestrzeń
    borderWidth: 1,
    borderColor: colors.lightGrey,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginRight: 10, // Odstęp od przycisku
    backgroundColor: colors.white,
    fontSize: 15,
    color: colors.darkFont,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  addGradeButton: {
    paddingHorizontal: 15, // Mniejszy przycisk dodawania oceny
    paddingVertical: 10,
  },
  buttonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: 'bold',
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 16,
    color: colors.mediumGrey,
    marginTop: 40,
  },
  noGroupsText: {
    textAlign: 'left',
    fontSize: 14,
    fontStyle: 'italic',
    color: colors.mediumGrey,
    paddingVertical: 10, 
  },
  noStudentsText: {
    textAlign: 'left',
    fontSize: 14,
    fontStyle: 'italic',
    color: colors.mediumGrey,
    paddingVertical: 8,
  },
  logoutButton:{
    width:window.width*0.45,
    backgroundColor: '#FF3B30',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: {
    width: 0,
    height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
    alignItems: 'center',
  },
  logoutButtonText:{
      color: colors.lightWhite,
      fontWeight:'bold',
      fontSize: 16,
  },
});

export default ProwadzacyEkran;
