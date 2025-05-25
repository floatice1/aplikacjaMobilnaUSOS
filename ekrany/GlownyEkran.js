import React, { useEffect, useState } from 'react';
import {
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Alert, 
  TouchableOpacity, 
  SafeAreaView,
  Dimensions
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native'; 
import colors from '../assets/colors/colors';
import { api } from '../serwisy/api';
import { MaterialIcons } from '@expo/vector-icons'; // Ikony do rozwijania

const { width, height } = Dimensions.get('window');

const GlownyEkran = () => {
  const [subjectsWithGroups, setSubjectsWithGroups] = useState([]);
  const [expandedSubjectId, setExpandedSubjectId] = useState(null);
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const navigation = useNavigation();

  useEffect(() => {
    if (currentUser) {
      fetchStudentData(currentUser.uid);
    }
  }, [currentUser]);

  const fetchStudentData = async (studentId) => {
    try {
      const groupsResponse = await api.get('grupy/');
      const allGradesResponse = await api.get('oceny/');
      const allSubjectsResponse = await api.get('przedmioty/');
      const allUsersResponse = await api.get('uzytkowniki/');

      const studentGroups = groupsResponse.filter(group => 
        group.studentsIds && group.studentsIds.includes(studentId)
      );

      const enrichedGroups = studentGroups.map(group => {
        const subjectDetails = allSubjectsResponse.find(s => s.id === group.subjectId);
        const lecturerDetails = allUsersResponse.find(u => u.uid === group.lecturerId);
        
        const groupGrades = allGradesResponse
          .filter(grade => grade.studentId === studentId && grade.groupId === group.id)
          .map(grade => grade.value);

        return {
          ...group,
          subjectName: subjectDetails ? subjectDetails.name : 'Nieznany przedmiot',
          lecturerName: lecturerDetails ? `${lecturerDetails.name}` : 'Nieznany prowadzący',
          grades: groupGrades,
          groupType: group.name.includes('_WYK') ? 'Wykład' : group.name.includes('_CW') ? 'Ćwiczenia' : group.name.includes('_LAB') ? 'Laboratoria' : group.name.includes('_PRO')? 'Projekt' : 'Nieznany typ zajęć',
        };
      });

      // Grupuj grupy po subjectId
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
      Alert.alert('Błąd podczas pobierania danych', err.message);
      console.error('Błąd:', err);
    }
  };

  const toggleSubjectExpansion = (subjectId) => {
    setExpandedSubjectId(expandedSubjectId === subjectId ? null : subjectId);
  };

  const renderGroupItem = (group) => {
    return (
      <View key={group.id} style={styles.groupCard}>
        <Text style={styles.groupCardTitle}>{group.name}</Text>
        <Text style={styles.groupInfo}>Typ zajęć: {group.groupType}</Text>
        <Text style={styles.groupInfo}>Prowadzący: {group.lecturerName}</Text>
        <View style={styles.gradeRow}>
          {group.grades && group.grades.length > 0 ? (
            group.grades.map((grade, index) => (
              <View key={index} style={styles.gradeBox}>
                <Text style={styles.gradeText}>{grade}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noGradesText}>Brak ocen</Text>
          )}
        </View>
      </View>
    );
  };

  const renderSubjectItem = ({ item: subject }) => {
    const isExpanded = expandedSubjectId === subject.id;
    return (
      <View style={styles.subjectContainer}>
        <TouchableOpacity onPress={() => toggleSubjectExpansion(subject.id)} style={styles.subjectHeader}>
          <Text style={styles.subjectTitle}>{subject.name}</Text>
          <MaterialIcons name={isExpanded ? 'expand-less' : 'expand-more'} size={24} color={colors.primary} />
        </TouchableOpacity>
        {isExpanded && (
          <View style={styles.groupsListContainer}>
            {subject.groups.map(group => renderGroupItem(group))}
          </View>
        )}
      </View>
    );
  };

  const handleLogout = () => {
    auth.signOut()
      .then(() => {
        console.log('Użytkownik wylogował się pomyślnie.');
        navigation.replace('Login');
      })
      .catch((error) => {
        Alert.alert('Błąd', 'Nie udało się wylogować.');
      });
  };

  return (
    <SafeAreaView style={styles.safeArea}> 
      <View style={styles.container}>
        <Text style={styles.appTitle}>Usos</Text>
        <Text style={styles.sectionSubtitle}>Twoje przedmioty, grupy i oceny</Text>

        {subjectsWithGroups.length > 0 ? (
          <FlatList
            data={subjectsWithGroups}
            renderItem={renderSubjectItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <Text style={styles.noGroupsText}>Nie jesteś zapisany/a do żadnych grup.</Text>
        )}

<View style={{alignItems:'center', paddingVertical:20}}>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Wyloguj</Text>
      </TouchableOpacity>
    </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { // Styl dla SafeAreaView
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    // backgroundColor: colors.background, // Przeniesiono do safeArea
    paddingHorizontal: 10,
  },
  appTitle: {
    fontSize: width * 0.12, // Responsive font size
      fontWeight: 'bold',
      color: colors.darkYellow || '#FFA500', 
      marginBottom: 30,
      textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: 'gray',
    marginBottom: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  subjectContainer: {
    backgroundColor: colors.lightWhite,
    borderRadius: 10,
    marginBottom: 15,
    borderColor: colors.grey,
    borderWidth: 1,
    overflow: 'hidden', // Aby cienie i borderRadius działały poprawnie
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: colors.white, // Lekko inne tło dla nagłówka przedmiotu
  },
  subjectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  groupsListContainer: {
    paddingHorizontal: 15,
    paddingBottom: 15, // Dodano padding na dole listy grup
  },
  groupCard: { // Zmieniono z 'card' na 'groupCard' dla jasności
    backgroundColor: colors.white, // Tło dla karty grupy wewnątrz przedmiotu
    borderRadius: 8,
    padding: 12,
    marginTop: 10, // Margines górny dla pierwszej karty grupy
    borderWidth: 1,
    borderColor: colors.lightGrey, // Lżejsza ramka dla grupy
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  groupCardTitle: { // Styl dla tytułu grupy wewnątrz karty
    fontSize: 16,
    fontWeight: '600', // Nieco mniej pogrubiony niż tytuł przedmiotu
    color: colors.darkFont,
    marginBottom: 6,
  },
  groupInfo: {
    fontSize: 14,
    color: colors.darkFont,
    marginBottom: 5,
    lineHeight: 20,
  },
  gradeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 8,
  },
  gradeBox: {
    backgroundColor: colors.lightGrey,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginRight: 5,
    marginBottom: 5,
  },
  gradeText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.darkFont,
  },
  noGradesText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: colors.mediumGrey,
    marginTop: 5,
  },
  noGroupsText: {
    textAlign: 'center',
    fontSize: 16,
    color: colors.mediumGrey,
    marginTop: 50,
  },
  
  logoutButton:{
    width:window.width*0.45,
    backgroundColor: '#FF3B30',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: {
    width: 0,
    height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
    alignItems: 'center',
  },
  logoutButtonText:{
      color: colors.lightWhite,
      fontWeight:'bold',
      fontSize: 16,
  },
});

export default GlownyEkran;
