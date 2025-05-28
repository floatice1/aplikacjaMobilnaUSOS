import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { api } from '../serwisy/api';

export function useGroupFormData() {
    const [subjects, setSubjects] = useState([]);
    const [lecturers, setLecturers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const subjectsResponse = await api.get('przedmioty/');
            setSubjects(subjectsResponse || []);

            const usersResponse = await api.get('uzytkownicy/');
            if (usersResponse) {
                const filteredLecturers = usersResponse.filter(user => user.role === 'wykladowca');
                setLecturers(filteredLecturers);
            } else {
                setLecturers([]);
            }
        } catch (err) {
            console.error("Nie udało się pobrać danych dla formularza grupy:", err);
            setError(err);
            Alert.alert("Błąd", "Nie udało się pobrać listy przedmiotów lub wykładowców.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        subjects,
        lecturers,
        isLoading,
        error,
        fetchData // Można użyć do odświeżenia danych, jeśli potrzebne
    };
}