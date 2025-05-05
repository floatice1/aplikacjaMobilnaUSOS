import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import DziekanatEkran from '../ekrany/DziekanatEkran';
import StudentOcenyEkran from '../ekrany/StudentOcenyEkran';
import ProwadzacyPrzedmiotyEkran from '../ekrany/ProwadzacyPrzedmiotyEkran';

const DziekanatNavigation = () => {
    
    const Tab = createBottomTabNavigator();

    return (
        <Tab.Navigator screenOptions={{headerShown:false}}>
            <Tab.Screen name="DziekanatEkran" component={DziekanatEkran} />
            <Tab.Screen name="StudentOcenyEkran" component={StudentOcenyEkran} />
            <Tab.Screen name="ProwadzacyPrzedmiotyEkran" component={ProwadzacyPrzedmiotyEkran} />
        </Tab.Navigator>
      
        
     
  )
}

export default DziekanatNavigation