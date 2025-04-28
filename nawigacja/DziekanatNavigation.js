import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import DziekanatEkran from '../ekrany/DziekanatEkran';

const DziekanatNavigation = () => {
    
    const Tab = createBottomTabNavigator();

    return (
        <Tab.Navigator screenOptions={{headerShown:false}}>
            <Tab.Screen name="DziekanatEkran" component={DziekanatEkran} />
        </Tab.Navigator>
  )
}

export default DziekanatNavigation