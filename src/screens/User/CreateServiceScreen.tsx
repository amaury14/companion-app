import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import DatePicker from 'react-native-ui-datepicker';
import SelectDropdown from 'react-native-select-dropdown';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import dayjs from 'dayjs';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import * as Location from 'expo-location';

import Layout from '../../components/Layout';
import Loader from '../../components/Loader';
import { useUser } from '../../context/UserContext';
import { UserStackParamList } from '../../navigation/UserStack/UserStack';
import { auth, db } from '../../services/firebase';
import { colors } from '../../theme/colors';
import { Category } from '../../types/category';
import { categoryData } from '../../utils/data/category-data';
import { uiTexts } from '../../utils/data/ui-text-data';
import { dbKeys } from '../../utils/keys/db-keys';
import { statusKeys } from '../../utils/keys/status-keys';
import { baseComission, baseCost, maxServiceHours, minServiceHours } from '../../utils/keys/costs-keys';
import { getCosts } from '../../utils/util';

type FormData = {
    category: Category;
    comments: string;
    duration: string;
    location: string;
};

type Props = NativeStackScreenProps<UserStackParamList, 'CreateService'>;

export default function CreateServiceScreen({ navigation }: Props) {
    const { control, handleSubmit, watch, formState: { errors } } = useForm<FormData>();
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const { user } = useUser();

    const duration = watch('duration');

    const getLocation = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            alert(uiTexts.locationPermissionDenied);
            return;
        }

        const loc = await Location.getCurrentPositionAsync({});
        setLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
        });
    };

    const validateAddress = useCallback(async (address: string) => {
        try {
            const geocoded = await Location.geocodeAsync(address);
            if (geocoded.length === 0) {
                alert(uiTexts.invalidAddress);
                return null;
            }

            const { latitude, longitude } = geocoded[0];
            return { latitude, longitude };
        } catch (error) {
            console.error('Error geocoding address:', error);
            alert(uiTexts.invalidAddress2);
            return null;
        }
    }, []);

    const onSubmit = async (data: FormData) => {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        const price = getCosts(parseInt(data.duration), baseCost, baseComission);

        const coords = data.location
            ? await validateAddress(data.location)
            : user?.address ?? location;

        if (!coords) return;

        try {
            setLoading(true);
            await addDoc(collection(db, dbKeys.services), {
                category: data.category.value,
                checkInTime: null,
                checkOutTime: null,
                comments: data.comments,
                companionId: '',
                companionPayment: Math.round(price - (price * baseComission)),
                date: Timestamp.fromDate(selectedDate),
                duration: parseInt(data.duration),
                evidenceUrls: [],
                location: coords,
                paid: false,
                price,
                platformComission: Math.round((price * baseComission)),
                requesterId: uid,
                status: statusKeys.pending
            });

            Alert.alert(uiTexts.serviceRequested, uiTexts.waitService);
            navigation.goBack();
        } catch (err) {
            Alert.alert(uiTexts.error, uiTexts.couldNotCreateService);
            console.error(err);
        }
        setLoading(false);
    };

    const getEstCosts = useMemo(() => {
        return duration ? `${getCosts(parseInt(duration), baseCost, baseComission)} ${uiTexts.est}.` : ''
    }, [duration]);

    useEffect(() => {
        getLocation();
    }, []);

    return (
        <Layout>
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <Text style={styles.title}>{uiTexts.newService}</Text>

                <Text style={styles.inputText}>{uiTexts.categoryFormLabel}</Text>
                <Controller
                    control={control}
                    name="category"
                    rules={{ required: uiTexts.requiredCategory }}
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
                                                {(selectedItem && selectedItem.name) || uiTexts.selectCategory}
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
                            {errors.category && <Text style={styles.error}>{errors.category.message}</Text>}
                        </View>
                    )}
                />

                <View style={styles.durationContent}>
                    <Text style={styles.inputText}>{uiTexts.durationFormLabel}</Text>
                    <Text style={styles.estText}>💲{getEstCosts}</Text>
                </View>
                <Controller
                    control={control}
                    name="duration"
                    rules={{ required: uiTexts.requiredDuration, min: minServiceHours, max: maxServiceHours }}
                    render={({ field: { onChange, value } }) => (
                        <TextInput style={styles.input} value={value} onChangeText={onChange} keyboardType="numeric" />
                    )}
                />
                {errors.duration && <Text style={styles.error}>{errors.duration.message}</Text>}

                <Text style={styles.inputText}>{uiTexts.locationFormLabel}</Text>
                <Controller
                    control={control}
                    name="location"
                    render={({ field: { onChange, value } }) => (
                        <TextInput placeholder={uiTexts.locationFormPlaceholder} style={styles.input} value={value} onChangeText={onChange} />
                    )}
                />

                <Text style={styles.inputText}>{uiTexts.commentsFormLabel}</Text>
                <Controller
                    control={control}
                    name="comments"
                    render={({ field: { onChange, value } }) => (
                        <TextInput
                            style={styles.textArea}
                            multiline
                            numberOfLines={4}
                            placeholder={uiTexts.commentsFormPlaceholder}
                            textAlignVertical="top"
                            value={value}
                            onChangeText={onChange}
                        />
                    )}
                />

                <Text style={styles.inputText}>{uiTexts.dateTimeFormLabel}</Text>
                <View>
                    <DatePicker
                        date={selectedDate}
                        initialView="day"
                        minDate={new Date()}
                        mode="single"
                        locale="es"
                        timePicker={true}
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
                        <Text style={styles.buttonText}>{uiTexts.confirm}</Text>
                    </TouchableOpacity>
                    {
                        loading &&
                        <Loader color={colors.azureblue} size={'large'}></Loader>
                    }
                </View>
            </ScrollView>
        </Layout>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 20 },
    title: {
        color: colors.white,
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 5
    },
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
        color: colors.white,
        fontSize: 18,
        fontWeight: 'bold'
    },
    textArea: {
        backgroundColor: colors.gray,
        borderColor: colors.azureblue,
        borderRadius: 8,
        borderWidth: 1,
        color: colors.black,
        height: 120,
        fontSize: 18,
        padding: 12
    },
    error: {
        color: colors.danger,
        fontSize: 15,
        marginBottom: 5
    }
});
