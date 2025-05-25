import React, { useState, useEffect } from 'react';
import {
    View,
    TouchableOpacity,
    Text,
    TextInput,
    ScrollView,
    Alert,
    StyleSheet,
    Platform,
    KeyboardAvoidingView,
    ActivityIndicator,
    TouchableWithoutFeedback,
    Keyboard
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import localStyles from './styles';
import { api } from '../../serwisy/api';
import AutocompleteInput from 'react-native-autocomplete-input';

export default function EdytujGrupeScreen({ route, navigation }) {
    const { id } = route.params;
    const groupId = id;
    const [name, setName] = useState('');
    const [originalName, setOriginalName] = useState('');
    const [subjectId, setSubjectId] = useState('');
    const [lecturerId, setLecturerId] = useState('');
    const [groupType, setGroupType] = useState('LAB'); 
    const [subjects, setSubjects] = useState([]);
    const [lecturers, setLecturers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [subjectQuery, setSubjectQuery] = useState('');
    const [lecturerQuery, setLecturerQuery] = useState('');
    const [filteredSubjects, setFilteredSubjects] = useState([]);
    const [filteredLecturers, setFilteredLecturers] = useState([]);
    const [hideSubjectResults, setHideSubjectResults] = useState(true);
    const [hideLecturerResults, setHideLecturerResults] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const subjectsResponse = await api.get('przedmioty/');
                setSubjects(subjectsResponse || []);

                const usersResponse = await api.get('uzytkowniki/');
                if (usersResponse) {
                    const filtered = usersResponse.filter(user => user.role === 'wykladowca');
                    setLecturers(filtered);
                } else {
                    setLecturers([]);
                }

                if (groupId) {
                    const groupResponse = await api.get(`grupy/${groupId}`);
                    if (groupResponse) {
                        const nameParts = groupResponse.name.split('_');
                        if (nameParts.length >= 2) {
                            setGroupType(nameParts[nameParts.length - 1]);
                            let baseName = groupResponse.name;
                            baseName = baseName.replace(`_${nameParts[nameParts.length -1]}`, '');
                            if (nameParts.length > 2) {
                                baseName = baseName.replace(`_${nameParts[nameParts.length -2]}`, '');
                            }
                            setName(baseName);
                            setOriginalName(baseName);
                        } else {
                            setName(groupResponse.name || '');
                            setOriginalName(groupResponse.name || '');
                        }
                        
                        setSubjectId(groupResponse.subjectId || '');
                        setLecturerId(groupResponse.lecturerId || '');

                        if (groupResponse.subjectId && subjectsResponse) {
                            const currentSubject = subjectsResponse.find(s => s.id === groupResponse.subjectId);
                            if (currentSubject) setSubjectQuery(currentSubject.name);
                        }
                        if (groupResponse.lecturerId && usersResponse) {
                            const currentLecturer = usersResponse.find(u => u.uid === groupResponse.lecturerId && u.role === 'wykladowca');
                            if (currentLecturer) setLecturerQuery(`${currentLecturer.name || ''} ${currentLecturer.surname || ''}`.trim());
                        }
                    }
                }
            } catch (error) {
                console.error("Nie udało się pobrać danych:", error);
                Alert.alert("Błąd", "Nie udało się pobrać danych grupy, przedmiotów lub wykładowców.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [groupId]);

    const findSubject = (query) => {
        if (query === '') return [];
        const regex = new RegExp(`${query.trim()}`, 'i');
        return subjects.filter(subject => subject.name.search(regex) >= 0);
    };

    const findLecturer = (query) => {
        if (query === '') return [];
        const regex = new RegExp(`${query.trim()}`, 'i');
        return lecturers.filter(lecturer => `${lecturer.name || ''} ${lecturer.surname || ''}`.search(regex) >= 0);
    };

    const handleSaveChanges = async () => {
        if (!name.trim() || !subjectId || !lecturerId || !groupType) {
            Alert.alert("Błąd", "Wszystkie pola (nazwa, typ, przedmiot, wykładowca) są wymagane.");
            return;
        }
        try {
            const selectedSubject = subjects.find(s => s.id === subjectId);
            if (!selectedSubject) {
                Alert.alert("Błąd", "Nie znaleziono wybranego przedmiotu.");
                return;
            }
            const subjectPrefix = selectedSubject.name.substring(0, 3).toUpperCase();
            const finalGroupName = `${name.trim()}_${subjectPrefix}_${groupType}`;

            await api.put(`grupy/${groupId}`, {
                nazwa: finalGroupName,
                przedmiotId: subjectId,
                wykladowcaId: lecturerId,
            });
            Alert.alert("Sukces", "Dane grupy zostały zaktualizowane.");
            navigation.goBack();
        } catch (error) {
            console.error('Błąd podczas aktualizacji grupy:', error);
            Alert.alert("Błąd", `Nie udało się zaktualizować grupy: ${error.message || 'Nieznany błąd'}`);
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={localStyles.safeArea}>
                <View style={[localStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                    <ActivityIndicator size="large" />
                    <Text>Ładowanie danych grupy...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={localStyles.safeArea}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                        <View style={localStyles.container}>
                            <View style={localStyles.formContainer}>
                                <View style={localStyles.inputContainer}>
                                    <Text style={localStyles.label}>Nazwa grupy:</Text>
                                    <TextInput
                                        style={localStyles.input}
                                        placeholder="Wprowadź nazwę bazową grupy"
                                        onChangeText={setName}
                                        value={name}
                                    />
                                </View>

                                <View style={localStyles.inputContainer}>
                                    <Text style={localStyles.label}>Typ grupy:</Text>
                                    <View style={localStyles.pickerContainer}> 
                                        <Picker
                                            selectedValue={groupType}
                                            style={localStyles.picker} 
                                            onValueChange={(itemValue) => setGroupType(itemValue)}
                                        >
                                            <Picker.Item label="Laboratorium" value="LAB" />
                                            <Picker.Item label="Projekt" value="PRO" />
                                            <Picker.Item label="Wykład" value="WYK" />
                                            <Picker.Item label="Ćwiczenia" value="CW" />
                                        </Picker>
                                    </View>
                                </View>

                                <View style={[styles.autocompleteWrapper, Platform.OS === 'android' ? { zIndex: 200 } : { zIndex: 2 }]}>
                                    <Text style={localStyles.label}>Przedmiot:</Text>
                                    <AutocompleteInput
                                        containerStyle={styles.autocompleteInternalContainer}
                                        inputContainerStyle={styles.inputAutocompleteContainer}
                                        data={filteredSubjects}
                                        value={subjectQuery}
                                        onChangeText={(text) => {
                                            setSubjectQuery(text);
                                            setFilteredSubjects(findSubject(text));
                                            setHideSubjectResults(false);
                                            if (text === '') setSubjectId('');
                                        }}
                                        flatListProps={{
                                            keyboardShouldPersistTaps: 'always',
                                            keyExtractor: (item) => item.id.toString(),
                                            renderItem: ({ item }) => (
                                                <TouchableOpacity onPress={() => {
                                                    setSubjectQuery(item.name);
                                                    setSubjectId(item.id);
                                                    setFilteredSubjects([]);
                                                    setHideSubjectResults(true);
                                                }} style={styles.itemTextContainer}>
                                                    <Text style={styles.itemText}>{item.name}</Text>
                                                </TouchableOpacity>
                                            ),
                                            nestedScrollEnabled: true,
                                        }}
                                        style={localStyles.input}
                                        placeholder="Wpisz nazwę przedmiotu"
                                        hideResults={hideSubjectResults || filteredSubjects.length === 0}
                                        listContainerStyle={styles.listContainer}
                                    />
                                </View>

                                <View style={[styles.autocompleteWrapper, Platform.OS === 'android' ? { zIndex: 100 } : { zIndex: 1 }]}>
                                    <Text style={localStyles.label}>Wykładowca:</Text>
                                    <AutocompleteInput
                                        containerStyle={styles.autocompleteInternalContainer}
                                        inputContainerStyle={styles.inputAutocompleteContainer}
                                        data={filteredLecturers}
                                        value={lecturerQuery}
                                        onChangeText={(text) => {
                                            setLecturerQuery(text);
                                            setFilteredLecturers(findLecturer(text));
                                            setHideLecturerResults(false);
                                            if (text === '') setLecturerId('');
                                        }}
                                        flatListProps={{
                                            keyboardShouldPersistTaps: 'always',
                                            keyExtractor: (item) => item.uid.toString(), 
                                            renderItem: ({ item }) => (
                                                <TouchableOpacity onPress={() => {
                                                    setLecturerQuery(`${item.name || ''} ${item.surname || ''}`.trim());
                                                    setLecturerId(item.uid);
                                                    setFilteredLecturers([]);
                                                    setHideLecturerResults(true);
                                                }} style={styles.itemTextContainer}>
                                                    <Text style={styles.itemText}>{`${item.name || ''} ${item.surname || ''}`.trim()}</Text>
                                                </TouchableOpacity>
                                            ),
                                            nestedScrollEnabled: true,
                                        }}
                                        style={localStyles.input}
                                        placeholder="Wpisz imię i nazwisko wykładowcy"
                                        hideResults={hideLecturerResults || filteredLecturers.length === 0}
                                        listContainerStyle={styles.listContainer}
                                    />
                                </View>

                                <TouchableOpacity
                                    style={[localStyles.addButton, { marginTop: 30 }]} 
                                    onPress={handleSaveChanges}
                                    disabled={isLoading}
                                >
                                    <Text style={localStyles.addButtonText}>Zapisz Zmiany</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                </TouchableWithoutFeedback>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    autocompleteWrapper: {
        position: 'relative',
        marginBottom: 15,
    },
    autocompleteInternalContainer: {
        borderWidth: 0,
    },
    inputAutocompleteContainer: {
        borderWidth: 0,
    },
    itemText: {
        fontSize: 15,
    },
    itemTextContainer: { 
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    listContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: '100%', 
        maxHeight: 150,
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: 'white',
        borderRadius: 5,
        zIndex: 10, 
        marginBottom: 2,
    },
});