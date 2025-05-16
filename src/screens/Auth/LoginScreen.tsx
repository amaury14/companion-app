import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Layout from '../../components/Layout';
import Loader from '../../components/Loader';
import { AuthStackParamList } from '../../navigation/AuthStack/AuthStack';
import { auth, db } from '../../services/firebase';
import { colors } from '../../theme/colors';
import { uiTexts } from '../../utils/data/ui-text-data';
import { asyncStorageKeys, dbKeys } from '../../utils/keys/db-keys';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);
    const [loginData, setLoginData] = useState<{ hasLogged: boolean; }>({ hasLogged: false });

    GoogleSignin.configure({
        webClientId: process.env.FIREBASE_WEB_CLIENT_ID ?? ''
    });

    const signIn = async () => {
        try {
            setError(false);
            setLoading(true);
            // Check if your device supports Google Play
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
            // Get the users ID token
            const signInResult = await GoogleSignin.signIn();

            // Try the new style of google-sign in result, from v13+ of that module
            const idToken = signInResult.data?.idToken;
            if (!idToken) {
                alert(uiTexts.loginError);
                setError(true);
            }

            // Create a Google credential with the token
            const googleCredential = GoogleAuthProvider.credential(idToken);

            // Sign-in the user with the credential
            const credential = await signInWithCredential(auth, googleCredential);

            // Checks for credentials
            // Checks if the user is saved in db, if not saves it
            if (credential?.user?.uid) {
                const userDoc = await getDoc(doc(db, dbKeys.users, credential.user.uid));
                if (!userDoc.exists()) {
                    await setDoc(doc(db, dbKeys.users, credential.user.uid), {
                        name: credential.user.displayName,
                        email: credential.user.email,
                        type: 'user',
                        verified: false,
                        reputationScore: 0,
                        completedServices: 0,
                    });
                }
            }

            return credential;
        } catch (error) {
            setError(true);
        }
        setLoading(false);
    };

    const getLoginData = useCallback(async () => {
        try {
            const jsonValue = await AsyncStorage.getItem(asyncStorageKeys.login);
            setLoginData(jsonValue ? JSON.parse(jsonValue) : null);
        } catch (e) {
            console.error('Error al obtener los datos', e);
            setError(true);
        }
    }, []);

    useEffect(() => {
        getLoginData();
    }, [getLoginData]);

    return (
        <Layout>
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.title}>{uiTexts.welcome}</Text>
                    {
                        loginData?.hasLogged &&
                        <TouchableOpacity style={styles.button} onPress={signIn}>
                            <Text style={styles.buttonText}>{uiTexts.loginGoogle}</Text>
                        </TouchableOpacity>
                    }
                    <TouchableOpacity style={{ ...styles.button, backgroundColor: colors.dragonblue }} onPress={() => navigation.navigate('LoginEmail')}>
                        <Text style={styles.buttonText}>{uiTexts.loginEmail}</Text>
                    </TouchableOpacity>
                    <Text onPress={() => navigation.navigate('Register')} style={styles.registerText}>{uiTexts.noAccountRegister}</Text>
                    {
                        loading &&
                        <Loader color={colors.azureblue} size={'large'}></Loader>
                    }
                    {error && <Text style={styles.actionsText}>{uiTexts.invalidCredentials}</Text>}
                </View>
            </View>
        </Layout>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center'
    },
    content: {
        alignItems: 'center',
        display: 'flex',
        height: 500,
        justifyContent: 'flex-start',
        padding: 5,
        width: '100%'
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 20
    },
    button: {
        alignItems: 'center',
        backgroundColor: colors.header,
        borderRadius: 8,
        marginTop: 20,
        paddingHorizontal: 24,
        paddingVertical: 12
    },
    buttonText: {
        color: colors.white,
        fontSize: 20,
        fontWeight: 'bold'
    },
    registerText: {
        color: colors.black,
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20
    },
    actionsText: {
        color: colors.darkergray,
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20
    }
});
