import React, { useEffect, useState } from 'react';
import { View, Text, TextInput,TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { firestore } from '../firebase';
import {collection,getDocs,query,where,doc,getDoc,setDoc,updateDoc,arrayUnion} from 'firebase/firestore';
import colors from '../assets/colors/colors';

const DziekanatEkran = () => {
  const [studentEmail, setStudentEmail] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [groupName, setGroupName] = useState('');
  const [allGroups, setAllGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');

  useEffect(() => {
    const fetchGroups = async () => {
      const snapshot = await getDocs(collection(firestore, 'groups'));
      const groupNames = snapshot.docs.map(doc => doc.id);
      setAllGroups(groupNames);
    };
    const fetchStudents = async () => {
        const q = query(collection(firestore, 'users'), where('role', '==', 'student'));
        const snapshot = await getDocs(q);
        const studentList = snapshot.docs.map(doc => ({
          id: doc.id,
          email: doc.data().email,
        }));
        setStudents(studentList);
    };

    const fetchTeachers = async () => {
        const q = query(collection(firestore, 'users'), where('role', '==', 'prowadzacy'));
        const snapshot = await getDocs(q);
        const teacherList = snapshot.docs.map(doc => ({
          id: doc.id,
          email: doc.data().email,
        }));
        setTeachers(teacherList);
      };

    fetchTeachers();

    fetchStudents();

    fetchGroups();
  }, []);

  const createGroup = async () => {
    try {
      const groupRef = doc(firestore, 'groups', newGroupName);
      const docSnap = await getDoc(groupRef);

      if (docSnap.exists()) {
        return Alert.alert('Błąd', 'Grupa o tej nazwie już istnieje.');
      }

      await setDoc(groupRef, {
        name: newGroupName,
        students: [],
        teachers: []
      });

      setAllGroups(prev => [...prev, newGroupName]);
      setNewGroupName('');
      Alert.alert('Sukces', `Grupa ${newGroupName} została utworzona.`);
    } catch (error) {
      Alert.alert('Błąd', error.message);
    }
  };

  const assignStudentToGroup = async () => {
    try {
      if (!groupName || !selectedStudentId)
        return Alert.alert('Błąd', 'Wybierz grupę i studenta.');
  
      const groupRef = doc(firestore, 'groups', groupName);
      const groupDoc = await getDoc(groupRef);
      if (!groupDoc.exists()) return Alert.alert('Błąd', 'Grupa nie istnieje.');
  
      await updateDoc(doc(firestore, 'users', selectedStudentId), { group: groupName });
      await updateDoc(groupRef, { students: arrayUnion(selectedStudentId) });
  
      Alert.alert('Sukces', `Student przypisany do grupy ${groupName}`);
    } catch (error) {
      Alert.alert('Błąd', error.message);
    }
  };

  const assignTeacherToGroup = async () => {
  try {
    if (!groupName || !selectedTeacherId)
      return Alert.alert('Błąd', 'Wybierz grupę i prowadzącego.');

    const groupRef = doc(firestore, 'groups', groupName);
    const groupDoc = await getDoc(groupRef);
    if (!groupDoc.exists()) return Alert.alert('Błąd', 'Grupa nie istnieje.');

    await updateDoc(doc(firestore, 'users', selectedTeacherId), { group: groupName });
    await updateDoc(groupRef, { prowadzacy: arrayUnion(selectedTeacherId) });

    Alert.alert('Sukces', `Prowadzący przypisany do grupy ${groupName}`);
  } catch (error) {
    Alert.alert('Błąd', error.message);
  }
};

  return (
    <ScrollView style={styles.container}>
      <View style={styles.wrapper}>
      <Text style={styles.sectionTitle}>Dodaj nową grupę</Text>
      <Text style={styles.sectionSubtitle}>Nadaj nazwę, aby łatwiej zarządzać grupami akademickimi</Text>

      <TextInput
        style={styles.input}
        placeholder="Nowa nazwa grupy"
        value={newGroupName}
        onChangeText={setNewGroupName}
      />

      {newGroupName.length === 0 && (
        <Text style={styles.errorText}>Nazwa grupy nie może być pusta</Text>
      )}

      <TouchableOpacity
        style={[
          styles.buttonAdd,
          { opacity: newGroupName.length === 0 ? 0.5 : 1 },
        ]}
        onPress={createGroup}
        disabled={newGroupName.length === 0}
      >
        <Text style={styles.buttonText}>Utwórz grupę</Text>
      </TouchableOpacity>
    </View>

    <View style={styles.wrapper}>
      <Text style={styles.sectionTitle}>Wybierz grupę</Text>
      <Text style={styles.sectionSubtitle}>Zdecyduj, do której grupy ma należeć student</Text>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={groupName}
          onValueChange={(itemValue) => setGroupName(itemValue)}
          style={styles.picker}
          dropdownIconColor={colors.fontEN}
        >
          <Picker.Item style={{fontSize:12}} label="-- Wybierz grupę --" value="" />
          {allGroups.map((group) => (
            <Picker.Item style={{fontSize:12}} key={group} label={group} value={group} />
          ))}
        </Picker>
      </View>

      {groupName === '' && (
        <Text style={styles.errorText}>Wybór grupy jest wymagany</Text>
      )}
    </View>

    <View style={styles.wrapper}>
      <Text style={styles.sectionTitle}>Dodaj studenta do grupy</Text>
      <Text style={styles.sectionSubtitle}>Wybierz studenta z listy i przypisz go do wybranej grupy</Text>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedStudentId}
          onValueChange={(itemValue) => setSelectedStudentId(itemValue)}
          style={styles.picker}
          dropdownIconColor={colors.fontEN}
        >
          <Picker.Item style={{fontSize:12}} label="-- Wybierz studenta --" value="" />
          {students.map((student) => (
            <Picker.Item style={{fontSize:12}} key={student.id} label={student.email} value={student.id} />
          ))}
        </Picker>
      </View>

      {selectedStudentId === '' && (
        <Text style={styles.errorText}>Musisz wybrać studenta</Text>
      )}

      <TouchableOpacity
        style={[
          styles.buttonAdd,
          { opacity: selectedStudentId === '' ? 0.5 : 1 },
        ]}
        onPress={assignStudentToGroup}
        disabled={selectedStudentId === ''}
      >
        <Text style={styles.buttonText}>Dodaj studenta</Text>
      </TouchableOpacity>
    </View>

    <View style={styles.wrapper}>
      <Text style={styles.sectionTitle}>Dodaj prowadzącego do grupy</Text>
      <Text style={styles.sectionSubtitle}>Wybierz osobę prowadzącą i przypisz ją do wybranej grupy</Text>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedTeacherId}
          onValueChange={(itemValue) => setSelectedTeacherId(itemValue)}
          style={styles.picker}
          dropdownIconColor={colors.fontEN}
        >
          <Picker.Item style={{fontSize:12}} label="-- Wybierz prowadzącego --" value="" />
          {teachers.map((teacher) => (
            <Picker.Item style={{fontSize:12}} key={teacher.id} label={teacher.email} value={teacher.id} />
          ))}
        </Picker>
      </View>

      {selectedTeacherId === '' && (
        <Text style={styles.errorText}>Wybór prowadzącego jest wymagany</Text>
      )}

      <TouchableOpacity
        style={[
          styles.buttonAdd,
          { opacity: selectedTeacherId === '' ? 0.5 : 1 },
        ]}
        onPress={assignTeacherToGroup}
        disabled={selectedTeacherId === ''}
      >
        <Text style={styles.buttonText}>Dodaj prowadzącego</Text>
      </TouchableOpacity>
    </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    marginVertical:20 
  },
  title: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginVertical: 10,
    color: colors.darkFont
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
    width: '100%',
    fontSize: 14,
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
  },
  
  buttonText: {
    color: colors.lightWhite,
    fontSize: 14,
    fontWeight: '600',
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
    overflow: 'hidden',
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  
  picker: {
    height: 48,
    width: '100%',
    paddingHorizontal: 10,
  },
  
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 5,
  },
  
});

export default DziekanatEkran;
