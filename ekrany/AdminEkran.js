import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Alert, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
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
          { text: 'Prowadzący', onPress: () => resolve('prowadzacy') },
          { text: 'Dziekanat', onPress: () => resolve('dziekanat') },
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
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
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
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    alignSelf: 'center',
    marginBottom: 20,
  },
  listContainer: {
    paddingBottom: 80,
  },
  userContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginVertical: 10,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dcdcdc',
  },
  userText: {
    fontSize: 16,
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
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    alignSelf: 'center',
    width: 180,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AdminEkran;
