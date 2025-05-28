import React from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import colors from '../assets/colors/colors';
import { useNavigation } from '@react-navigation/native'; 
import { handleLogout as performLogout } from '../utils/authUtils';

const window = Dimensions.get("window");

const Wylogowanie = () => {
    const navigation = useNavigation();

    const onLogoutPress = () => {
        performLogout(navigation);
    };

  return (
    <View style={styles.container}>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogoutPress}>
          <Text style={styles.logoutButtonText}>Wyloguj</Text>
        </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
    container:{
        flex:1,
        justifyContent:'flex-end',
        alignItems:'center',
        padding:10
    },
    logoutButton:{
        width:window.width*0.35,
        backgroundColor: '#FF3B30',
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderRadius: 50,
        shadowColor: '#000',
        shadowOffset: {
        width: 0,
        height: 5,
        },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 5,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom:50
    },
    logoutButtonText:{
        color: colors.lightWhite,
        fontWeight:'bold',
        fontSize: 16,
    },
});

export default Wylogowanie;
