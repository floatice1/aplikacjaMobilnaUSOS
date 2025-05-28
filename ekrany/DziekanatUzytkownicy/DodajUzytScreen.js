import React, { useState} from 'react'
import { View, TouchableOpacity, Text, TextInput } from 'react-native'
import { SafeAreaView } from 'react-native'
import localStyles from './styles'
import { Picker } from '@react-native-picker/picker'
import { api } from '../../serwisy/api'

export default function DodajUzytkownika({ navigation }) {
    const [imie, setImie] = useState('');
    const [rola, setRola] = useState('');
    const [email, setEmail] = useState('');
    const [haslo, setHaslo] = useState('');

    const obsluzPrzeslanie = async () => {
        try {
            const response = await api.post('uzytkownicy/', {
                imie: imie,
                email: email,
                haslo: haslo,
                rola: rola
            });

            if (response) {
                navigation.goBack();
            } else {
                console.error('Unexpected response status:', response.status);
            }
        } catch (error) {
            console.error('Error creating user:', error);
        }
    }

    return (
        <SafeAreaView style={localStyles.safeArea}>
            <View style={localStyles.container}>
                <View style={localStyles.formContainer}>
                    <View style={localStyles.inputContainer}>
                        <Text style={localStyles.label}>Imię:</Text>
                        <TextInput
                            style={localStyles.input}
                            placeholder="Wprowadź imię użytkownika"
                            onChangeText={(tekst) => setImie(tekst)}
                            value={imie}
                        />
                    </View>

                    <View style={localStyles.inputContainer}>
                        <Text style={localStyles.label}>Email:</Text>
                        <TextInput
                            style={localStyles.input}
                            placeholder="Wprowadź email użytkownika"
                            onChangeText={(tekst) => setEmail(tekst)}
                            value={email}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={localStyles.inputContainer}>
                        <Text style={localStyles.label}>Hasło:</Text>
                        <TextInput
                            style={localStyles.input}
                            placeholder="Wprowadź hasło użytkownika"
                            onChangeText={(tekst) => setHaslo(tekst)}
                            value={haslo}
                            secureTextEntry={true}
                        />
                    </View>

                    <View style={localStyles.inputContainer}>
                        <Text style={localStyles.label}>Rola:</Text>
                        <Picker
                            style={localStyles.input}
                            selectedValue={rola}
                            onValueChange={(wartoscElementu) => setRola(wartoscElementu)}
                        >
                            <Picker.Item label="Dziekanat" value="dziekanat" />
                            <Picker.Item label="Student" value="student" />
                            <Picker.Item label="Wykladowca" value="wykladowca" />
                        </Picker>
                    </View>

                    <TouchableOpacity 
                        style={localStyles.addButton}
                        onPress={obsluzPrzeslanie}
                    >
                        <Text style={localStyles.addButtonText}>Dodaj Użytkownika</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    )
}