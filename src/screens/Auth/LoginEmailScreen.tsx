import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Text, TouchableOpacity } from 'react-native';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { signInWithEmailAndPassword } from 'firebase/auth';

import Layout from '../../components/Layout';
import Loader from '../../components/Loader';
import { AuthStackParamList } from '../../navigation/AuthStack/AuthStack';
import { auth } from '../../services/firebase';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<AuthStackParamList, 'LoginEmail'>;

type LoginFormData = {
    email: string;
    password: string;
};

export default function LoginEmailScreen({ navigation }: Props) {
    const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);

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

    return (
        <Layout>
            <View style={styles.container}>
                <View style={styles.content}>
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
                                <TextInput value={value} onChangeText={onChange} style={styles.input} keyboardType="email-address" />
                            )}
                        />
                        {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}
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
                                <TextInput secureTextEntry value={value} onChangeText={onChange} style={styles.input} />
                            )}
                        />
                        {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}
                    </View>
                    <TouchableOpacity style={styles.button} onPress={handleSubmit(onLogin)}>
                        <Text style={styles.buttonText}>Iniciar sesión</Text>
                    </TouchableOpacity>
                    <Text onPress={() => navigation.navigate('Register')} style={styles.registerText}>¿No tenés cuenta? Regístrate</Text>
                    <Text onPress={() => navigation.navigate('Login')} style={styles.registerText}>
                        ← Volver
                    </Text>
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
    },
    error: { color: colors.danger, marginBottom: 5, fontSize: 15 }
});
