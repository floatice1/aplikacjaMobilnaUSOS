import React, { useEffect, useState } from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { firestore } from '../firebase';
import {collection,getDocs,doc,updateDoc,arrayUnion,getDoc} from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';
import colors from '../assets/colors/colors';

const ProwadzacyPrzedmiotyEkran = () => {
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  
 ///Odświeżanie przedmiotów: po dodaniu nie wyswietlają się w liście do wybrania przedmiotów
  
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
      <View style={styles.wrapper}>
        <Text style={styles.sectionTitle}>Wybierz prowadzącego</Text>
        <Text style={styles.sectionSubtitle}>Wskaż prowadzącego, którego chcesz przypisać</Text>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedTeacherId}
            onValueChange={setSelectedTeacherId}
            style={styles.picker}
            dropdownIconColor={colors.fontEN}
          >
            <Picker.Item style={{fontSize:12}} label="-- Wybierz prowadzącego --" value="" />
            {teachers.map(teacher => (
              <Picker.Item style={{fontSize:12}} key={teacher.id} label={teacher.email} value={teacher.id} />
            ))}
            </Picker>
        </View>

        {selectedTeacherId === '' && (
          <Text style={styles.errorText}>Wybór prowadzącego jest wymagany</Text>
        )}
      </View>

    <View style={styles.wrapper}>
      <Text style={styles.sectionTitle}>Wybierz przedmiot</Text>
      <Text style={styles.sectionSubtitle}>Wybierz przedmiot, do którego przypisać prowadzącego</Text>

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
        { opacity: selectedTeacherId === '' || selectedSubjectId === '' ? 0.5 : 1 },
      ]}
      onPress={assignTeacherToSubject}
      disabled={selectedTeacherId === '' || selectedSubjectId === ''}
    >
      <Text style={styles.buttonText}>Przypisz prowadzącego</Text>
    </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {     
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
    marginVertical: 10,
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

export default ProwadzacyPrzedmiotyEkran;
