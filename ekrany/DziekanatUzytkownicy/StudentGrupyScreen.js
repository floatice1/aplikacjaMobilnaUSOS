import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Platform,
    TouchableOpacity,
    Text,
    ActivityIndicator,
    SafeAreaView,
    FlatList,
    Alert,
    StyleSheet,
    TextInput,
    Modal
} from 'react-native';
import localStyles from './styles';
import { api } from '../../serwisy/api';
import { useFocusEffect } from '@react-navigation/native';
import colors from '../../assets/colors/colors';

export default function StudentGrupyScreen({ route, navigation }) {
    const { studentId, studentName } = route.params;
    const RZECZYWISTE_WYSTAWIONE_PRZEZ_ID = 'dean_user_id_placeholder';

    const [isPromptVisible, setPromptVisible] = useState(false);
    const [currentGradingItem, setCurrentGradingItem] = useState(null);
    const [gradeInputValue, setGradeInputValue] = useState('');

    const [groupsDetails, setGroupsDetails] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedItemId, setExpandedItemId] = useState(null);

    const fetchAllData = useCallback(async () => {
        if (!studentId) {
            Alert.alert("Błąd", "Nie przekazano ID studenta.");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const response = await api.get('grupy/');
            const studentGroups = response.filter(group =>
                group.studentsIds && group.studentsIds.includes(studentId)
            );
            const sortedGroups = studentGroups.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            const detailedGroups = await Promise.all(
                sortedGroups.map(group => fetchGroupDetails(group))
            );
            setGroupsDetails(detailedGroups);
        } catch (e) {
            console.error("Nie udało się pobrać grup studenta lub ich szczegółów:", e);
            Alert.alert("Błąd", "Nie udało się pobrać danych grup studenta.");
        } finally {
            setIsLoading(false);
        }
    }, [studentId]);
    const fetchGroupDetails = async (group) => {
        let subjectName = 'Brak';
        let lecturerName = 'Brak';
        let groupType = 'Nieznany';
        let ocena = null;
        let ocenaId = null;

        try {
            if (group.subjectId) {
                const subjectRes = await api.get(`przedmioty/${group.subjectId}`);
                subjectName = subjectRes?.name || 'Brak';
            }
            if (group.lecturerId) {
                const lecturerRes = await api.get(`uzytkownicy/${group.lecturerId}`);
                lecturerName = lecturerRes?.name || 'Brak';
            }
            const allOcenyResponse = await api.get('oceny/');
            if (allOcenyResponse && Array.isArray(allOcenyResponse)) {
                const relevantOcena = allOcenyResponse.find(
                    o => o.studentId === studentId && o.groupId === group.id
                );
                if (relevantOcena) {
                    ocena = relevantOcena.value;
                    ocenaId = relevantOcena.id;
                }
            }
        } catch (e) {
            console.warn(`Nie udało się pobrać szczegółów dla grupy ${group.id}:`, e);
        }

        if (group.name) {
            if (group.name.endsWith('_LAB')) groupType = 'Laboratorium';
            else if (group.name.endsWith('_PRO')) groupType = 'Projekt';
            else if (group.name.endsWith('_WYK')) groupType = 'Wykład';
            else if (group.name.endsWith('_CW')) groupType = 'Ćwiczenia';
            else if (group.name.endsWith('_SEM')) groupType = 'Seminarium';
        }
        return { ...group, subjectName, lecturerName, groupType, ocena, ocenaId };
    };

    useFocusEffect(
        useCallback(() => {
            fetchAllData();
        }, [fetchAllData])
    );

    const handleGradeChange = (item) => {
        setCurrentGradingItem(item);
        setGradeInputValue(item.ocena ? String(item.ocena) : '');
        setPromptVisible(true);
    };

    const handleSaveGrade = async () => {
        if (!currentGradingItem) return;

        const nowaOcenaValue = gradeInputValue;
        if (nowaOcenaValue === null || nowaOcenaValue.trim() === '') {
            Alert.alert("Błąd", "Ocena nie może być pusta.");
            return;
        }

        const wartoscOceny = parseFloat(nowaOcenaValue.trim().replace(',', '.'));
        const dozwoloneOceny = [2, 3, 3.5, 4, 4.5, 5];
        if (isNaN(wartoscOceny) || !dozwoloneOceny.includes(wartoscOceny)) {
            Alert.alert("Błąd", "Ocena musi być liczbą od 2 do 5. Np.: 3, 3.5");
            return;
        }

        try {
            const payload = {
                studentId: studentId,
                grupaId: currentGradingItem.id,
                wystawionePrzez: RZECZYWISTE_WYSTAWIONE_PRZEZ_ID,
                wartoscOceny: String(wartoscOceny)
            };

            if (currentGradingItem.ocenaId) {
                await api.put(`oceny/${currentGradingItem.ocenaId}`, payload);
                Alert.alert("Sukces", "Ocena została zaktualizowana.");
            } else {
                await api.post("oceny/", payload);
                Alert.alert("Sukces", "Ocena została dodana.");
            }

            setPromptVisible(false);
            setCurrentGradingItem(null);
            
            await fetchAllData();

        } catch (error) {
            const errorMessage = error.response?.data?.detail || error.message || 'Nieznany błąd';
            console.error("Błąd podczas zapisu oceny:", JSON.stringify(error.response?.data || error, null, 2));
            Alert.alert("Błąd zapisu", `Nie udało się zapisać oceny. Serwer zwrócił: ${errorMessage}`);
        }
    };

    const renderGroupItem = ({ item }) => {
        const isExpanded = item.id === expandedItemId;
        const toggleExpand = () => setExpandedItemId(isExpanded ? null : item.id);

        return (
            <TouchableOpacity style={localStyles.userItem} onPress={toggleExpand}>
                <View style={styles.groupItemHeader}>
                    <Text style={localStyles.userName}>{item.name}</Text>
                    <TouchableOpacity onPress={(e) => { e.stopPropagation(); handleGradeChange(item); }} style={styles.gradeButton}>
                        <Text style={styles.gradeText}>{item.ocena ? `Ocena: ${item.ocena}` : 'Dodaj/Zmień ocenę'}</Text>
                    </TouchableOpacity>
                </View>
                {isExpanded && (
                    <View style={localStyles.expandedUserInfo}>
                        <View style={localStyles.userInfoTextContainer}>
                            <View style={localStyles.userInfoRow}>
                                <Text style={localStyles.userInfoLabel}>Typ: {item.groupType}</Text>
                            </View>
                            <View style={localStyles.userInfoRow}>
                                <Text style={localStyles.userInfoLabel}>Przedmiot: {item.subjectName}</Text>
                            </View>
                            <View style={localStyles.userInfoRow}>
                                <Text style={localStyles.userInfoLabel}>Prowadzący: {item.lecturerName}</Text>
                            </View>
                        </View>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView style={[localStyles.safeArea, localStyles.centered]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text>Ładowanie grup studenta...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={localStyles.safeArea}>
            <View style={localStyles.container}>
                <Text style={localStyles.headerText}>Grupy studenta: {studentName}</Text>
                {groupsDetails.length === 0 && !isLoading ? (
                    <View style={[localStyles.container, localStyles.centered]}>
                        <Text style={localStyles.noUsersText}>Ten student nie jest przypisany do żadnych grup.</Text>
                    </View>
                ) : (
                    <FlatList
                        data={groupsDetails}
                        renderItem={renderGroupItem}
                        keyExtractor={item => item.id.toString()}
                        extraData={expandedItemId}
                    />
                )}
                <Modal
                    transparent={true}
                    animationType="fade"
                    visible={isPromptVisible}
                    onRequestClose={() => setPromptVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>Zmień ocenę</Text>
                            <Text style={styles.modalSubtitle}>
                                {`Student: ${studentName}\nGrupa: ${currentGradingItem?.name}`}
                            </Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Wprowadź ocenę (2-5)"
                                keyboardType="numeric"
                                value={gradeInputValue}
                                onChangeText={setGradeInputValue}
                                autoFocus={true}
                            />
                            <View style={styles.modalButtonContainer}>
                                <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setPromptVisible(false)}>
                                    <Text style={styles.modalButtonText}>Anuluj</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSaveGrade}>
                                    <Text style={[styles.modalButtonText, { color: colors.white }]}>Zapisz</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    headerText: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 15, marginTop: 10 },
    groupItemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
    gradeButton: { paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#007AFF', borderRadius: 5 },
    gradeText: { color: 'white', fontSize: 14 },
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
    modalContainer: { width: '90%', maxWidth: 400, backgroundColor: 'white', borderRadius: 15, padding: 20, alignItems: 'stretch', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
    modalSubtitle: { fontSize: 14, textAlign: 'center', marginBottom: 16, color: '#666' },
    modalInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, paddingVertical: Platform.OS === 'ios' ? 15 : 10, fontSize: 16, marginBottom: 20, textAlign: 'center' },
    modalButtonContainer: { flexDirection: 'row', justifyContent: 'space-between' },
    modalButton: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
    cancelButton: { backgroundColor: '#eee', marginRight: 10 },
    saveButton: { backgroundColor: '#007AFF' },
    modalButtonText: { fontWeight: 'bold', fontSize: 16 },
});