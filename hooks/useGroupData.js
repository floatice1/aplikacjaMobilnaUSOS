import { useState, useCallback } from 'react';
import { api } from '../serwisy/api';
import { Alert } from 'react-native';

export const useGroupData = () => {
    const [groupsDetails, setGroupsDetails] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [groupsResponse, subjectsResponse, usersResponse] = await Promise.all([
                api.get('grupy/'),
                api.get('przedmioty/'),
                api.get('uzytkownicy/')
            ]);

            const subjectsMap = new Map(subjectsResponse.map(subject => [subject.id, subject.name]));
            const usersMap = new Map(usersResponse.map(user => [user.uid, user.name]));

            const detailedGroups = groupsResponse.map(group => {
                let groupType = 'Nieznany';
                if (group.name) {
                    if (group.name.endsWith('_LAB')) groupType = 'Laboratorium';
                    else if (group.name.endsWith('_PRO')) groupType = 'Projekt';
                    else if (group.name.endsWith('_WYK')) groupType = 'Wykład';
                    else if (group.name.endsWith('_CW')) groupType = 'Ćwiczenia';
                }

                return {
                    ...group,
                    subjectName: subjectsMap.get(group.subjectId) || 'Brak',
                    lecturerName: usersMap.get(group.lecturerId) || 'Brak',
                    groupType,
                    studentCount: group.studentsIds ? group.studentsIds.length : 0,
                };
            });

            const sortedDetailedGroups = detailedGroups.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            setGroupsDetails(sortedDetailedGroups);

        } catch (e) {
            console.error("Nie udało się pobrać danych dla grup:", e);
            setError(e);
            Alert.alert("Błąd", "Nie udało się pobrać danych grup.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const refreshData = useCallback(() => {
        fetchData();
    }, [fetchData]);

    const removeGroupFromState = (groupId) => {
        setGroupsDetails(prevDetails => prevDetails.filter(group => group.id !== groupId));
    };

    return { groupsDetails, isLoading, error, fetchData, refreshData, removeGroupFromState };
};