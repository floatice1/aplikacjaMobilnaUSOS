import React, {useState, useEffect, useCallback} from 'react'
import { View, TouchableOpacity, Text, ActivityIndicator, SafeAreaView, FlatList, Alert } from 'react-native'
import localStyles from './styles'
import { api } from '../../serwisy/api'
import { TextInput } from 'react-native-gesture-handler';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import colors from '../../assets/colors/colors';

export default function GrupyScreen({ navigation }) {
    const [groupsDetails, setGroupsDetails] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredGroups, setFilteredGroups] = useState([]);
    const [expandedItemId, setExpandedItemId] = useState(null);

    const fetchGroupDetails = async (group) => {
        let subjectName = 'Brak';
        let lecturerName = 'Brak';
        let groupType = 'Nieznany';
        let studentCount = 0;

        try {
            if (group.subjectId) {
                const subjectRes = await api.get(`przedmioty/${group.subjectId}`);
                subjectName = subjectRes?.name || 'Brak';
            }
            if (group.lecturerId) {
                const lecturerRes = await api.get(`uzytkowniki/${group.lecturerId}`);
                lecturerName = lecturerRes ? `${lecturerRes.name || ''}`.trim() : 'Brak';
            }
        } catch (e) {
            console.error(`Nie udało się pobrać szczegółów dla grupy ${group.id}:`, e);
        }

        if (group.name) {
            if (group.name.endsWith('_LAB')) groupType = 'Laboratorium';
            else if (group.name.endsWith('_PRO')) groupType = 'Projekt';
            else if (group.name.endsWith('_WYK')) groupType = 'Wykład';
            else if (group.name.endsWith('_CW')) groupType = 'Ćwiczenia';
        }

        if (group.studentsIds && Array.isArray(group.studentsIds)) {
            studentCount = group.studentsIds.length;
        }

        return {
            ...group,
            subjectName,
            lecturerName,
            groupType,
            studentCount
        };
    };

    useFocusEffect(
        useCallback(() => {
            const fetchGroupsAndDetails = async () => {
                try {
                    setIsLoading(true);
                    const response = await api.get('grupy/');
                    const sortedGroups = response.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                    
                    const detailedGroups = await Promise.all(
                        sortedGroups.map(group => fetchGroupDetails(group))
                    );
                    setGroupsDetails(detailedGroups);
                } catch (e) {
                    console.error("Nie udało się pobrać grup lub ich szczegółów:", e);
                    Alert.alert("Błąd", "Nie udało się pobrać danych grup.");
                } finally {
                    setIsLoading(false);
                }
            };

            fetchGroupsAndDetails();
        }, [])
    );

    useEffect(() => {
        let tempFilteredGroups = groupsDetails;

        if (searchQuery) {
            tempFilteredGroups = tempFilteredGroups.filter(group =>
                group.name && group.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredGroups(tempFilteredGroups);
    }, [searchQuery, groupsDetails]);

    const handleAddGroup = () => {
        navigation.navigate('DodajGrupeScreen');
    }

    const handleAddStudentToGroup = (groupId, groupName) => {
        navigation.navigate('ZarzadzajStudentamiGrupyScreen', { groupId, groupName, action: 'add' });
    };

    const handleRemoveStudentFromGroup = (groupId, groupName) => {
        navigation.navigate('ZarzadzajStudentamiGrupyScreen', { groupId, groupName, action: 'remove' });
    };

    const renderGroupItem = ({ item }) => {
        const isExpanded = item.id === expandedItemId;

        const toggleExpand = () => {
            setExpandedItemId(isExpanded ? null : item.id);
        };

        const handleEdit = (groupId) => {
            navigation.navigate('EdytujGrupeScreen', { id: groupId });
        };

        const handleDelete = (groupId, groupName) => {
            Alert.alert(
                "Potwierdź usunięcie",
                `Czy na pewno chcesz usunąć grupę "${groupName}"?`,
                [
                    {
                        text: "Anuluj",
                        onPress: () => console.log("Anulowano usuwanie"),
                        style: "cancel"
                    },
                    { 
                        text: "Usuń", 
                        onPress: async () => {
                            console.log('Usuń grupę:', groupId);
                            try {
                                await api.delete(`grupy/${groupId}`);
                                setGroupsDetails(prevDetails => prevDetails.filter(group => group.id !== groupId));
                            } catch (error) {
                                console.error("Nie udało się usunąć grupy:", error);
                                Alert.alert(
                                    "Błąd",
                                    "Nie udało się usunąć grupy. Spróbuj ponownie później."
                                );
                            }
                        },
                        style: "destructive" 
                    }
                ],
                { cancelable: false }
            );
        };

        return (
            <TouchableOpacity
                style={localStyles.userItem}
                onPress={toggleExpand}
            >
                <Text style={localStyles.userName}>{item.name}</Text>
                {isExpanded && (
                    <View style={localStyles.flexContainer}>
                    <View style={localStyles.expandedUserInfo}>
                        <View style={localStyles.userInfoText}>
                            <View style={localStyles.userInfoRow}>
                                <Text style={localStyles.userInfoText}>Typ: {item.groupType}</Text>
                            </View>
                            <View style={localStyles.userInfoRow}>
                                <Text style={localStyles.userInfoText}>Przedmiot: {item.subjectName}</Text>
                            </View>
                            <View style={localStyles.userInfoRow}>
                                <Text style={localStyles.userInfoText}>Wykładowca: {item.lecturerName}</Text>
                            </View>
                            <View style={localStyles.userInfoRow}>
                                <Text style={localStyles.userInfoText}>Liczba studentów: {item.studentCount}</Text>
                            </View>
                        </View>
                        <View style={localStyles.actionButtonsContainer}>
                                <TouchableOpacity onPress={() => handleEdit(item.id)} style={localStyles.iconButton}>
                                    <FontAwesome name="pencil" size={32} color={colors.background} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDelete(item.id, item.name)} style={[localStyles.iconButton]}>
                                    <FontAwesome name="trash" size={32} color="#2ecc71" />
                                </TouchableOpacity>
                        </View>
                        
                        
                    </View>
                    <View style={localStyles.studentActionButtonsContainer}>
                        <TouchableOpacity onPress={() => handleAddStudentToGroup(item.id, item.name)} style={[localStyles.iconButton, localStyles.StudentButton]}>
                            <MaterialIcons name="person-add" size={32} color={colors.primary} /> 
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleRemoveStudentFromGroup(item.id, item.name)} style={[localStyles.iconButton, localStyles.StudentButton]}>
                            <MaterialIcons name="person-remove" size={32} color={colors.danger} /> 
                        </TouchableOpacity>
                    </View>
                </View>
                )}
            </TouchableOpacity>
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView style={[localStyles.safeArea, localStyles.centered]}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Ładowanie grup...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={localStyles.safeArea}>
            <View style={localStyles.container}>
                <TextInput
                    style={localStyles.searchInput}
                    placeholder="Szukaj grupy po nazwie..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                />

                {filteredGroups.length === 0 && !isLoading ? (
                    <View style={[localStyles.container, localStyles.centered]}>
                        <Text style={localStyles.noUsersText}>Brak grup pasujących do kryteriów.</Text>
                    </View>
                    ) : (
                    <FlatList
                        data={filteredGroups}
                        renderItem={renderGroupItem}
                        keyExtractor={item => item.id}
                    />
                )}
                <TouchableOpacity
                        style={localStyles.addButton}
                        onPress={handleAddGroup}
                    >
                        <Text style={localStyles.addButtonText}>Dodaj grupę</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}