import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, Alert, StyleSheet, TouchableOpacity } from 'react-native';
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
import colors from '../assets/colors/colors';

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
    <ScrollView style={styles.container}>
      <View style={styles.wrapper}>
        <Text style={styles.sectionTitle}>Dodaj nowy przedmiot</Text>
        <Text style={styles.sectionSubtitle}>Wprowadź nazwę nowego przedmiotu i zatwierdź</Text>

        <TextInput
          style={styles.input}
          placeholder="Nazwa przedmiotu"
          value={newSubjectName}
          onChangeText={setNewSubjectName}
        />

        {newSubjectName === '' && (
          <Text style={styles.errorText}>Nazwa przedmiotu jest wymagana</Text>
        )}

        <TouchableOpacity
          style={[styles.buttonAdd, { opacity: newSubjectName === '' ? 0.5 : 1 }]}
          onPress={addSubject}
          disabled={newSubjectName === ''}
        >
          <Text style={styles.buttonText}>Dodaj przedmiot</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.wrapper}>
        <Text style={styles.sectionTitle}>Wybierz studenta</Text>
        <Text style={styles.sectionSubtitle}>Zdecyduj, którego studenta przypisać</Text>

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

        {selectedStudentId === '' && (
          <Text style={styles.errorText}>Wybór studenta jest wymagany</Text>
        )}
      </View>

      <View style={styles.wrapper}>
        <Text style={styles.sectionTitle}>Wybierz przedmiot</Text>
        <Text style={styles.sectionSubtitle}>Wybierz przedmiot, do którego przypisać studenta</Text>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedSubjectId}
            onValueChange={setSelectedSubjectId}
            style={styles.picker}
            dropdownIconColor={colors.fontEN}
          >
            <Picker.Item style={{fontSize:12}} label="-- Wybierz przedmiot --" value="" />
            {subjects.map(subject => (
              <Picker.Item style={{fontSize:12}} key={subject.id} label={subject.name} value={subject.id} />
            ))}
          </Picker>
        </View>

        {selectedSubjectId === '' && (
          <Text style={styles.errorText}>Wybór przedmiotu jest wymagany</Text>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.buttonAdd,
          { opacity: selectedStudentId === '' || selectedSubjectId === '' ? 0.5 : 1 },
        ]}
        onPress={assignStudentToSubject}
        disabled={selectedStudentId === '' || selectedSubjectId === ''}
      >
        <Text style={styles.buttonText}>Przypisz studenta do przedmiotu</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container:{
    marginTop:25
  },
  wrapper: {
    backgroundColor: colors.lightWhite,
    borderRadius: 15,
    padding: 20,
    borderColor: colors.darkFont,
    borderWidth: 1.5,
    marginVertical: 15,
    width: '95%',
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
  
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginVertical: 5,
    fontSize: 14,
    backgroundColor: '#fff',
    minWidth: 300,
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
    marginVertical:10,
    alignSelf: 'center',
  },
  
  buttonText: {
    color: colors.lightWhite,
    fontSize: 14,
    fontWeight: '600',
  },
  
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 5,
  },  
});

export default StudentOcenyEkran;
