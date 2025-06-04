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
import LecturerGroupListItem from './LecturerGroupListItem';

const { width } = Dimensions.get('window');

const LecturerSubjectListItem = ({ 
    subject, 
    isExpanded, 
    onToggleExpansion,
    expandedGroupId,
    onToggleGroupExpansion,
    gradeToAdd,
    onGradeChange,
    onAddGrade,
    selectedStudentIdForGrade
}) => {
  return (
    <View style={styles.subjectContainer}>
      <TouchableOpacity onPress={() => onToggleExpansion(subject.id)} style={styles.subjectHeader}>
        <Text style={styles.subjectTitle}>{subject.name}</Text>
        <MaterialIcons name={isExpanded ? 'expand-less' : 'expand-more'} size={24} color={colors.primary} />
      </TouchableOpacity>
      {isExpanded && (
        <View style={styles.groupsListContainer}>
          {subject.groups && subject.groups.length > 0 ? (
            subject.groups.map(group => (
              <LecturerGroupListItem
                key={group.id}
                group={group}
                isExpanded={expandedGroupId === group.id}
                onToggleExpansion={onToggleGroupExpansion}
                
                
                gradeToAdd={gradeToAdd}
                onGradeChange={onGradeChange}
                onAddGrade={onAddGrade}
                selectedStudentIdForGrade={selectedStudentIdForGrade}
              />
            ))
          ) : (
            <Text style={styles.noGroupsText}>Brak grup dla tego przedmiotu.</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  subjectContainer: {
    backgroundColor: colors.lightWhite,
    borderRadius: 10,
    marginBottom: 15,
    borderColor: colors.grey,
    borderWidth: 1,
    overflow: 'hidden',
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: colors.white,
  },
  subjectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  groupsListContainer: {
    paddingHorizontal: 15,
    paddingBottom: 10, 
  },
  noGroupsText: {
    textAlign: 'left',
    fontSize: 14,
    fontStyle: 'italic',
    color: colors.mediumGrey,
    paddingVertical: 10, 
  },
});

export default LecturerSubjectListItem;