import React, {useState, useEffect, useCallback} from 'react'
import { View, TouchableOpacity, Text, ActivityIndicator, SafeAreaView, FlatList, Alert } from 'react-native'
import localStyles from './styles'
import { api } from '../../serwisy/api'
import { TextInput } from 'react-native-gesture-handler';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import colors from '../../assets/colors/colors';

const ROLES = ['student', 'wykladowca', 'dziekanat', 'wszyscy'];

export default function DziekanatUzytkownicy({ navigation }) {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [selectedRole, setSelectedRole] = useState('wszyscy');
    const [expandedItemId, setExpandedItemId] = useState(null);

    useFocusEffect(
        useCallback(() => {
            const fetchUsers = async () => {
                try {
                    setIsLoading(true);
                    const response = await api.get('uzytkownicy/');
                    const sortedUsers = response.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                    setUsers(sortedUsers);
                } catch (e) {
                    console.error("Failed to fetch users:", e);
                } finally {
                    setIsLoading(false);
                }
            };

            fetchUsers();

        }, [])
    );

    useEffect(() => {
        let tempFilteredUsers = users;

        if (selectedRole !== 'wszyscy') {
            tempFilteredUsers = tempFilteredUsers.filter(user => user.role === selectedRole);
        }

        if (searchQuery) {
            tempFilteredUsers = tempFilteredUsers.filter(user =>
                user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredUsers(tempFilteredUsers);
    }, [searchQuery, users, selectedRole]);

    const handleAddUser = () => {
        console.log('Przejscie do dodawania uzytkownika');
        navigation.navigate('DodajUzytScreen');
    }

    const renderUserItem = ({ item }) => {
        const isExpanded = item.uid === expandedItemId;

        const toggleExpand = () => {
            setExpandedItemId(isExpanded ? null : item.uid);
        };

        const handleEdit = (userId) => {
            console.log('Edytuj użytkownika:', userId);
            navigation.navigate('EdytUzytScreen', { userId: userId });
        };

        const handleDelete = (userId, userName) => {
            Alert.alert(
                "Potwierdź usunięcie",
                `Czy na pewno chcesz usunąć użytkownika "${userName}"?`,
                [
                    {
                        text: "Anuluj",
                        onPress: () => console.log("Anulowano usuwanie"),
                        style: "cancel"
                    },
                    {
                        text: "Usuń",
                        onPress: async () => {
                            console.log('Usuń użytkownika:', userId);
                            try {
                                await api.delete(`uzytkownicy/${userId}`);
                                setUsers(users.filter(user => user.uid !== userId));
                            } catch (error) {
                                console.error("Failed to delete user:", error);
                                Alert.alert(
                                    "Błąd",
                                    "Nie udało się usunąć użytkownika. Spróbuj ponownie później."
                                );
                            }
                        },
                        style: "destructive"
                    }
                ],
                { cancelable: false }
            );
        };

        const handleShowStudentGroups = (studentId, studentName) => {
            console.log(`Pokaż grupy dla studenta: ${studentName} (ID: ${studentId})`);
            navigation.navigate('StudentGrupyScreen', { 
                studentId,
                studentName
            });
        };

        const handleShowLecturerGroups = (lecturerId, lecturerName) => {
            console.log(`Pokaż grupy dla wykładowcy: ${lecturerName} (ID: ${lecturerId})`);
            navigation.navigate('WykladowcaGrupyScreen', { 
                lecturerId,
                lecturerName
            });
        };

        return (
            <TouchableOpacity
                style={localStyles.userItem}
                onPress={toggleExpand}
            >
                <Text style={localStyles.userName}>{item.name}</Text>
                {isExpanded && (
                    <View style={localStyles.expandedUserInfo}>
                        <View style={localStyles.userInfoTextContainer}>
                            <View style={localStyles.userInfoRow}>
                                <Text style={localStyles.userInfoLabel}>Email: {item.email}</Text>
                            </View>
                            <View style={localStyles.userInfoRow}>
                                <Text style={localStyles.userInfoLabel}>Rola: {item.role}</Text>
                            </View>
                        </View>
                        <View style={localStyles.actionButtonsContainer}>
                            <TouchableOpacity onPress={() => handleEdit(item.uid)} style={localStyles.iconButton}>
                                <FontAwesome name="pencil" size={28} color={colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDelete(item.uid, item.name)} style={localStyles.iconButton}>
                                <FontAwesome name="trash" size={28} color={colors.danger} />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                {isExpanded && item.role === 'student' && (
                    <View style={localStyles.studentActionsContainer}>
                        <TouchableOpacity
                            onPress={() => handleShowStudentGroups(item.uid, item.name)}
                            style={localStyles.studentGroupsButton}
                        >
                            <FontAwesome name="users" size={20} color={colors.white} style={{ marginRight: 8 }} />
                            <Text style={localStyles.addButtonText}>Grupy studenta</Text>
                        </TouchableOpacity>
                    </View>
                )}
                {isExpanded && item.role === 'wykladowca' && (
                    <View style={localStyles.studentActionsContainer}>
                        <TouchableOpacity
                            onPress={() => handleShowLecturerGroups(item.uid, item.name)}
                            style={localStyles.studentGroupsButton}
                        >
                            <FontAwesome name="briefcase" size={20} color={colors.white} style={{ marginRight: 8 }} />
                            <Text style={localStyles.addButtonText}>Grupy wykładowcy</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const renderRoleFilterButtons = () => (
        <View style={localStyles.roleFilterContainer}>
            {ROLES.map(role => (
                <TouchableOpacity
                    key={role}
                    style={[
                        localStyles.roleButton,
                        selectedRole === role && localStyles.selectedRoleButton
                    ]}
                    onPress={() => setSelectedRole(role)}
                >
                    <Text style={[
                        localStyles.roleButtonText,
                        selectedRole === role && localStyles.selectedRoleButtonText
                    ]}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    if (isLoading) {
        return (
            <SafeAreaView style={[localStyles.safeArea, localStyles.centered]}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Ładowanie użytkowników...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={localStyles.safeArea}>
            <View style={localStyles.container}>
                <TextInput
                    style={localStyles.searchInput}
                    placeholder="Szukaj użytkownika po nazwie..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                />

                {renderRoleFilterButtons()}

                {filteredUsers.length === 0 && !isLoading ? (
                    <View style={[localStyles.container, localStyles.centered]}>
                        <Text style={localStyles.noUsersText}>Brak użytkowników pasujących do kryteriów.</Text>
                    </View>
                    ) : (
                    <FlatList
                        data={filteredUsers}
                        renderItem={renderUserItem}
                        keyExtractor={item => item.uid}
                    />
                )}
                <TouchableOpacity
                        style={localStyles.addButton}
                        onPress={handleAddUser}
                    >
                        <Text style={localStyles.addButtonText}>Dodaj uzytkownika</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}
