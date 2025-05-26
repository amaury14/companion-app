import { Ionicons } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { StyleSheet, View, TextInput, Text, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import Layout from '../../components/Layout';
import Loader from '../../components/Loader';
import { auth } from '../../services/firebase';
import { colors } from '../../theme/colors';
import { AppStackParamList } from '../../types/stack-param-list';
import { uiTexts } from '../../utils/data/ui-text-data';

type Props = NativeStackScreenProps<AppStackParamList, 'LoginEmail'>;

type LoginFormData = {
    email: string;
    password: string;
};

/**
 * Email/password login form for existing users with validation and error feedback.
 */
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
                    <Text style={styles.registerText}>{uiTexts.emailFormLabel}</Text>
                    <View style={{ width: '80%' }}>
                        <Controller
                            control={control}
                            name="email"
                            rules={{
                                required: uiTexts.requiredEmail,
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: uiTexts.invalidEmail
                                }
                            }}
                            render={({ field: { onChange, value } }) => (
                                <TextInput value={value} onChangeText={onChange} style={styles.input} keyboardType="email-address" />
                            )}
                        />
                        {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}
                    </View>
                    <Text style={styles.registerText}>{uiTexts.passwordFormLabel}</Text>
                    <View style={{ width: '80%' }}>
                        <Controller
                            control={control}
                            name="password"
                            rules={{
                                required: uiTexts.requiredPassword,
                                minLength: { value: 6, message: uiTexts.minimum6Character }
                            }}
                            render={({ field: { onChange, value } }) => (
                                <TextInput secureTextEntry value={value} onChangeText={onChange} style={styles.input} />
                            )}
                        />
                        {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}
                    </View>
                    <TouchableOpacity style={styles.button} onPress={handleSubmit(onLogin)}>
                        <Ionicons name="log-in-outline" size={28} color="white" />
                        <Text style={styles.buttonText}>{uiTexts.login}</Text>
                    </TouchableOpacity>
                    <Text onPress={() => navigation.navigate('Register')} style={styles.registerText}>{uiTexts.noAccountRegister}</Text>
                    <Text onPress={() => navigation.navigate('Login')} style={styles.registerText}>{uiTexts.goBack}</Text>
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
    input: { borderBottomWidth: 1, fontSize: 18 },
    button: {
        alignItems: 'center',
        backgroundColor: colors.header,
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        paddingHorizontal: 24,
        paddingVertical: 12
    },
    buttonText: {
        color: colors.white,
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 10
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
    error: {
        color: colors.danger,
        fontSize: 15,
        marginBottom: 5
    }
});
