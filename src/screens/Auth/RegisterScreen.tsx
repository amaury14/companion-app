import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TextInput, Text, TouchableOpacity } from 'react-native';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import * as Location from 'expo-location';

import Layout from '../../components/Layout';
import Loader from '../../components/Loader';
import { AuthStackParamList } from '../../navigation/AuthStack/AuthStack';
import { auth, db } from '../../services/firebase';
import { colors } from '../../theme/colors';
import { asyncStorageKeys, dbKeys } from '../../utils/keys/db-keys';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

type RegisterFormData = {
    address: string;
    email: string;
    name: string;
    password: string;
    confirmPassword: string;
};

export default function RegisterScreen({ navigation }: Props) {
    const { control, handleSubmit, formState: { errors }, getValues } = useForm<RegisterFormData>();
    const [userType, setUserType] = useState<'user' | 'companion' | null>('user');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

    GoogleSignin.configure({
        webClientId: process.env.FIREBASE_WEB_CLIENT_ID ?? ''
    });

    const getLocation = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            alert('Permiso de ubicación denegado');
            return;
        }

        const loc = await Location.getCurrentPositionAsync({});
        setLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
        });
    };

    const validateAddress = async (address: string) => {
        try {
            const geocoded = await Location.geocodeAsync(address);
            if (geocoded.length === 0) {
                alert('Dirección inválida. Intenta con una más específica.');
                return null;
            }

            const { latitude, longitude } = geocoded[0];
            return { latitude, longitude };
        } catch (error) {
            console.error('Error geocoding address:', error);
            alert('Ocurrió un error al validar la dirección.');
            return null;
        }
    };

    const onRegister: SubmitHandler<RegisterFormData> = async ({ address, name, email, password, confirmPassword }) => {
        if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }

        try {
            // Get address from form
            const coords = address
                ? await validateAddress(address)
                : location;
            if (!coords?.latitude || !coords?.longitude) {
                alert('Dirección es requerida');
                return;
            }

            setError(false);
            setLoading(true);
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const uid = userCredential.user.uid;

            await setDoc(doc(db, dbKeys.users, uid), {
                address: coords,
                name,
                email,
                type: userType,
                verified: false,
                reputationScore: 0,
                completedServices: 0,
            });
        } catch (error) {
            console.error(error);
            setError(true);
            alert('Error al registrarse');
        }
        setLoading(false);
    };

    const signIn = async () => {
        try {
            const form = getValues();
            if (!form?.address) {
                alert('Dirección es requerida');
                return;
            }

            // Get address from form
            const coords = form?.address
                ? await validateAddress(form?.address)
                : location;
            if (!coords?.latitude || !coords?.longitude) {
                alert('Dirección es requerida');
                return;
            }

            setError(false);
            setLoading(true);
            // Check if your device supports Google Play
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
            // Get the users ID token
            const signInResult = await GoogleSignin.signIn();

            // Try the new style of google-sign in result, from v13+ of that module
            const idToken = signInResult.data?.idToken;
            if (!idToken) {
                alert('Error al iniciar sesión');
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
                        address: coords,
                        name: credential.user.displayName,
                        email: credential.user.email,
                        type: userType,
                        verified: false,
                        reputationScore: 0,
                        completedServices: 0,
                    });
                }

                try {
                    await AsyncStorage.setItem(asyncStorageKeys.login, JSON.stringify({ hasLogged: true }));
                } catch (e) {
                    console.error('Error al guardar los datos', e);
                    setError(true);
                }
            }

            return credential;
        } catch (error) {
            setError(true);
        }
        setLoading(false);
    };

    useEffect(() => {
        getLocation();
    }, []);

    return (
        <Layout>
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.registerText}>Nombre completo</Text>
                    <View style={{ width: '80%' }}>
                        <Controller
                            control={control}
                            name="name"
                            rules={{ required: 'Nombre es requerido' }}
                            render={({ field: { onChange, value } }) => (
                                <TextInput style={{ borderBottomWidth: 1 }} value={value} onChangeText={onChange} />
                            )}
                        />
                        {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}
                    </View>

                    <Text style={styles.registerText}>Correo electrónico</Text>
                    <View style={{ width: '80%' }}>
                        <Controller
                            control={control}
                            name="email"
                            rules={{
                                required: 'Email es requerido',
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: 'Email inválido',
                                },
                            }}
                            render={({ field: { onChange, value } }) => (
                                <TextInput style={{ borderBottomWidth: 1 }} value={value} onChangeText={onChange} keyboardType="email-address" />
                            )}
                        />
                        {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}
                    </View>

                    <Text style={styles.registerText}>Tipo de usuario</Text>
                    <View style={styles.accountType}>
                        <TouchableOpacity onPress={() => setUserType('user')}>
                            <Text style={{
                                backgroundColor: userType === 'user' ? colors.argentinianblue : colors.white,
                                fontSize: 18,
                                fontWeight: userType === 'user' ? 'bold' : 'normal',
                                padding: 10,
                                borderRadius: 5
                            }}>🧑 Usuario</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setUserType('companion')}>
                            <Text style={{
                                backgroundColor: userType === 'companion' ? colors.argentinianblue : colors.white,
                                fontSize: 18,
                                fontWeight: userType === 'companion' ? 'bold' : 'normal',
                                padding: 10,
                                borderRadius: 5
                            }}>🤝 Acompañante</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.registerText}>Dirección</Text>
                    <View style={{ width: '80%' }}>
                        <Controller
                            control={control}
                            name="address"
                            rules={{
                                required: 'Dirección es requerida'
                            }}
                            render={({ field: { onChange, value } }) => (
                                <TextInput style={{ borderBottomWidth: 1 }} value={value} onChangeText={onChange} />
                            )}
                        />
                        {errors.address && <Text style={styles.error}>{errors.address.message}</Text>}
                    </View>

                    <Text style={styles.registerText}>Contraseña</Text>
                    <View style={{ width: '80%' }}>
                        <Controller
                            control={control}
                            name="password"
                            rules={{
                                required: 'Contraseña es requerida',
                                minLength: { value: 6, message: 'Mínimo 6 caracteres' },
                            }}
                            render={({ field: { onChange, value } }) => (
                                <TextInput style={{ borderBottomWidth: 1 }} value={value} onChangeText={onChange} secureTextEntry />
                            )}
                        />
                        {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}
                    </View>

                    <Text style={styles.registerText}>Repita Contraseña</Text>
                    <View style={{ width: '80%' }}>
                        <Controller
                            control={control}
                            name="confirmPassword"
                            rules={{
                                required: 'Confirma tu contraseña',
                            }}
                            render={({ field: { onChange, value } }) => (
                                <TextInput style={{ borderBottomWidth: 1 }} value={value} onChangeText={onChange} secureTextEntry />
                            )}
                        />
                        {errors.confirmPassword && (
                            <Text style={styles.error}>{errors.confirmPassword.message}</Text>
                        )}
                    </View>

                    <TouchableOpacity style={styles.button} onPress={handleSubmit(onRegister)}>
                        <Text style={styles.buttonText}>Regístrame</Text>
                    </TouchableOpacity>
                    <Text style={styles.registerText}>O</Text>
                    <Text style={styles.registerTextGoogle}>Seleccione el tipo de usuario y rellene la dirección o se usará su ubicación actual</Text>
                    <TouchableOpacity style={styles.button} onPress={signIn}>
                        <Text style={styles.buttonText}>Registrarme con Google</Text>
                    </TouchableOpacity>
                    <Text onPress={() => navigation.navigate('Login')} style={styles.registerText}>
                        ¿Ya tenés cuenta? Iniciá sesión
                    </Text>
                    {
                        loading &&
                        <Loader color={colors.azureblue} size={'large'}></Loader>
                    }
                    {error && <Text style={styles.actionsText}>Error al registrarse. Intente nuevamente.</Text>}
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
        height: 600,
        padding: 5,
        width: '100%'
    },
    button: {
        alignItems: 'center',
        backgroundColor: colors.header,
        borderRadius: 8,
        marginTop: 10,
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
        marginTop: 10
    },
    registerTextGoogle: {
        color: colors.black,
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    accountType: {
        flexDirection: 'row',
        marginVertical: 10,
        justifyContent: 'space-around',
        width: '80%'
    },
    actionsText: {
        color: colors.darkergray,
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10
    },
    error: { color: colors.danger, marginBottom: 5, fontSize: 15 }
});
