import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity,Dimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { firestore } from '../firebase';
import {collection,doc,getDoc,getDocs,updateDoc,query,where} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import colors from '../assets/colors/colors';
import { useNavigation } from '@react-navigation/native'; 
const window = Dimensions.get("window");

const ProwadzacyEkran = () => {
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [gradeToAdd, setGradeToAdd] = useState('');

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
      fetchSubjects(currentUser.uid);
    }
  }, [currentUser]);

  const fetchSubjects = async (teacherId) => {
    try {
      const q = query(collection(firestore, 'subjects'), where('teachers', 'array-contains', teacherId));
      const querySnapshot = await getDocs(q);
      const subjectsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        students: doc.data().students || []  
      }));
      setSubjects(subjectsList);
    } catch (err) {
      Alert.alert('Błąd', 'Nie udało się pobrać przedmiotów.');
    }
  };

  const fetchStudentsForSubject = async (subjectId) => {
    try {
      const subject = subjects.find(s => s.id === subjectId);
      if (!subject) return;

      const studentPromises = subject.students.map(studentId =>
        getDoc(doc(firestore, 'users', studentId))
      );

      const studentDocs = await Promise.all(studentPromises);
      const studentsList = studentDocs
        .filter(doc => doc.exists())
        .map(doc => ({
          id: doc.id,
          email: doc.data().email
        }));

      setStudents(studentsList);
    } catch (err) {
      Alert.alert('Błąd', 'Nie udało się pobrać studentów.');
    }
  };

  const handleSubjectChange = (subjectId) => {
    setSelectedSubjectId(subjectId);
    setSelectedStudentId('');
    setGradeToAdd('');
    fetchStudentsForSubject(subjectId);
  };

  const addGrade = async () => {
    try {
      if (!selectedSubjectId || !selectedStudentId || gradeToAdd === '')
        return Alert.alert('Błąd', 'Uzupełnij wszystkie pola.');
  
      const grade = parseFloat(gradeToAdd);
      if (isNaN(grade)) return Alert.alert('Błąd', 'Ocena musi być liczbą.');
  
      const subjectRef = doc(firestore, 'subjects', selectedSubjectId);
      const subjectSnap = await getDoc(subjectRef);
  
      if (!subjectSnap.exists()) {
        return Alert.alert('Błąd', 'Nie znaleziono przedmiotu.');
      }
  
      const subjectData = subjectSnap.data();
      const existingGrades = subjectData.grades || {};
  
      const studentGrades = existingGrades[selectedStudentId] || [];
      studentGrades.push(grade);
  
      await updateDoc(subjectRef, {
        [`grades.${selectedStudentId}`]: studentGrades,
      });
  
      setGradeToAdd('');
      Alert.alert('Sukces', 'Ocena została dodana.');
    } catch (err) {
      console.error(err);
      Alert.alert('Błąd', 'Nie udało się dodać oceny.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
        <Text style={styles.sectionTitle}>Twoje przedmioty</Text>
        <Text style={styles.sectionSubtitle}>Wybierz przedmiot, w którym oceniasz</Text>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedSubjectId}
            onValueChange={handleSubjectChange}
            style={styles.picker}
            dropdownIconColor={colors.fontEN}
          >
            <Picker.Item style={{fontSize:12}} label="-- Wybierz przedmiot --" value="" />
            {subjects.map(subject => (
              <Picker.Item style={{fontSize:12}} key={subject.id} label={subject.name} value={subject.id} />
            ))}
          </Picker>
        </View>
      </View>

    {selectedSubjectId !== '' && (
      <>
        <View style={styles.wrapper}>
          <Text style={styles.sectionTitle}>Studenci przypisani</Text>
          <Text style={styles.sectionSubtitle}>Wybierz studenta, którego chcesz ocenić</Text>

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedStudentId}
              onValueChange={setSelectedStudentId}
              style={styles.picker}
              dropdownIconColor={colors.fontEN}
            >
              <Picker.Item style={{fontSize:12}} label="-- Wybierz studenta --" value="" />
              {students.map(student => (
                <Picker.Item style={{fontSize:12}} key={student.id} label={student.email} value={student.id} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.wrapper}>
          <Text style={styles.sectionTitle}>Dodaj ocenę</Text>
          <Text style={styles.sectionSubtitle}>Wprowadź ocenę liczbową dla wybranego studenta</Text>

          <TextInput
            style={styles.input}
            placeholder="Wpisz ocenę (np. 5.0)"
            value={gradeToAdd}
            onChangeText={setGradeToAdd}
            keyboardType="numeric"
          />

          <TouchableOpacity
            style={[
              styles.buttonAdd,
              {
                opacity: selectedStudentId === '' || gradeToAdd === '' ? 0.5 : 1,
              },
            ]}
            onPress={addGrade}
            disabled={selectedStudentId === '' || gradeToAdd === ''}
          >
            <Text style={styles.buttonText}>Dodaj ocenę</Text>
          </TouchableOpacity>
        </View>
      </>
    )}
    <View style={{alignItems:'center', paddingVertical:20}}>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Wyloguj</Text>
      </TouchableOpacity>
    </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingTop: 20 },
  wrapper: {
    backgroundColor: colors.lightWhite,
    borderRadius: 15,
    padding: 20,
    borderColor: colors.darkFont,
    borderWidth: 1.5,
    marginVertical: 15,
    width: '90%',
    alignSelf: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: colors.darkFont,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  picker: {
    height: 48,
    width: '100%',
    paddingHorizontal: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  buttonAdd: {
    backgroundColor: colors.fontEN,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    alignSelf: 'center',
  },
  buttonText: {
    color: colors.lightWhite,
    fontSize: 14,
    fontWeight: '600',
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
