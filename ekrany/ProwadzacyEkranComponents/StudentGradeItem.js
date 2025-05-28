import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions
} from 'react-native';
import colors from '../../assets/colors/colors';

const { width } = Dimensions.get('window');

const StudentGradeItem = ({ 
    student,
    group,
    gradeToAdd,
    onGradeChange,
    onAddGrade, 
    selectedStudentIdForGrade
}) => {
  const currentGroupGrades = student.grades.filter(grade => grade.groupId === group.id);
  const gradeValues = currentGroupGrades.map(g => g.value);

  return (
    <View key={student.id} style={styles.studentCard}>
      <Text style={styles.studentName}>{student.name} ({student.email})</Text>
      {gradeValues.length > 0 ? (
        <Text style={styles.gradesText}>Istniejące oceny: {gradeValues.join(', ')}</Text>
      ) : (
        <Text style={styles.gradesText}>Brak ocen.</Text>
      )}
      <View style={styles.gradeInputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Wpisz ocenę (2-5)"
          placeholderTextColor={colors.mediumGrey}
          value={selectedStudentIdForGrade === student.id ? gradeToAdd : ''}
          onChangeText={(text) => onGradeChange(student.id, text)}
          keyboardType="numeric"
        />
        <TouchableOpacity
          style={[styles.button, styles.addGradeButton]}
          onPress={() => onAddGrade(student.id, group.id)}
        >
          <Text style={styles.buttonText}>{currentGroupGrades.length > 0 ? 'Aktualizuj' : 'Dodaj'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  studentCard: {
    backgroundColor: colors.lightWhite, 
    borderRadius: 6,
    padding: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.extraLightGrey, 
  },
  studentName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.darkFont,
    marginBottom: 5, 
  },
  gradesText: { 
    fontSize: 14,
    color: colors.mediumGrey,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  gradeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  input: {
    flex: 1, 
    borderWidth: 1,
    borderColor: colors.lightGrey,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginRight: 10, 
    backgroundColor: colors.white,
    fontSize: 15,
    color: colors.darkFont,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  addGradeButton: {
    paddingHorizontal: 15, 
    paddingVertical: 10,
  },
  buttonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default StudentGradeItem;