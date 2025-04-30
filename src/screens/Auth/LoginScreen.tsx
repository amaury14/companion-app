import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Text, TouchableOpacity } from 'react-native';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { signInWithEmailAndPassword } from 'firebase/auth';

import { AuthStackParamList } from '../../navigation/AuthStack/AuthStack';
import { auth } from '../../services/firebase';

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
        <View style={{ padding: 20 }}>
            <Text>Email</Text>
            <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                    <TextInput value={value} onChangeText={onChange} style={{ borderBottomWidth: 1 }} />
                )}
            />
            <Text>Password</Text>
            <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
                    <TextInput secureTextEntry value={value} onChangeText={onChange} style={{ borderBottomWidth: 1 }} />
                )}
            />
            <TouchableOpacity style={styles.button} onPress={handleSubmit(onLogin)}>
                <Text style={styles.buttonText}>INICIAR SESIÓN</Text>
            </TouchableOpacity>
            {loading && <Text>Cargando...</Text>}
            {error && <Text>Credenciales Inválidas!!!</Text>}
            <Text onPress={() => navigation.navigate('Register')} style={{ marginTop: 20 }}>¿No tenés cuenta? Regístrate</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    button: {
        alignItems: 'center',
        backgroundColor: '#246bce',
        borderRadius: 8,
        marginTop: 20,
        paddingHorizontal: 24,
        paddingVertical: 12
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold'
    }
});
