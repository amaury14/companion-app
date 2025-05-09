import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../../screens/Auth/LoginScreen';
import LoginEmailScreen from '../../screens/Auth/LoginEmailScreen';
import RegisterScreen from '../../screens/Auth/RegisterScreen';

export type AuthStackParamList = {
    Login: undefined;
    LoginEmail: undefined;
    Register: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack() {
    return (
        <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{ headerShown: false }}
        >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="LoginEmail" component={LoginEmailScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
    );
}
