import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    StyleSheet,
    SafeAreaView
} from 'react-native';
import { api } from '../../serwisy/api';
import { useFocusEffect } from '@react-navigation/native';
import localStyles from './styles';
import colors from '../../assets/colors/colors';

export default function ZarzadzajStudentamiGrupyScreen({ route, navigation }) {
    const { groupId, groupName, action } = route.params;
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [groupStudentsIds, setGroupStudentsIds] = useState([]);

    useEffect(() => {
        navigation.setOptions({ title: `${action === 'add' ? 'Dodaj do' : 'Usuń z'} "${groupName}"` });
    }, [navigation, groupName, action]);

    useFocusEffect(
        useCallback(() => {
            const fetchData = async () => {
                try {
                    setIsLoading(true);
                    const groupRes = await api.get(`grupy/${groupId}`);
                    const currentStudentIds = groupRes?.data?.studentsIds || groupRes?.studentsIds || []; 
                    setGroupStudentsIds(currentStudentIds);

                    const allUsersRes = await api.get('uzytkownicy/');
                    const allStudents = (allUsersRes?.data || allUsersRes).filter(user => user.role === 'student');

                    if (action === 'add') {
                        const studentsToAdd = allStudents.filter(s => !currentStudentIds.includes(s.uid));
                        setStudents(studentsToAdd);
                    } else {
                        const studentsToRemove = allStudents.filter(s => currentStudentIds.includes(s.uid));
                        setStudents(studentsToRemove);
                    }
                } catch (error) {
                    console.error("Błąd podczas pobierania danych studentów:", error);
                    Alert.alert("Błąd", "Nie udało się pobrać danych studentów.");
                } finally {
                    setIsLoading(false);
                }
            };
            fetchData();
        }, [groupId, action])
    );

    const handleStudentAction = async (studentId, studentName) => {
        setIsLoading(true);

        try {
            if (action === 'add') {
                await api.post(`grupy/${groupId}/studenci/${studentId}`);
            } else { 
                await api.delete(`grupy/${groupId}/studenci/${studentId}`);
            }

            Alert.alert("Sukces", `Student ${studentName} został ${action === 'add' ? 'dodany do' : 'usunięty z'} grupy.`);
            
            if (action === 'add') {
                setGroupStudentsIds(prevIds => [...prevIds, studentId]);
                setStudents(prevStudents => prevStudents.filter(s => s.uid !== studentId));
            } else {
                setGroupStudentsIds(prevIds => prevIds.filter(id => id !== studentId));
                setStudents(prevStudents => prevStudents.filter(s => s.uid !== studentId));
            }
            navigation.goBack(); 
        } catch (error) {
            console.error(`Błąd podczas ${action === 'add' ? 'dodawania' : 'usuwania'} studenta:`, error);
            Alert.alert("Błąd", `Nie udało się ${action === 'add' ? 'dodać' : 'usunąć'} studenta.`);
        } finally {
            setIsLoading(false);
        }
    };

    const renderStudentItem = ({ item }) => (
        <TouchableOpacity 
            style={localStyles.userItem}
            onPress={() => handleStudentAction(item.uid, `${item.name || ''} ${item.surname || ''}`.trim())}
        >
            <View style={localStyles.userInfoRow}>
                <Text style={localStyles.userName}>{`${item.name || ''} ${item.surname || ''}`.trim()} ({item.email})</Text>
                <Text style={[localStyles.actionText, action === 'add' ? localStyles.addText : localStyles.removeText]}>
                    {action === 'add' ? 'Dodaj' : 'Usuń'}
                </Text>
            </View>
        </TouchableOpacity>
    );

    if (isLoading && students.length === 0) {
        return (
            <SafeAreaView style={[localStyles.safeArea, localStyles.centered]}>
                <ActivityIndicator size="large" color={colors.primary || '#0000ff'} />
                <Text style={localStyles.loadingText}>Ładowanie studentów...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={localStyles.safeArea}>
            <View style={localStyles.container}>
                {students.length === 0 && !isLoading ? (
                    <View style={localStyles.centered}>
                        <Text style={localStyles.noUsersText}>Brak studentów do {action === 'add' ? 'dodania' : 'usunięcia'}.</Text>
                    </View>
                ) : (
                    <FlatList
                        data={students}
                        renderItem={renderStudentItem}
                        keyExtractor={item => item.uid.toString()}
                        extraData={isLoading}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}