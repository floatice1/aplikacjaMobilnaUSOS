import React from 'react'
import LogowanieEkran from '../ekrany/LogowanieEkran';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DziekanatNavigation from './DziekanatNavigation';
import ProwadzacyEkran from '../ekrany/ProwadzacyEkran';
import GlownyEkran from '../ekrany/GlownyEkran';

const stos = createNativeStackNavigator();

const Stos = () => {
  return (
    <stos.Navigator>
          <stos.Screen options={{headerShown: false}} name='Login' component={LogowanieEkran}/>
          <stos.Screen options={{headerShown: false}} name='GlownyEkran' component={GlownyEkran}/>
          <stos.Screen options={{headerShown: false}} name='ProwadzacyEkran' component={ProwadzacyEkran}/>
          <stos.Screen options={{headerShown: false}} name='DziekanatNavigation' component={DziekanatNavigation}/>
    </stos.Navigator>
  )
}

export default Stos

