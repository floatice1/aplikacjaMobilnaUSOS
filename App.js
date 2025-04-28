import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import Stos from './nawigacja/Stos';

export default function App() {
  return (
    <NavigationContainer>
      <Stos />
    </NavigationContainer>
  );
}


