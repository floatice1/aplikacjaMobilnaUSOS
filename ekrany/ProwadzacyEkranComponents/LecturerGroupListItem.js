import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../../assets/colors/colors';
import StudentGradeItem from './StudentGradeItem'; // Import nowego komponentu

const { width } = Dimensions.get('window');

const LecturerGroupListItem = ({ 
    group, 
    isExpanded, 
    onToggleExpansion,
    // renderStudentItem // Już nie potrzebujemy tego propa
    // Dodajemy nowe propsy potrzebne dla StudentGradeItem
    gradeToAdd,
    onGradeChange,
    onAddGrade,
    selectedStudentIdForGrade
}) => {
  return (
    <View key={group.id} style={styles.groupContainer}>
      <TouchableOpacity onPress={() => onToggleExpansion(group.id)} style={styles.groupHeader}>
        <Text style={styles.groupTitle}>{group.name} ({group.groupType})</Text>
        <MaterialIcons name={isExpanded ? 'expand-less' : 'expand-more'} size={24} color={colors.primary} />
      </TouchableOpacity>
      {isExpanded && (
        <View style={styles.studentsListContainer}>
          {group.students && group.students.length > 0 ? (
            group.students.map(student => (
              <StudentGradeItem
                key={student.id} // Ważne: dodaj klucz tutaj
                student={student}
                group={group} // Przekazujemy grupę
                gradeToAdd={gradeToAdd}
                onGradeChange={onGradeChange}
                onAddGrade={onAddGrade}
                selectedStudentIdForGrade={selectedStudentIdForGrade}
              />
            ))
          ) : (
            <Text style={styles.noStudentsText}>Brak studentów w tej grupie.</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  groupContainer: { 
    backgroundColor: colors.white, 
    borderRadius: 8,
    paddingVertical: 5, 
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.lightGrey,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10, 
    paddingVertical: 8,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkFont,
  },
  studentsListContainer: {
    paddingHorizontal: 10, 
    paddingBottom: 10,
  },
  noStudentsText: {
    textAlign: 'left',
    fontSize: 14,
    fontStyle: 'italic',
    color: colors.mediumGrey,
    paddingVertical: 8,
  },
});

export default LecturerGroupListItem;