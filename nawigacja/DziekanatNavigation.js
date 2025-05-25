import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import PrzedmiotyNavigation from '../ekrany/DziekanatPrzedmioty/PrzedmiotyNavigation';
import { FontAwesome } from '@expo/vector-icons';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Wylogowanie from '../ekrany/Wylogowanie';
import DziekUzytNavigation from '../ekrany/DziekanatUzytkownicy/DziekUzytNavigation';
import GrupyNavigation from '../ekrany/DziekanatGrupy/GrupyNavigation';

const iconsName = {
    'DziekanatUzytkownicy':'users',
    'PrzedmiotyNavigation':'book',
    'GrupyNavigation':'plus-square-o',
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
            <Tab.Screen name="DziekanatUzytkownicy" component={DziekUzytNavigation} />
            <Tab.Screen name="GrupyNavigation" component={GrupyNavigation} />
            <Tab.Screen name="PrzedmiotyNavigation" component={PrzedmiotyNavigation} />
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