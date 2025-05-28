import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { api } from '../serwisy/api'; // Dostosuj ścieżkę do api.js
import { getAuth } from 'firebase/auth';

const useStudentDashboardData = () => {
  const [subjectsWithGroups, setSubjectsWithGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const fetchData = useCallback(async () => {
    if (!currentUser) {
      setSubjectsWithGroups([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const studentId = currentUser.uid;
      const groupsResponse = await api.get('grupy/');
      const allGradesResponse = await api.get('oceny/');
      const allSubjectsResponse = await api.get('przedmioty/');
      const allUsersResponse = await api.get('uzytkownicy/');

      const studentGroups = groupsResponse.filter(group => 
        group.studentsIds && group.studentsIds.includes(studentId)
      );

      const enrichedGroups = studentGroups.map(group => {
        const subjectDetails = allSubjectsResponse.find(s => s.id === group.subjectId);
        const lecturerDetails = allUsersResponse.find(u => u.uid === group.lecturerId);
        
        const groupGrades = allGradesResponse
          .filter(grade => grade.studentId === studentId && grade.groupId === group.id)
          .map(grade => grade.value); // Zakładamy, że 'value' to wartość oceny

        return {
          ...group,
          subjectName: subjectDetails ? subjectDetails.name : 'Nieznany przedmiot',
          lecturerName: lecturerDetails ? `${lecturerDetails.name}` : 'Nieznany prowadzący',
          grades: groupGrades,
          groupType: group.name.includes('_WYK') ? 'Wykład' : group.name.includes('_CW') ? 'Ćwiczenia' : group.name.includes('_LAB') ? 'Laboratoria' : group.name.includes('_PRO')? 'Projekt' : 'Nieznany typ zajęć',
        };
      });

      const groupedBySubject = enrichedGroups.reduce((acc, group) => {
        const subjectId = group.subjectId;
        if (!acc[subjectId]) {
          acc[subjectId] = {
            id: subjectId,
            name: group.subjectName,
            groups: []
          };
        }
        acc[subjectId].groups.push(group);
        return acc;
      }, {});

      setSubjectsWithGroups(Object.values(groupedBySubject));
    } catch (err) {
      setError(err);
      Alert.alert('Błąd podczas pobierania danych', err.message);
      console.error('Błąd w useStudentDashboardData:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { subjectsWithGroups, isLoading, error, refreshData: fetchData };
};

export default useStudentDashboardData;