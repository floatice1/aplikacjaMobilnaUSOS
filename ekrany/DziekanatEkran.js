import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { firestore } from '../firebase';
import {collection,getDocs,query,where,doc,getDoc,setDoc,updateDoc,arrayUnion} from 'firebase/firestore';

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
    <View style={styles.container}>
      <Text style={styles.title}>Stwórz nową grupę</Text>
      <TextInput
        style={styles.input}
        placeholder="Nowa nazwa grupy"
        value={newGroupName}
        onChangeText={setNewGroupName}
      />
      <Button title="Utwórz grupę" onPress={createGroup} />

      <Text style={styles.title}>Wybierz grupę</Text>
      <Picker
        selectedValue={groupName}
        onValueChange={(itemValue) => setGroupName(itemValue)}
        style={styles.input}
      >
        <Picker.Item label="-- Wybierz grupę --" value="" />
        {allGroups.map((group) => (
          <Picker.Item key={group} label={group} value={group} />
        ))}
      </Picker>

      <Text style={styles.title}>Dodaj studenta do grupy</Text>
      <Picker
        selectedValue={selectedStudentId}
        onValueChange={(itemValue) => setSelectedStudentId(itemValue)}
        style={styles.input}
        >
        <Picker.Item label="-- Wybierz studenta --" value="" />
        {students.map((student) => (
            <Picker.Item key={student.id} label={student.email} value={student.id} />
        ))}
        </Picker>
        <Button title="Dodaj studenta" onPress={assignStudentToGroup} />

        <Text style={styles.title}>Dodaj prowadzącego do grupy</Text>
        <Picker
        selectedValue={selectedTeacherId}
        onValueChange={(itemValue) => setSelectedTeacherId(itemValue)}
        style={styles.input}
        >
        <Picker.Item label="-- Wybierz prowadzącego --" value="" />
        {teachers.map((teacher) => (
            <Picker.Item key={teacher.id} label={teacher.email} value={teacher.id} />
        ))}
        </Picker>
        <Button title="Dodaj prowadzącego" onPress={assignTeacherToGroup} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 18, fontWeight: 'bold', marginVertical: 10 },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 5,
    padding: 10, marginVertical: 5
  },
});

export default DziekanatEkran;
