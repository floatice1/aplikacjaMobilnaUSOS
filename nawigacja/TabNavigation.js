import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import GlownyEkran from '../ekrany/GlownyEkran';
import { FontAwesome } from '@expo/vector-icons';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
const TabNavigation = () => {
    
    const Tab = createBottomTabNavigator();

    const iconsName = {
        'GlownyEkran':'home',
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

    return (
        <Tab.Navigator screenOptions={screenOptions}>
            <Tab.Screen name="GlownyEkran" component={GlownyEkran} />
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
export default TabNavigation