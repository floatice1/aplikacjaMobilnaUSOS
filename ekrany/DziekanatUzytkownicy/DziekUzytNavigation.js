import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

import DziekUzytScreen from './DziekUzytScreen';
import DodajUzytScreen from './DodajUzytScreen';
import EdytUzytScreen from './EdytUzytScreen';
import WykladowcaGrupyScreen from './WykladowcaGrupyScreen';
import StudentGrupyScreen from './StudentGrupyScreen';

const Stack = createStackNavigator();

const DziekUzytNavigation = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false
      }}>
      <Stack.Screen 
        name="DziekUzytScreen" 
        component={DziekUzytScreen}
      />
      <Stack.Screen 
        name="DodajUzytScreen" 
        component={DodajUzytScreen}
      />
      <Stack.Screen
        name="EdytUzytScreen"
        component={EdytUzytScreen}
      />
      <Stack.Screen
        name="WykladowcaGrupyScreen"
        component={WykladowcaGrupyScreen}
      />
      <Stack.Screen
        name="StudentGrupyScreen"
        component={StudentGrupyScreen}
      />
    </Stack.Navigator>
  );
};

export default DziekUzytNavigation;
