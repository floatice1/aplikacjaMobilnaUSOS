import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { api } from '../serwisy/api';

export function useGroupDetails(groupId, navigation) {
    const [grupa, setGrupa] = useState(null);
    const [name, setName] = useState('');
    const [subjectId, setSubjectId] = useState('');
    const [lecturerId, setLecturerId] = useState('');
    const [groupType, setGroupType] = useState('LAB');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchGroupDetails = async () => {
            if (!groupId) {
                setIsLoading(false);
                return;
            }
            try {
                setIsLoading(true);
                setError(null);
                const response = await api.get(`grupy/${groupId}`);
                if (response) {
                    setGrupa(response);
                    // Assuming group name format is "ActualName_SubjectPrefix_Type"
                    const nameParts = response.name.split('_');
                    setName(nameParts[0]); 
                    setGroupType(nameParts.pop()); 
                    setSubjectId(response.subjectId); 
                    setLecturerId(response.lecturerId);
                } else {
                    Alert.alert("Błąd", "Nie udało się pobrać danych grupy.");
                    if (navigation) navigation.goBack();
                }
            } catch (err) {
                console.error("Błąd podczas pobierania danych grupy:", err);
                setError(err);
                Alert.alert("Błąd", "Wystąpił błąd podczas pobierania danych grupy.");
                if (navigation) navigation.goBack();
            } finally {
                setIsLoading(false);
            }
        };

        fetchGroupDetails();
    }, [groupId, navigation]);

    return { grupa, name, setName, subjectId, setSubjectId, lecturerId, setLecturerId, groupType, setGroupType, isLoading, error, setGrupa };
}