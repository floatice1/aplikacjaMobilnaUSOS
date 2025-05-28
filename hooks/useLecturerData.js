import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { getAuth } from 'firebase/auth';
import { api } from '../serwisy/api';

export const useLecturerData = () => {
  const [subjectsWithGroupsAndStudents, setSubjectsWithGroupsAndStudents] = useState([]);
  const [allGrades, setAllGrades] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const auth = getAuth();
  const currentUser = auth.currentUser;

  const fetchLecturerData = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);
    setError(null);
    try {
      const lecturerId = currentUser.uid;
      const [allSubjects, allGroups, allUsers, fetchedGrades] = await Promise.all([
        api.get('przedmioty/'),
        api.get('grupy/'),
        api.get('uzytkownicy/'),
        api.get('oceny/')
      ]);
      
      setAllGrades(fetchedGrades);

      const processedSubjects = await Promise.all(allSubjects.map(async subject => {
        const subjectGroups = allGroups.filter(group => group.subjectId === subject.id && group.lecturerId === lecturerId);

        if (subjectGroups.length === 0) {
          return {
            id: subject.id,
            name: subject.name,
            groups: [],
          };
        }

        const groupsWithStudents = await Promise.all(subjectGroups.map(async group => {
          const studentsInGroup = group.studentsIds ? await Promise.all(group.studentsIds.map(async studentId => {
            const studentData = allUsers.find(u => u.uid === studentId);
            const studentGradesObjects = fetchedGrades.filter(g => g.studentId === studentId && g.groupId === group.id);
            return {
              id: studentId,
              name: studentData ? `${studentData.name}` : 'Nieznany student',
              email: studentData ? studentData.email : '',
              grades: studentGradesObjects,
            };
          })) : [];
          return {
            ...group,
            students: studentsInGroup,
            groupType: group.name.includes('_WYK') ? 'Wykład' : group.name.includes('_CW') ? 'Ćwiczenia' : group.name.includes('_LAB') ? 'Laboratoria' : group.name.includes('_PRO')? 'Projekt' : 'Nieznany typ zajęć',
          };
        }));

        return {
          id: subject.id,
          name: subject.name,
          groups: groupsWithStudents,
        };
      }));

      const structuredData = processedSubjects.filter(subject => subject.groups.length > 0);
      setSubjectsWithGroupsAndStudents(structuredData);
    } catch (err) {
      setError(err);
      Alert.alert('Błąd', 'Nie udało się pobrać danych prowadzącego.');
      console.error('Błąd pobierania danych w useLecturerData:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchLecturerData();
  }, [fetchLecturerData]);

  const handleAddOrUpdateGrade = useCallback(async (studentId, groupId, gradeValue) => {
    if (!currentUser) {
        Alert.alert('Błąd', 'Użytkownik nie jest zalogowany.');
        return false;
    }
    if (!gradeValue) {
      Alert.alert('Błąd', 'Wpisz ocenę.');
      return false;
    }
    const numericGrade = parseFloat(gradeValue);
    if (isNaN(numericGrade) || numericGrade < 2 || numericGrade > 5 || !Number.isInteger(numericGrade * 2)) {
        Alert.alert('Błąd', 'Ocena musi być liczbą od 2 do 5, z dokładnością do 0.5 (np. 2, 2.5, 3, 3.5, 4, 4.5, 5).');
        return false;
    }

    try {
      const existingGrade = allGrades.find(g => g.studentId === studentId && g.groupId === groupId);
      const payload = {
        studentId: studentId,
        grupaId: groupId, 
        wystawionePrzez: currentUser.uid, 
        wartoscOceny: numericGrade.toString(),
      };

      if (existingGrade) {
        await api.put(`oceny/${existingGrade.id}`, payload);
        Alert.alert('Sukces', 'Ocena została zaktualizowana.');
      } else {
        await api.post('oceny/', payload);
        Alert.alert('Sukces', 'Ocena została dodana.');
      }
      fetchLecturerData(); // Odśwież dane po dodaniu/aktualizacji oceny
      return true;
    } catch (error) {
      console.error('Błąd podczas zapisywania oceny w useLecturerData:', error);
      Alert.alert('Błąd', 'Nie udało się zapisać oceny. ' + (error.response?.data?.detail || error.message));
      return false;
    }
  }, [allGrades, currentUser, fetchLecturerData]);

  return { 
    subjectsWithGroupsAndStudents, 
    allGrades, 
    isLoading, 
    error, 
    refreshData: fetchLecturerData, 
    handleAddOrUpdateGrade 
  };
};