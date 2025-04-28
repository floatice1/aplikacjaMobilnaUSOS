import React from 'react'
import RejestracjaEkran from '../ekrany/RejestracjaEkran';
import LogowanieEkran from '../ekrany/LogowanieEkran';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigation from './TabNavigation';
import AdminEkran from '../ekrany/AdminEkran';
import DziekanatNavigation from './DziekanatNavigation';


const stos = createNativeStackNavigator();

const Stos = () => {
  return (
    <stos.Navigator> 
          <stos.Screen options={{headerShown: false}} name='Login' component={LogowanieEkran}/>
          <stos.Screen options={{headerShown: false}} name='Rejestracja' component={RejestracjaEkran} />
          <stos.Screen options={{headerShown: false}} name='TabNavigation' component={TabNavigation}/>
          <stos.Screen options={{headerShown: false}} name='AdminEkran' component={AdminEkran}/>
          <stos.Screen options={{headerShown: false}} name='DziekanatNavigation' component={DziekanatNavigation}/>

    </stos.Navigator>
  )
}

export default Stos

