import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import GroupListItem from './GroupListItem';
import colors from '../../assets/colors/colors';

const SubjectListItem = ({ subject, isExpanded, onToggleExpansion }) => {
  return (
    <View style={styles.subjectContainer}>
      <TouchableOpacity onPress={() => onToggleExpansion(subject.id)} style={styles.subjectHeader}>
        <Text style={styles.subjectTitle}>{subject.name}</Text>
        <MaterialIcons name={isExpanded ? 'expand-less' : 'expand-more'} size={24} color={colors.primary} />
      </TouchableOpacity>
      {isExpanded && (
        <View style={styles.groupsListContainer}>
          {subject.groups.map(group => <GroupListItem key={group.id} group={group} />)}
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
    paddingBottom: 15,
  },
});

export default SubjectListItem;