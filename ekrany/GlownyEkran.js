import React, { useState, useEffect } from 'react';
import {
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Alert, 
  TouchableOpacity, 
  SafeAreaView,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import colors from '../assets/colors/colors';
import SubjectListItem from './GlownyEkranComponents/SubjectListItem'; 
import useStudentDashboardData from '../hooks/useStudentDashboardData';
import { handleLogout as performLogout } from '../utils/authUtils';

const { width } = Dimensions.get('window');

const GlownyEkran = () => {
  const { subjectsWithGroups, isLoading, error, refreshData } = useStudentDashboardData();
  const [expandedSubjectId, setExpandedSubjectId] = useState(null);
  
  const auth = getAuth();
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      refreshData();
    }, [refreshData])
  );

  const toggleSubjectExpansion = (subjectId) => {
    setExpandedSubjectId(expandedSubjectId === subjectId ? null : subjectId);
  };

  const renderSubjectItem = ({ item: subject }) => {
    return (
      <SubjectListItem 
        subject={subject} 
        isExpanded={expandedSubjectId === subject.id}
        onToggleExpansion={toggleSubjectExpansion}
      />
    );
  };

  const onLogoutPress = () => {
    performLogout(navigation);
  };

  if (isLoading) {
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
        <Text style={styles.sectionSubtitle}>Twoje przedmioty, grupy i oceny</Text>

        {subjectsWithGroups.length > 0 ? (
          <FlatList
            data={subjectsWithGroups}
            renderItem={renderSubjectItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            onRefresh={refreshData}
            refreshing={isLoading}
          />
        ) : (
          <Text style={styles.noGroupsText}>Nie jesteś zapisany/a do żadnych grup.</Text>
        )}

        <View style={{alignItems:'center', paddingVertical:20}}>
          <TouchableOpacity style={styles.logoutButton} onPress={onLogoutPress}>
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
  safeAreaCentered: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical:20
  },
  appTitle: {
    fontSize: width * 0.12,
    fontWeight: 'bold',
    color: colors.darkYellow || '#FFA500', 
    marginBottom: 20,
    textAlign: 'center',
    marginTop: 20,
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
  noGroupsText: {
    textAlign: 'center',
    fontSize: 16,
    color: colors.mediumGrey,
    marginTop: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.primary,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 16,
  },
  logoutButton:{
    width: width * 0.45,
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
