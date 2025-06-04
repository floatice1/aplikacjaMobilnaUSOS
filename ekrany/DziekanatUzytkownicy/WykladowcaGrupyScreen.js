import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    TouchableOpacity,
    Text,
    ActivityIndicator,
    SafeAreaView,
    FlatList,
    Alert
} from 'react-native';
import localStyles from './styles';
import { api } from '../../serwisy/api';
import { useFocusEffect } from '@react-navigation/native';
import colors from '../../assets/colors/colors';

export default function WykladowcaGrupyScreen({ route, navigation }) {
    const { lecturerId, lecturerName } = route.params;
    const [groupsDetails, setGroupsDetails] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedItemId, setExpandedItemId] = useState(null);

    const fetchGroupDetails = async (group) => {
        let subjectName = 'Brak';
        let groupType = 'Nieznany';
        let studentCount = 0;

        try {
            if (group.subjectId) {
                const subjectRes = await api.get(`przedmioty/${group.subjectId}`);
                subjectName = subjectRes?.name || 'Brak';
            }
        } catch (e) {
            console.error(`Nie udało się pobrać szczegółów przedmiotu dla grupy ${group.id}:`, e);
        }

        if (group.name) {
            if (group.name.endsWith('_LAB')) groupType = 'Laboratorium';
            else if (group.name.endsWith('_PRO')) groupType = 'Projekt';
            else if (group.name.endsWith('_WYK')) groupType = 'Wykład';
            else if (group.name.endsWith('_CW')) groupType = 'Ćwiczenia';
else if (group.name.endsWith('_SEM')) groupType = 'Seminarium';
        }

        if (group.studentsIds && Array.isArray(group.studentsIds)) {
            studentCount = group.studentsIds.length;
        }

        return {
            ...group,
            subjectName,
            groupType,
            studentCount
        };
    };

    useFocusEffect(
        useCallback(() => {
            const fetchLecturerGroupsAndDetails = async () => {
                if (!lecturerId) {
                    Alert.alert("Błąd", "Nie przekazano ID wykładowcy.");
                    setIsLoading(false);
                    return;
                }
                try {
                    setIsLoading(true);
                    const response = await api.get('grupy/');
                    const lecturerGroups = response.filter(group => group.lecturerId === lecturerId);
                    const sortedGroups = lecturerGroups.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                    
                    const detailedGroups = await Promise.all(
                        sortedGroups.map(group => fetchGroupDetails(group))
                    );
                    setGroupsDetails(detailedGroups);
                } catch (e) {
                    console.error("Nie udało się pobrać grup wykładowcy lub ich szczegółów:", e);
                    Alert.alert("Błąd", "Nie udało się pobrać danych grup wykładowcy.");
                } finally {
                    setIsLoading(false);
                }
            };

            fetchLecturerGroupsAndDetails();
        }, [lecturerId])
    );

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
                <Text style={localStyles.userName}>{item.name}</Text>
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
                                <Text style={localStyles.userInfoLabel}>Liczba studentów:</Text>
                                <Text style={localStyles.userInfoValue}>{item.studentCount}</Text>
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
                <Text>Ładowanie grup wykładowcy...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={localStyles.safeArea}>
            <View style={localStyles.container}>
                <Text style={localStyles.headerText}>Grupy prowadzone przez: {lecturerName}</Text> 
                {groupsDetails.length === 0 && !isLoading ? (
                    <View style={[localStyles.container, localStyles.centered]}>
                        <Text style={localStyles.noUsersText}>Ten wykładowca nie prowadzi żadnych grup.</Text>
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
