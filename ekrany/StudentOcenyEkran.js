import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { firestore } from '../firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion
} from 'firebase/firestore';

const StudentOcenyEkran = () => {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [gradeToAdd, setGradeToAdd] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      const querySnapshot = await getDocs(collection(firestore, 'users'));
      const filtered = querySnapshot.docs
        .filter(doc => doc.data().role === 'student')
        .map(doc => ({ id: doc.id, email: doc.data().email }));
      setStudents(filtered);
    };

    const fetchSubjects = async () => {
      const querySnapshot = await getDocs(collection(firestore, 'subjects'));
      const list = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
      }));
      setSubjects(list);
    };

    fetchStudents();
    fetchSubjects();
  }, []);

  const addSubject = async () => {
    try {
      if (!newSubjectName) return Alert.alert('Błąd', 'Podaj nazwę przedmiotu.');
      const newDocRef = doc(firestore, 'subjects', newSubjectName);
      const docSnap = await getDoc(newDocRef);

      if (docSnap.exists()) return Alert.alert('Błąd', 'Przedmiot już istnieje.');

      await setDoc(newDocRef, { name: newSubjectName, students: [] });
      setSubjects(prev => [...prev, { id: newSubjectName, name: newSubjectName }]);
      setNewSubjectName('');
      Alert.alert('Sukces', 'Dodano przedmiot.');
    } catch (err) {
      Alert.alert('Błąd', err.message);
    }
  };

  const assignStudentToSubject = async () => {
    try {
      if (!selectedStudentId || !selectedSubjectId)
        return Alert.alert('Błąd', 'Wybierz studenta i przedmiot.');

      const subjectRef = doc(firestore, 'subjects', selectedSubjectId);
      const subjectSnap = await getDoc(subjectRef);
      if (!subjectSnap.exists()) return Alert.alert('Błąd', 'Przedmiot nie istnieje.');

      await updateDoc(subjectRef, {
        students: arrayUnion(selectedStudentId)
      });

      const gradesRef = doc(firestore, 'subjects', selectedSubjectId, 'grades', selectedStudentId);
      const gradesSnap = await getDoc(gradesRef);

      if (!gradesSnap.exists()) {
        await setDoc(gradesRef, {
          studentId: selectedStudentId,
          grades: []
        });
      }

      Alert.alert('Sukces', 'Student przypisany do przedmiotu.');
    } catch (err) {
      Alert.alert('Błąd', err.message);
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dodaj nowy przedmiot</Text>
      <TextInput
        style={styles.input}
        placeholder="Nazwa przedmiotu"
        value={newSubjectName}
        onChangeText={setNewSubjectName}
      />
      <Button title="Dodaj przedmiot" onPress={addSubject} />

      <Text style={styles.title}>Wybierz studenta</Text>
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

      <Text style={styles.title}>Wybierz przedmiot</Text>
      <Picker
        selectedValue={selectedSubjectId}
        onValueChange={setSelectedSubjectId}
        style={styles.input}
      >
        <Picker.Item label="-- Wybierz przedmiot --" value="" />
        {subjects.map(subject => (
          <Picker.Item key={subject.id} label={subject.name} value={subject.id} />
        ))}
      </Picker>

      <Button title="Przypisz studenta do przedmiotu" onPress={assignStudentToSubject} />
      
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

export default StudentOcenyEkran;
