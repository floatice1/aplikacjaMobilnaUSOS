import React, {useState, useEffect, useCallback} from 'react'
import { View, TouchableOpacity, Text, ActivityIndicator, SafeAreaView, FlatList, Alert } from 'react-native'
import localStyles from './styles'
import { api } from '../../serwisy/api'
import { TextInput } from 'react-native-gesture-handler';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import colors from '../../assets/colors/colors';

export default function PrzedmiotyEkran({ navigation }) {
    const [subjects, setSubjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredSubjects, setFilteredSubjects] = useState([]);
    const [expandedItemId, setExpandedItemId] = useState(null);

    useFocusEffect(
        useCallback(() => {
            const fetchSubjects = async () => {
                try {
                    setIsLoading(true);
                    const response = await api.get('przedmioty/');
                    const sortedSubjects = response.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                    setSubjects(sortedSubjects);
                } catch (e) {
                    console.error("Nie udało się pobrać przedmiotów:", e);
                } finally {
                    setIsLoading(false);
                }
            };

            fetchSubjects();

        }, [])
    );

    useEffect(() => {
        let tempFilteredSubjects = subjects;

        if (searchQuery) {
            tempFilteredSubjects = tempFilteredSubjects.filter(subject =>
                subject.name && subject.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredSubjects(tempFilteredSubjects);
    }, [searchQuery, subjects]);

    const handleAddSubject = () => {
        navigation.navigate('DodajPrzedmiotScreen');
    }

    const renderSubjectItem = ({ item }) => {
        const isExpanded = item.id === expandedItemId;

        const toggleExpand = () => {
            setExpandedItemId(isExpanded ? null : item.id);
        };

        const handleEdit = (subjectId) => {
            navigation.navigate('EdytujPrzedmiotScreen', { subjectId: subjectId });
        };

        const handleDelete = (subjectId, subjectName) => {
            Alert.alert(
                "Potwierdź usunięcie",
                `Czy na pewno chcesz usunąć przedmiot "${subjectName}"?`,
                [
                    {
                        text: "Anuluj",
                        onPress: () => console.log("Anulowano usuwanie"),
                        style: "cancel"
                    },
                    { 
                        text: "Usuń", 
                        onPress: async () => {
                            console.log('Usuń przedmiot:', subjectId);
                            try {
                                await api.delete(`przedmioty/${subjectId}`);
                                setSubjects(subjects.filter(subject => subject.id !== subjectId));
                            } catch (error) {
                                console.error("Nie udało się usunąć przedmiotu:", error);
                                Alert.alert(
                                    "Błąd",
                                    "Nie udało się usunąć przedmiotu. Spróbuj ponownie później."
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
                    <View style={localStyles.expandedUserInfo}>
                        <View style={localStyles.userInfoText}>
                            <View style={localStyles.userInfoRow}>
                                <Text style={localStyles.userInfoText}>{item.description || 'Brak opisu'}</Text>
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
                )}
            </TouchableOpacity>
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView style={[localStyles.safeArea, localStyles.centered]}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Ładowanie przedmiotów...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={localStyles.safeArea}>
            <View style={localStyles.container}>
                <TextInput
                    style={localStyles.searchInput}
                    placeholder="Szukaj przedmiotu po nazwie..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                />

                {filteredSubjects.length === 0 && !isLoading ? (
                    <View style={[localStyles.container, localStyles.centered]}>
                        <Text style={localStyles.noUsersText}>Brak przedmiotów pasujących do kryteriów.</Text>
                    </View>
                    ) : (
                    <FlatList
                        data={filteredSubjects}
                        renderItem={renderSubjectItem}
                        keyExtractor={item => item.id}
                    />
                )}
                <TouchableOpacity
                        style={localStyles.addButton}
                        onPress={handleAddSubject}
                    >
                        <Text style={localStyles.addButtonText}>Dodaj przedmiot</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}