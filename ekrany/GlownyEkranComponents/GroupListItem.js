import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../../assets/colors/colors'; // Dostosuj ścieżkę do colors

const GroupListItem = ({ group }) => {
  return (
    <View style={styles.groupCard}>
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

const styles = StyleSheet.create({
  groupCard: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.lightGrey,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  groupCardTitle: {
    fontSize: 16,
    fontWeight: '600',
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
});

export default GroupListItem;