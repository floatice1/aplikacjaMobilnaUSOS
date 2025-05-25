import React, { useState } from 'react';
import { 
    View, 
    TouchableOpacity, 
    Text, 
    TextInput, 
    ScrollView, 
    Keyboard,
    TouchableWithoutFeedback 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import localStyles from './styles';
import { api } from '../../serwisy/api';

export default function DodajPrzedmiotScreen({ navigation }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = async () => {
        try {
            const response = await api.post('przedmioty/', {
                nazwa: name,
                opis: description
            });

            if (response) {
                navigation.goBack();
            } else {
                console.error('Nieoczekiwany status odpowiedzi:', response.status);
            }
        } catch (error) {
            console.error('Błąd podczas tworzenia przedmiotu:', error);
        }
    }

    return (
        <SafeAreaView style={localStyles.safeArea}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={localStyles.container}>
                    <View style={localStyles.formContainer}>
                        <View style={localStyles.inputContainer}>
                            <Text style={localStyles.label}>Nazwa przedmiotu:</Text>
                            <TextInput
                                style={localStyles.input}
                                placeholder="Wprowadź nazwę przedmiotu"
                                onChangeText={(text) => setName(text)}
                                value={name}
                            />
                        </View>

                        <View style={localStyles.inputContainer}>
                            <Text style={localStyles.label}>Opis przedmiotu:</Text>
                            <TextInput
                                style={[localStyles.input, { height: 100, textAlignVertical: 'top' }]}
                                placeholder="Wprowadź opis przedmiotu"
                                onChangeText={(text) => setDescription(text)}
                                value={description}
                                multiline={true}
                                numberOfLines={4}
                            />
                        </View>

                        <TouchableOpacity 
                            style={localStyles.addButton}
                            onPress={handleSubmit}
                        >
                            <Text style={localStyles.addButtonText}>Dodaj Przedmiot</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    )
}