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
import { useGroupFormData } from '../../hooks/useGroupFormData';

export default function DodajGrupeScreen({ navigation }) {
    const [name, setName] = useState('');
    const [subjectId, setSubjectId] = useState('');
    const [lecturerId, setLecturerId] = useState('');
    const [groupType, setGroupType] = useState('LAB');

    const {
        subjects,
        lecturers,
        isLoading,
        error,
    } = useGroupFormData();

    const [subjectQuery, setSubjectQuery] = useState('');
    const [lecturerQuery, setLecturerQuery] = useState('');
    const [filteredSubjects, setFilteredSubjects] = useState([]);
    const [filteredLecturers, setFilteredLecturers] = useState([]);
    const [hideSubjectResults, setHideSubjectResults] = useState(true);
    const [hideLecturerResults, setHideLecturerResults] = useState(true);

    const findSubject = (query) => {
        if (query === '') {
            return [];
        }
        const regex = new RegExp(`${query.trim()}`, 'i');
        return subjects.filter(subject => subject.name.search(regex) >= 0);
    };

    const findLecturer = (query) => {
        if (query === '') {
            return [];
        }
        const regex = new RegExp(`${query.trim()}`, 'i');
        
        return lecturers.filter(lecturer => `${lecturer.name || ''} ${lecturer.surname || ''}`.search(regex) >= 0);
    };

    const handleSubmit = async () => {
        if (!name.trim() || !subjectId || !lecturerId || !groupType) { 
            Alert.alert("Błąd", "Wszystkie pola (nazwa, typ, przedmiot, wykładowca) są wymagane.");
            return;
        }
        try {
            
            const selectedSubject = subjects.find(s => s.id === subjectId);
            if (!selectedSubject) {
                Alert.alert("Błąd", "Nie znaleziono wybranego przedmiotu. Spróbuj ponownie.");
                return;
            }

            const subjectPrefix = selectedSubject.name.substring(0, 3).toUpperCase();
            const finalGroupName = `${name.trim()}_${subjectPrefix}_${groupType}`;

            const response = await api.post('grupy/', {
                nazwa: finalGroupName, 
                przedmiotId: subjectId,
                wykladowcaId: lecturerId,
            });
            if (response) {
                Alert.alert("Sukces", "Grupa została dodana.");
                navigation.goBack();
            } else {
                Alert.alert("Błąd", "Nie udało się dodać grupy. Spróbuj ponownie.");
            }
        } catch (error) {
            console.error('Błąd podczas tworzenia grupy:', error);
            Alert.alert("Błąd", `Nie udało się dodać grupy: ${error.message || 'Nieznany błąd'}`);
        }
    };

    if (isLoading) { 
        return (
            <SafeAreaView style={localStyles.safeArea}>
                <View style={[localStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                    <ActivityIndicator size="large" />
                    <Text>Ładowanie...</Text>
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
                                    placeholder="Wprowadź nazwę grupy"
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
                                        onValueChange={(itemValue, itemIndex) => setGroupType(itemValue)}
                                    >
                                        <Picker.Item label="Laboratorium" value="LAB" />
                                        <Picker.Item label="Projekt" value="PRO" />
                                        <Picker.Item label="Wykład" value="WYK" />
                                        <Picker.Item label="Ćwiczenia" value="CW" />
                                        <Picker.Item label="Seminarium" value="SEM" />
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
                                onPress={handleSubmit}
                                disabled={isLoading}
                            >
                                <Text style={localStyles.addButtonText}>Dodaj Grupę</Text>
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