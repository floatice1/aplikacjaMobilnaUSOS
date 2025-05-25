import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

import PrzedmiotyEkran from './PrzedmiotyEkran';
import DodajPrzedmiotScreen from './DodajPrzedmiotScreen';
import EdytujPrzedmiotScreen from './EdytujPrzedmiotScreen';

const Stack = createStackNavigator();

const PrzedmiotyNavigation = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false
      }}>
      <Stack.Screen 
        name="PrzedmiotyEkran" 
        component={PrzedmiotyEkran}
      />
      <Stack.Screen 
        name="DodajPrzedmiotScreen" 
        component={DodajPrzedmiotScreen}
      />
      <Stack.Screen 
        name="EdytujPrzedmiotScreen" 
        component={EdytujPrzedmiotScreen}
      />
    </Stack.Navigator>
  );
};

export default PrzedmiotyNavigation;
