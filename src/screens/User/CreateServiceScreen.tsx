import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import DatePicker from 'react-native-ui-datepicker';
import SelectDropdown from 'react-native-select-dropdown';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import dayjs from 'dayjs';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

import Layout from '../../components/Layout';
import Loader from '../../components/Loader';
import { UserStackParamList } from '../../navigation/UserStack/UserStack';
import { auth, db } from '../../services/firebase';
import { colors } from '../../theme/colors';
import { Category } from '../../types/category';
import { categoryData } from '../../utils/data/category-data';
import { dbKeys } from '../../utils/keys/db-keys';
import { statusKeys } from '../../utils/keys/status-keys';
import { baseComission, baseCost } from '../../utils/keys/costs-keys';
import { getCosts } from '../../utils/util';

type FormData = {
    category: Category;
    duration: string;
    location: string;
};

type Props = NativeStackScreenProps<UserStackParamList, 'CreateService'>;

export default function CreateServiceScreen({ navigation }: Props) {
    const { control, handleSubmit, watch } = useForm<FormData>();
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    const duration = watch('duration');

    const onSubmit = async (data: FormData) => {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        const price = getCosts(parseInt(data.duration), baseCost, baseComission);

        try {
            setLoading(true);
            await addDoc(collection(db, dbKeys.services), {
                category: data.category.value,
                checkInTime: null,
                checkOutTime: null,
                companionId: '',
                companionPayment: Math.round(price - (price * baseComission)),
                date: Timestamp.fromDate(selectedDate),
                duration: parseInt(data.duration),
                evidenceUrls: [],
                location: data.location,
                paid: false,
                price,
                platformComission: Math.round((price * baseComission)),
                requesterId: uid,
                status: statusKeys.pending
            });

            Alert.alert('¡Servicio solicitado!', 'Esperá la confirmación de un acompañante');
            navigation.goBack();
        } catch (err) {
            Alert.alert('Error', 'No se pudo crear el servicio');
            console.error(err);
        }
        setLoading(false);
    };

    const getEstCosts = (): string => {
        return duration ? `$${getCosts(parseInt(duration), baseCost, baseComission)} est.` : ''
    }

    return (
        <Layout>
            <View style={styles.container}>
                <Text style={styles.title}>Solicitar nuevo servicio</Text>

                <Text style={styles.inputText}>Categoría (compañía, trámites...)</Text>
                <Controller
                    control={control}
                    name="category"
                    rules={{ required: true }}
                    render={({ field: { onChange } }) => (
                        <View style={{ width: '100%' }}>
                            <SelectDropdown
                                data={categoryData}
                                onSelect={(selectedItem) => {
                                    onChange(selectedItem);
                                }}
                                renderButton={(selectedItem) => {
                                    return (
                                        <View style={styles.dropdownButtonStyle}>
                                            <Text style={styles.dropdownButtonTxtStyle}>
                                                {(selectedItem && selectedItem.name) || 'Seleccione la categoría'}
                                            </Text>
                                        </View>
                                    );
                                }}
                                renderItem={(item) => {
                                    return (
                                        <View style={styles.dropdownItemStyle}>
                                            <Text style={styles.dropdownItemTxtStyle}>{item.name}</Text>
                                        </View>
                                    );
                                }}
                                showsVerticalScrollIndicator={false}
                                dropdownStyle={styles.dropdownMenuStyle}
                            />
                        </View>
                    )}
                />

                <View style={styles.durationContent}>
                    <Text style={styles.inputText}>Duración (horas)</Text>
                    <Text style={styles.estText}>{getEstCosts()}</Text>
                </View>
                <Controller
                    control={control}
                    name="duration"
                    rules={{ required: true }}
                    render={({ field: { onChange, value } }) => (
                        <TextInput style={styles.input} value={value} onChangeText={onChange} keyboardType="numeric" />
                    )}
                />

                <Text style={styles.inputText}>Ubicación (barrio, dirección)</Text>
                <Controller
                    control={control}
                    name="location"
                    rules={{ required: true }}
                    render={({ field: { onChange, value } }) => (
                        <TextInput style={styles.input} value={value} onChangeText={onChange} />
                    )}
                />

                <Text style={styles.inputText}>Fecha y hora</Text>
                <View>
                    <DatePicker
                        date={selectedDate}
                        initialView="day"
                        minDate={new Date()}
                        mode="single"
                        locale="es"
                        onChange={({ date }) => setSelectedDate(dayjs(date).toDate())}
                        styles={{
                            today: { borderColor: colors.azureblue, borderWidth: 1 },
                            selected: { backgroundColor: colors.argentinianblue },
                            selected_label: { color: 'white' }
                        }}
                    />
                </View>

                <View>
                    <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
                        <Text style={styles.buttonText}>Confirmar y solicitar</Text>
                    </TouchableOpacity>
                    {
                        loading &&
                        <Loader color={colors.azureblue} size={'large'}></Loader>
                    }
                </View>
            </View>
        </Layout>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 5 },
    input: {
        borderBottomWidth: 1,
        fontSize: 14,
        marginBottom: 5,
        paddingVertical: 4
    },
    pickerContainer: {
        borderColor: colors.gray,
        borderRadius: 4,
        borderWidth: 1,
        marginBottom: 5
    },
    dropdownButtonStyle: {
        alignItems: 'center',
        flexDirection: 'row',
        height: 50,
        justifyContent: 'center',
        paddingHorizontal: 0,
        width: '100%',
    },
    dropdownButtonTxtStyle: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500'
    },
    dropdownButtonArrowStyle: {
        fontSize: 28,
    },
    dropdownButtonIconStyle: {
        fontSize: 28,
        marginRight: 8,
    },
    dropdownMenuStyle: {
        borderRadius: 8
    },
    dropdownItemStyle: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        width: '100%'
    },
    dropdownItemTxtStyle: {
        color: colors.darkergray,
        flex: 1,
        fontSize: 16,
        fontWeight: '500'
    },
    dropdownItemIconStyle: {
        fontSize: 28,
        marginRight: 8
    },
    durationContent: {
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%'
    },
    inputText: {
        color: colors.black,
        fontSize: 20,
        fontWeight: 'bold'
    },
    button: {
        alignItems: 'center',
        backgroundColor: colors.header,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12
    },
    buttonText: {
        color: colors.white,
        fontSize: 20,
        fontWeight: 'bold'
    },
    estText: {
        color: colors.azureblue,
        fontSize: 16,
        fontWeight: 'bold'
    }
});
