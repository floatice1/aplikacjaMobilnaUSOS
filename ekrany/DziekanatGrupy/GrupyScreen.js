import React, {useState, useEffect, useCallback} from 'react'
import { View, TouchableOpacity, Text, ActivityIndicator, SafeAreaView, FlatList, Alert } from 'react-native'
import localStyles from './styles'
import { api } from '../../serwisy/api'
import { TextInput } from 'react-native-gesture-handler';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import colors from '../../assets/colors/colors';
import { useGroupData } from '../../hooks/useGroupData';
import GroupListItem from './GroupListItem';

export default function GrupyScreen({ navigation }) {
    const {
        groupsDetails,
        isLoading,
        fetchData,
        removeGroupFromState 
    } = useGroupData();

    const [searchQuery, setSearchQuery] = useState('');
    const [filteredGroups, setFilteredGroups] = useState([]);
    const [expandedItemId, setExpandedItemId] = useState(null);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData])
    );

    useEffect(() => {
        let tempFilteredGroups = groupsDetails;

        if (searchQuery) {
            tempFilteredGroups = tempFilteredGroups.filter(group =>
                group.name && group.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredGroups(tempFilteredGroups);
    }, [searchQuery, groupsDetails]);

    const handleAddGroup = () => {
        navigation.navigate('DodajGrupeScreen');
    }

    const handleAddStudentToGroup = (groupId, groupName) => {
        navigation.navigate('ZarzadzajStudentamiGrupyScreen', { groupId, groupName, action: 'add' });
    };

    const handleRemoveStudentFromGroup = (groupId, groupName) => {
        navigation.navigate('ZarzadzajStudentamiGrupyScreen', { groupId, groupName, action: 'remove' });
    };

    const handleToggleExpand = (itemId) => {
        setExpandedItemId(prevId => (prevId === itemId ? null : itemId));
    };

    const handleEditGroup = (groupId) => {
        navigation.navigate('EdytujGrupeScreen', { id: groupId });
    };

    if (isLoading) {
        return (
            <SafeAreaView style={[localStyles.safeArea, localStyles.centered]}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Ładowanie grup...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={localStyles.safeArea}>
            <View style={localStyles.container}>
                <TextInput
                    style={localStyles.searchInput}
                    placeholder="Szukaj grupy po nazwie..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                />

                {filteredGroups.length === 0 && !isLoading ? (
                    <View style={[localStyles.container, localStyles.centered]}>
                        <Text style={localStyles.noUsersText}>Brak grup pasujących do kryteriów.</Text>
                    </View>
                    ) : (
                    <FlatList
                        data={filteredGroups}
                        renderItem={({ item }) => (
                            <GroupListItem
                                item={item}
                                isExpanded={item.id === expandedItemId}
                                onToggleExpand={() => handleToggleExpand(item.id)}
                                onEdit={handleEditGroup}
                                onDeleteGroup={removeGroupFromState}
                                onAddStudent={handleAddStudentToGroup}
                                onRemoveStudent={handleRemoveStudentFromGroup}
                            />
                        )}
                        keyExtractor={item => item.id}
                    />
                )}
                <TouchableOpacity
                        style={localStyles.addButton}
                        onPress={handleAddGroup}
                    >
                        <Text style={localStyles.addButtonText}>Dodaj grupę</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}