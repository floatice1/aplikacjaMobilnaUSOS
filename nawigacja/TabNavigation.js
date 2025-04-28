import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import GlownyEkran from '../ekrany/GlownyEkran';

const TabNavigation = () => {
    
    const Tab = createBottomTabNavigator();

    return (
        <Tab.Navigator screenOptions={{headerShown:false}}>
            <Tab.Screen name="GlownyEkran" component={GlownyEkran} />
        
            
        </Tab.Navigator>
  )
}

export default TabNavigation