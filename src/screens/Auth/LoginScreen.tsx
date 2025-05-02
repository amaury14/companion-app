import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Text, TouchableOpacity } from 'react-native';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { signInWithEmailAndPassword } from 'firebase/auth';

import Layout from '../../components/Layout';
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
                {loading && <Text style={styles.actionsText}>Cargando...</Text>}
                {error && <Text style={styles.actionsText}>Credenciales Inválidas!!!</Text>}
                <Text onPress={() => navigation.navigate('Register')} style={styles.registerText}>¿No tenés cuenta? Regístrate</Text>
            </View>
        </Layout>
    );
}

const styles = StyleSheet.create({
    content: {
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'center',
        height: '100%',
        padding: 20,
        width: '100%'
    },
    input: { borderBottomWidth: 1, fontSize: 20 },
    button: {
        alignItems: 'center',
        backgroundColor: '#246bce',
        borderRadius: 8,
        marginTop: 20,
        paddingHorizontal: 24,
        paddingVertical: 12
    },
    buttonText: {
        color: colors.white,
        fontSize: 22,
        fontWeight: 'bold'
    },
    registerText: {
        color: colors.black,
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: 20
    },
    actionsText: {
        color: colors.darkergray,
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20
    }
});
