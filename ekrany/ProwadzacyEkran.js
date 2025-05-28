import React, { useState, useEffect } from 'react';
import {
  View, 
  Text, 
  TextInput, 
  Alert, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions,
  SafeAreaView,
  FlatList,
  ActivityIndicator // Dodaj ActivityIndicator
} from 'react-native';
// import { Picker } from '@react-native-picker/picker'; // Jeśli nie jest używany, można usunąć
// import { getAuth } from 'firebase/auth'; // Już niepotrzebne bezpośrednio tutaj
import colors from '../assets/colors/colors';
import { useNavigation, useFocusEffect } from '@react-navigation/native'; // Dodaj useFocusEffect
// import { api } from '../serwisy/api'; // Już niepotrzebne bezpośrednio tutaj
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { handleLogout as performLogout } from '../utils/authUtils';
import { useLecturerData } from '../hooks/useLecturerData'; // Import nowego hooka
import LecturerSubjectListItem from './ProwadzacyEkranComponents/LecturerSubjectListItem'; // Import nowego komponentu

const { width, height } = Dimensions.get('window');

const ProwadzacyEkran = () => {
  const {
    subjectsWithGroupsAndStudents,
    isLoading,
    error,
    refreshData,
    handleAddOrUpdateGrade // Zmieniona nazwa w hooku
  } = useLecturerData();

  const [expandedSubjectId, setExpandedSubjectId] = useState(null);
  const [expandedGroupId, setExpandedGroupId] = useState(null);
  const [gradeToAdd, setGradeToAdd] = useState('');
  const [selectedStudentIdForGrade, setSelectedStudentIdForGrade] = useState('');
  
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      refreshData();
    }, [refreshData])
  );

  const onLogoutPress = () => {
    performLogout(navigation);
  };

  const toggleSubjectExpansion = (subjectId) => {
    setExpandedSubjectId(expandedSubjectId === subjectId ? null : subjectId);
    setExpandedGroupId(null); 
  };

  const toggleGroupExpansion = (groupId) => {
    setExpandedGroupId(expandedGroupId === groupId ? null : groupId);
  };

  // Funkcja do obsługi zmiany tekstu oceny
  const handleGradeInputChange = (studentId, text) => {
    setSelectedStudentIdForGrade(studentId);
    setGradeToAdd(text);
  };

  // Funkcja do dodawania/aktualizacji oceny (używa funkcji z hooka)
  const handleAddGradePress = async (studentId, groupId) => {
    const success = await handleAddOrUpdateGrade(studentId, groupId, gradeToAdd);
    if (success) {
      setGradeToAdd('');
      setSelectedStudentIdForGrade('');
      // refreshData() jest już w hooku
    }
  };

  // Ta funkcja została zastąpiona przez nowy komponent StudentGradeItem
  // const renderStudentItem = (student, group) => { ... };

  const renderGroupItem = (group) => {
    const isExpanded = expandedGroupId === group.id;
    return (
    <View key={group.id} style={styles.groupContainer}>
      <TouchableOpacity onPress={() => toggleGroupExpansion(group.id)} style={styles.groupHeader}>
        <Text style={styles.groupTitle}>{group.name} ({group.groupType})</Text>
        <MaterialIcons name={isExpanded ? 'expand-less' : 'expand-more'} size={24} color={colors.primary} />
      </TouchableOpacity>
      {isExpanded && (
        <View style={styles.studentsListContainer}>
          {group.students && group.students.length > 0 ? (
            group.students.map(student => renderStudentItem(student, group))
          ) : (
            <Text style={styles.noStudentsText}>Brak studentów w tej grupie.</Text>
          )}
        </View>
      )}
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
          {subject.groups && subject.groups.length > 0 ? (
            subject.groups.map(group => renderGroupItem(group))
          ) : (
            <Text style={styles.noGroupsText}>Brak grup dla tego przedmiotu.</Text>
          )}
        </View>
      )}
    </View>
  );
  };

  if (isLoading && subjectsWithGroupsAndStudents.length === 0) { // Pokaż ładowanie tylko przy pierwszym ładowaniu
    return (
      <SafeAreaView style={styles.safeAreaCentered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Ładowanie danych...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeAreaCentered}>
        <Text style={styles.errorText}>Wystąpił błąd podczas ładowania danych.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refreshData}>
          <Text style={styles.retryButtonText}>Spróbuj ponownie</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.appTitle}>Usos</Text>
        <Text style={styles.sectionSubtitle}>Twoje przedmioty i grupy</Text>

        {subjectsWithGroupsAndStudents.length > 0 ? (
          <FlatList
            data={subjectsWithGroupsAndStudents}
            renderItem={({ item: subject }) => (
              <LecturerSubjectListItem 
                subject={subject}
                isExpanded={expandedSubjectId === subject.id}
                onToggleExpansion={toggleSubjectExpansion}
                expandedGroupId={expandedGroupId}
                onToggleGroupExpansion={toggleGroupExpansion}
                // renderStudentItem={renderStudentItem} // Usuwamy to
                // Przekazujemy nowe propsy i funkcje obsługi
                gradeToAdd={gradeToAdd}
                onGradeChange={handleGradeInputChange}
                onAddGrade={handleAddGradePress}
                selectedStudentIdForGrade={selectedStudentIdForGrade}
              />
            )}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            onRefresh={refreshData} 
            refreshing={isLoading} 
          />
        ) : (
          !isLoading && <Text style={styles.noDataText}>Nie prowadzisz żadnych przedmiotów lub brak danych.</Text>
        )}

<View style={{alignItems:'center', paddingVertical:20}}>
      <TouchableOpacity onPress={onLogoutPress} style={styles.logoutButton}>
        <Text style={styles.logoutButtonText}>Wyloguj</Text>
      </TouchableOpacity>
    </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
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
  // Styles for subjectContainer, subjectHeader, subjectTitle, groupsListContainer, noGroupsText,
  // groupContainer, groupHeader, groupTitle, studentsListContainer, noStudentsText,
  // studentCard, studentName, gradesText, gradeInputContainer, input, button, addGradeButton, buttonText
  // have been moved to their respective components (LecturerSubjectListItem, LecturerGroupListItem, StudentGradeItem).
  // They are removed from here.
  safeAreaCentered: { // This style was in your ProwadzacyEkran.js for loading/error, ensure it's kept if still used
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: { // This style was in your ProwadzacyEkran.js for loading, ensure it's kept if still used
    marginTop: 10,
    fontSize: 16,
    color: colors.primary,
  },
  errorText: { // This style was in your ProwadzacyEkran.js for error, ensure it's kept if still used
    fontSize: 16,
    color: colors.error, // Assuming you have colors.error
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: { // This style was in your ProwadzacyEkran.js for error, ensure it's kept if still used
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  retryButtonText: { // This style was in your ProwadzacyEkran.js for error, ensure it's kept if still used
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 16,
    color: colors.mediumGrey,
    marginTop: 40,
  },
  logoutButton:{
    width:width*0.45, // Corrected: window.width to width
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

export default ProwadzacyEkran;
