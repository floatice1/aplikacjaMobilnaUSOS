import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

import GrupyScreen from './GrupyScreen';
import DodajGrupeScreen from './DodajGrupeScreen';
import EdytujGrupeScreen from './EdytujGrupeScreen';
import ZarzadzajStudentamiGrupyScreen from './ZarzadzajStudentamiGrupyScreen';

const Stack = createStackNavigator();

const GrupyNavigation = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false
      }}>
      <Stack.Screen 
        name="GrupyScreen" 
        component={GrupyScreen}
      />
      <Stack.Screen 
        name="DodajGrupeScreen" 
        component={DodajGrupeScreen}
      />
      <Stack.Screen 
        name="EdytujGrupeScreen" 
        component={EdytujGrupeScreen}
      />
      <Stack.Screen 
        name="ZarzadzajStudentamiGrupyScreen" 
        component={ZarzadzajStudentamiGrupyScreen}
      />
    </Stack.Navigator>
  );
};

export default GrupyNavigation;
