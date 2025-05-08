import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import DziekanatEkran from '../ekrany/DziekanatEkran';
import StudentOcenyEkran from '../ekrany/StudentOcenyEkran';
import ProwadzacyPrzedmiotyEkran from '../ekrany/ProwadzacyPrzedmiotyEkran';
import { FontAwesome } from '@expo/vector-icons';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Wylogowanie from '../ekrany/Wylogowanie';

const iconsName = {
    'DziekanatEkran':'plus-square-o',
    'StudentOcenyEkran':'graduation-cap',
    'ProwadzacyPrzedmiotyEkran':'user',
    'Wylogowanie':'sign-out',
  };

const CustomTabBarButton = ({ children, onPress, accessibilityState }) => {
    const isSelected = accessibilityState.selected;
    return (
      <TouchableOpacity
        style={styles.tabBarButton}
        onPress={onPress}
      >
        <View style={[styles.activeTabStyle, isSelected ? styles.selected : null]}>
          {children}
        </View>
      </TouchableOpacity>
    );
  };

const screenOptions = ({ route }) => ({
    tabBarIcon: ({ focused }) => (
      <FontAwesome
        name={iconsName[route.name]}
        size={15}
        color={focused ? "white" : "grey"}
      />
    ),
    tabBarButton: (props) => (
      <CustomTabBarButton
        {...props}
      />
    ),
    tabBarShowLabel: false,
    headerShown: false,
  });

const DziekanatNavigation = () => {
    
    const Tab = createBottomTabNavigator();

    return (
        <Tab.Navigator screenOptions={screenOptions}>
            <Tab.Screen name="DziekanatEkran" component={DziekanatEkran} />
            <Tab.Screen name="StudentOcenyEkran" component={StudentOcenyEkran} />
            <Tab.Screen name="ProwadzacyPrzedmiotyEkran" component={ProwadzacyPrzedmiotyEkran} />
            <Tab.Screen name="Wylogowanie" component={Wylogowanie} />
        </Tab.Navigator>
      
  )
}

const styles = StyleSheet.create({
    tabBarButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1F2937',
    },
    activeTabStyle: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    selected: {
        width: 40,
        height: 40,
        backgroundColor: 'silver',
        borderRadius: 15,
    },
});


export default DziekanatNavigation