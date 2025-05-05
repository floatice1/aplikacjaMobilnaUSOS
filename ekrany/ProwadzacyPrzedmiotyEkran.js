import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import { firestore } from '../firebase';
import {collection,getDocs,doc,updateDoc,arrayUnion,getDoc} from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';

const ProwadzacyPrzedmiotyEkran = () => {
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  

  

  useEffect(() => {
    const fetchSubjectsAndTeachers = async () => {
      const subjectsSnapshot = await getDocs(collection(firestore, 'subjects'));
      setSubjects(subjectsSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
      })));

      const usersSnapshot = await getDocs(collection(firestore, 'users'));
      const filteredTeachers = usersSnapshot.docs
        .filter(doc => doc.data().role === 'prowadzacy')
        .map(doc => ({ id: doc.id, email: doc.data().email }));
      setTeachers(filteredTeachers);
    };

    fetchSubjectsAndTeachers();
  }, []);

  const assignTeacherToSubject = async () => {
    try {
      if (!selectedTeacherId || !selectedSubjectId) {
        return Alert.alert('Błąd', 'Wybierz prowadzącego i przedmiot.');
      }

      const subjectRef = doc(firestore, 'subjects', selectedSubjectId);
      const subjectSnap = await getDoc(subjectRef);

      if (!subjectSnap.exists()) {
        return Alert.alert('Błąd', 'Wybrany przedmiot nie istnieje.');
      }

      await updateDoc(subjectRef, {
        teachers: arrayUnion(selectedTeacherId),
      });

      Alert.alert('Sukces', 'Prowadzący został przypisany do przedmiotu.');
    } catch (err) {
      Alert.alert('Błąd', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wybierz prowadzącego</Text>
      <Picker
        selectedValue={selectedTeacherId}
        onValueChange={setSelectedTeacherId}
        style={styles.input}
      >
        <Picker.Item label="-- Wybierz prowadzącego --" value="" />
        {teachers.map(teacher => (
          <Picker.Item key={teacher.id} label={teacher.email} value={teacher.id} />
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

      <Button title="Przypisz prowadzącego" onPress={assignTeacherToSubject} />
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

export default ProwadzacyPrzedmiotyEkran;
