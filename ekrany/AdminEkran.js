import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { auth, firestore } from '../firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const AdminEkran = () => {
  const [users, setUsers] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(firestore, 'users');
        const usersSnapshot = await getDocs(usersCollection);

        const usersList = usersSnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id 
        }));

        const filteredUsers = usersList.filter(user => user.role !== 'admin');

        setUsers(filteredUsers);
      } catch (error) {
        Alert.alert('Błąd', 'Nie udało się załadować użytkowników.');
      }
    };

    fetchUsers();
  }, []);

  const wyloguj = () => {
    auth.signOut()
      .then(() => {
        console.log('Użytkownik wylogował się pomyślnie.');
        navigation.replace('Login'); 
      })
      .catch((error) => alert(error.message)); 
  };

  const handleRoleChange = async (userId, currentRole) => {
    const newRole = await new Promise((resolve) => {
      Alert.alert(
        'Zmień rolę',
        'Wybierz nową rolę:',
        [
          { text: 'Student', onPress: () => resolve('student') },
          { text: 'Prowadzący', onPress: () => resolve('prowadzący') },
          { text: 'Dziekant', onPress: () => resolve('dziekanat') },
        ]
      );
    });
    
    if (newRole) {
      try {
        const userRef = doc(firestore, 'users', userId);
        await updateDoc(userRef, { role: newRole });
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId ? { ...user, role: newRole } : user
          )
        );
      } catch (error) {
        console.error('Błąd przy aktualizacji roli:', error); 
        Alert.alert('Błąd', 'Nie udało się zaktualizować roli.');
      }
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.userContainer}>
      <Text style={styles.userText}>
        {item.email} - {item.role}
      </Text>
      <View style={styles.dotsContainer}>
        <TouchableOpacity
          onPress={() => handleRoleChange(item.id, item.role)}
        >
          <Text style={styles.dots}>•••</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Admin Usos</Text>
      <FlatList
        data={users}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()} 
      />
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={wyloguj}
      >
        <Text style={styles.logoutButtonText}>Wyloguj</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  header: {
    fontSize: 28,  
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  userContainer: {
    backgroundColor: '#f1f1f1',
    padding: 20,
    marginVertical: 12,
    width: '90%',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3498db',
  },
  userText: {
    fontSize: 18,
    color: '#333',
  },
  dotsContainer: {
    flexDirection: 'row', 
    alignItems: 'center',
  },
  dots: {
    fontSize: 24,
    color: '#3498db',
    fontWeight: 'bold',
    padding: 5,
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 5,
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AdminEkran;
