import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { firestore } from '../firebase';
import {collection,doc,getDoc,getDocs,updateDoc,arrayUnion,query,where} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const ProwadzacyEkran = () => {
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [gradeToAdd, setGradeToAdd] = useState('');

  const auth = getAuth();
  const currentUser = auth.currentUser;

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
      <Text style={styles.title}>Twoje przedmioty</Text>
      <Picker
        selectedValue={selectedSubjectId}
        onValueChange={handleSubjectChange}
        style={styles.input}
      >
        <Picker.Item label="-- Wybierz przedmiot --" value="" />
        {subjects.map(subject => (
          <Picker.Item key={subject.id} label={subject.name} value={subject.id} />
        ))}
      </Picker>

      {selectedSubjectId !== '' && (
        <>
          <Text style={styles.title}>Studenci przypisani do przedmiotu</Text>
          <Picker
            selectedValue={selectedStudentId}
            onValueChange={setSelectedStudentId}
            style={styles.input}
          >
            <Picker.Item label="-- Wybierz studenta --" value="" />
            {students.map(student => (
              <Picker.Item key={student.id} label={student.email} value={student.id} />
            ))}
          </Picker>

          <Text style={styles.title}>Dodaj ocenę</Text>
          <TextInput
            style={styles.input}
            placeholder="Wpisz ocenę (np. 5.0)"
            value={gradeToAdd}
            onChangeText={setGradeToAdd}
            keyboardType="numeric"
          />
          <Button title="Dodaj ocenę" onPress={addGrade} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 18, fontWeight: 'bold', marginVertical: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginVertical: 5,
  },
});

export default ProwadzacyEkran;
