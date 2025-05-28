import React from 'react';
import { View, TouchableOpacity, Text, Alert } from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import localStyles from './styles';
import colors from '../../assets/colors/colors';
import { api } from '../../serwisy/api';

const GroupListItem = ({ 
    item, 
    isExpanded, 
    onToggleExpand, 
    onEdit, 
    onDeleteGroup,
    onAddStudent, 
    onRemoveStudent 
}) => {

    const handleDelete = () => {
        Alert.alert(
            "Potwierdź usunięcie",
            `Czy na pewno chcesz usunąć grupę "${item.name}"?`,
            [
                {
                    text: "Anuluj",
                    style: "cancel"
                },
                { 
                    text: "Usuń", 
                    onPress: async () => {
                        try {
                            await api.delete(`grupy/${item.id}`);
                            onDeleteGroup(item.id);
                        } catch (error) {
                            console.error("Nie udało się usunąć grupy:", error);
                            Alert.alert("Błąd", "Nie udało się usunąć grupy. Spróbuj ponownie później.");
                        }
                    },
                    style: "destructive" 
                }
            ],
            { cancelable: false }
        );
    };

    return (
        <TouchableOpacity
            style={localStyles.userItem}
            onPress={onToggleExpand}
        >
            <Text style={localStyles.userName}>{item.name}</Text>
            {isExpanded && (
                <View style={localStyles.flexContainer}>
                    <View style={localStyles.expandedUserInfo}>
                        <View style={localStyles.userInfoText}>
                            <View style={localStyles.userInfoRow}>
                                <Text style={localStyles.userInfoText}>Typ: {item.groupType}</Text>
                            </View>
                            <View style={localStyles.userInfoRow}>
                                <Text style={localStyles.userInfoText}>Przedmiot: {item.subjectName}</Text>
                            </View>
                            <View style={localStyles.userInfoRow}>
                                <Text style={localStyles.userInfoText}>Wykładowca: {item.lecturerName}</Text>
                            </View>
                            <View style={localStyles.userInfoRow}>
                                <Text style={localStyles.userInfoText}>Liczba studentów: {item.studentCount}</Text>
                            </View>
                        </View>
                        <View style={localStyles.actionButtonsContainer}>
                            <TouchableOpacity onPress={() => onEdit(item.id)} style={localStyles.iconButton}>
                                <FontAwesome name="pencil" size={32} color={colors.background} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleDelete} style={[localStyles.iconButton]}>
                                <FontAwesome name="trash" size={32} color="#2ecc71" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={localStyles.studentActionButtonsContainer}>
                        <TouchableOpacity onPress={() => onAddStudent(item.id, item.name)} style={[localStyles.iconButton, localStyles.StudentButton]}>
                            <MaterialIcons name="person-add" size={32} color={colors.primary} /> 
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onRemoveStudent(item.id, item.name)} style={[localStyles.iconButton, localStyles.StudentButton]}>
                            <MaterialIcons name="person-remove" size={32} color={colors.danger} /> 
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </TouchableOpacity>
    );
};

export default GroupListItem;