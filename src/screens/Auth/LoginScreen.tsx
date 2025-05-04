import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Text, TouchableOpacity } from 'react-native';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { getAuth, GoogleAuthProvider, signInWithCredential, signInWithEmailAndPassword } from 'firebase/auth';

import Layout from '../../components/Layout';
import Loader from '../../components/Loader';
import { AuthStackParamList } from '../../navigation/AuthStack/AuthStack';
import { auth } from '../../services/firebase';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

type LoginFormData = {
    email: string;
    password: string;
};

export default function LoginScreen({ navigation }: Props) {
    const { control, handleSubmit } = useForm<LoginFormData>();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);

    GoogleSignin.configure({
        webClientId: process.env.FIREBASE_WEB_CLIENT_ID ?? '',
    });

    const onLogin: SubmitHandler<LoginFormData> = async ({ email, password }) => {
        try {
            setError(false);
            setLoading(true);
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            setError(true);
        }
        setLoading(false);
    };

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
                throw new Error('No ID token found');
            }

            // Create a Google credential with the token
            const googleCredential = GoogleAuthProvider.credential(idToken);

            // Sign-in the user with the credential
            return signInWithCredential(getAuth(), googleCredential);
        } catch (error) {
            setError(true);
        }
        setLoading(false);
    };

    return (
        <Layout>
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.registerText}>Correo electrónico</Text>
                    <View style={{ width: '80%' }}>
                        <Controller
                            control={control}
                            name="email"
                            render={({ field: { onChange, value } }) => (
                                <TextInput value={value} onChangeText={onChange} style={styles.input} />
                            )}
                        />
                    </View>
                    <Text style={styles.registerText}>Contraseña</Text>
                    <View style={{ width: '80%' }}>
                        <Controller
                            control={control}
                            name="password"
                            render={({ field: { onChange, value } }) => (
                                <TextInput secureTextEntry value={value} onChangeText={onChange} style={styles.input} />
                            )}
                        />
                    </View>
                    <TouchableOpacity style={styles.button} onPress={handleSubmit(onLogin)}>
                        <Text style={styles.buttonText}>INICIAR SESIÓN</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={signIn}>
                        <Text style={styles.buttonText}>ENTRAR CON GOOGLE</Text>
                    </TouchableOpacity>
                    <Text onPress={() => navigation.navigate('Register')} style={styles.registerText}>¿No tenés cuenta? Regístrate</Text>
                    {
                        loading &&
                        <Loader color={colors.azureblue} size={'large'}></Loader>
                    }
                    {error && <Text style={styles.actionsText}>Credenciales Inválidas!!!</Text>}
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
        justifyContent: 'flex-start',
        height: 500,
        padding: 5,
        width: '100%'
    },
    input: { borderBottomWidth: 1, fontSize: 18 },
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
