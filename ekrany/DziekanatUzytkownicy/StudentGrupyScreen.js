import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    TouchableOpacity,
    Text,
    ActivityIndicator,
    SafeAreaView,
    FlatList,
    Alert,
    StyleSheet
} from 'react-native';
import localStyles from './styles';
import { api } from '../../serwisy/api';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import colors from '../../assets/colors/colors';

export default function StudentGrupyScreen({ route, navigation }) {
    const { studentId, studentName } = route.params;
    const RZECZYWISTE_WYSTAWIONE_PRZEZ_ID = 'dean_user_id_placeholder';

    const [groupsDetails, setGroupsDetails] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedItemId, setExpandedItemId] = useState(null);

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
                const lecturerRes = await api.get(`uzytkowniki/${group.lecturerId}`);
                lecturerName = lecturerRes?.name || 'Brak';
            }
            
            try {
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
                console.warn(`Nie udało się pobrać lub przetworzyć ocen dla studenta ${studentId} w grupie ${group.id}:`, e);
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

        return {
            ...group,
            subjectName,
            lecturerName,
            groupType,
            ocena, 
            ocenaId 
        };
    };

    useFocusEffect(
        useCallback(() => {
            const fetchStudentGroupsAndDetails = async () => {
                if (!studentId) {
                    Alert.alert("Błąd", "Nie przekazano ID studenta.");
                    setIsLoading(false);
                    return;
                }
                try {
                    setIsLoading(true);
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
            };

            fetchStudentGroupsAndDetails();
        }, [studentId])
    );

    const handleGradeChange = async (item) => {
        Alert.prompt(
            "Zmień ocenę",
            `Wprowadź nową ocenę dla ${studentName} z grupy ${item.name}:\nObecna ocena: ${item.ocena || 'Brak'}`,
            [
                {
                    text: "Anuluj",
                    style: "cancel"
                },
                {
                    text: "Zapisz",
                    onPress: async (nowaOcenaValue) => {
                        if (nowaOcenaValue !== null && nowaOcenaValue.trim() !== '') {
                            const wartoscOceny = nowaOcenaValue.trim();
                            try {
                                const payload = {
                                    studentId: studentId,
                                    grupaId: item.id, 
                                    wystawionePrzez: RZECZYWISTE_WYSTAWIONE_PRZEZ_ID, 
                                    wartoscOceny: wartoscOceny
                                };

                                if (item.ocenaId) {
                                    await api.put(`oceny/${item.ocenaId}`, payload); 
                                    Alert.alert("Sukces", "Ocena została zaktualizowana.");
                                } else {
                                    await api.post("oceny/", payload);
                                    Alert.alert("Sukces", "Ocena została dodana.");
                                }
                                
                                const updatedGroupsDetails = await Promise.all(
                                    groupsDetails.map(async (gd) => {
                                        if (gd.id === item.id) {
                                            return fetchGroupDetails(gd); 
                                        }
                                        return gd;
                                    })
                                );
                                setGroupsDetails(updatedGroupsDetails);

                            } catch (error) {
                                console.error("Błąd podczas zapisu oceny:", error);
                                Alert.alert("Błąd", `Nie udało się zapisać oceny. ${error.message || ''}`);
                            }
                        }
                    }
                }
            ],
            "plain-text",
            item.ocena || ''
        );
    };

    const renderGroupItem = ({ item }) => {
        const isExpanded = item.id === expandedItemId;

        const toggleExpand = () => {
            setExpandedItemId(isExpanded ? null : item.id);
        };

        return (
            <TouchableOpacity
                style={localStyles.userItem}
                onPress={toggleExpand}
            >
                <View style={styles.groupItemHeader}>
                    <Text style={localStyles.userName}>{item.name}</Text>
                    <TouchableOpacity onPress={() => handleGradeChange(item)} style={styles.gradeButton}>
                        <Text style={styles.gradeText}>{item.ocena ? `Ocena: ${item.ocena}` : 'Dodaj/Zmień ocenę'}</Text>
                    </TouchableOpacity>
                </View>
                {isExpanded && (
                    <View style={localStyles.expandedUserInfo}>
                        <View style={localStyles.userInfoTextContainer}> 
                            <View style={localStyles.userInfoRow}>
                                <Text style={localStyles.userInfoLabel}>Typ:</Text>
                                <Text style={localStyles.userInfoValue}>{item.groupType}</Text>
                            </View>
                            <View style={localStyles.userInfoRow}>
                                <Text style={localStyles.userInfoLabel}>Przedmiot:</Text>
                                <Text style={localStyles.userInfoValue}>{item.subjectName}</Text>
                            </View>
                            <View style={localStyles.userInfoRow}>
                                <Text style={localStyles.userInfoLabel}>Prowadzący:</Text>
                                <Text style={localStyles.userInfoValue}>{item.lecturerName}</Text>
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
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        textAlign: 'center',
        marginBottom: 15,
        marginTop: 10,
    },
    groupItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    gradeButton: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: colors.primary,
        borderRadius: 5,
    },
    gradeText: {
        color: colors.white,
        fontSize: 14,
    }
});