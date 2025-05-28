import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker, LatLng } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';

import { useUser } from '../../context/UserContext';
import { db } from '../../services/firebase';
import { colors } from '../../theme/colors';
import { dbKeys, fieldKeys, userKeys } from '../../utils/keys/db-keys';
import { uiTexts } from '../../utils/data/ui-text-data';
import { Accuracy, getForegroundPermissionsAsync, watchPositionAsync } from 'expo-location';
import { update10Seconds } from '../../utils/keys/costs-keys';
import { scheduleTextReminder } from '../../utils/notifications';
import { areLocationsClose } from '../../utils/util';

type ServiceTrackingProps = {
    route: {
        params: {
            destination: LatLng; // dirección del servicio
            serviceId: string;
        };
    };
};

const ServiceTrackingScreen = ({ route }: ServiceTrackingProps) => {
    const { user } = useUser();
    const { serviceId, destination } = route.params;
    const [isCloseActive, setCloseActive] = useState<boolean>(false);
    const [location, setLocation] = useState<LatLng | null>(null);
    const mapRef = useRef<MapView>(null);

    const startLocationSharing = async (serviceId: string, field: string) => {
        const { granted } = await getForegroundPermissionsAsync();
        if (!granted) return;

        await watchPositionAsync(
            { accuracy: Accuracy.High, timeInterval: update10Seconds, distanceInterval: 5 },
            async ({ coords }) => {
                await updateDoc(doc(db, dbKeys.services, serviceId), {
                    [field]: {
                        latitude: coords.latitude,
                        longitude: coords.longitude,
                        updatedAt: new Date()
                    }
                });
            }
        );
    };

    const checkLocationClose = useCallback((interval: NodeJS.Timeout) => {
        if (areLocationsClose(destination, location ?? { latitude: 0, longitude: 0 }) && !isCloseActive) {
            setCloseActive(true);
            scheduleTextReminder(
                `⏰ ${uiTexts.reminderService}`,
                user?.type === userKeys.user ? uiTexts.companionClose : uiTexts.clientLocationClose
            );
            clearInterval(interval); // stop checking once condition is met
        }
    }, [destination, location, isCloseActive, user?.type]);

    useEffect(() => {
        const liveLocationField = user?.type === userKeys.user ? fieldKeys.requesterLiveLocation : fieldKeys.companionLiveLocation;
        startLocationSharing(serviceId, liveLocationField);
        const unsubscribe = onSnapshot(doc(db, dbKeys.services, serviceId), snapshot => {
            const data = snapshot.data();
            if (data?.[liveLocationField]) {
                setLocation({
                    latitude: data[liveLocationField].latitude,
                    longitude: data[liveLocationField].longitude
                });
            }
        });

        return unsubscribe;
    }, [serviceId, user]);

    useEffect(() => {
        if (!destination || !location) return;

        const interval = setInterval(() => {
            checkLocationClose(interval);
        }, update10Seconds);

        checkLocationClose(interval);

        return () => clearInterval(interval); // cleanup on unmount
    }, [destination, location, checkLocationClose]);

    useEffect(() => {
        if (location && mapRef?.current) {
            mapRef.current.animateToRegion(
                {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                },
                1000
            );
        }
    }, [location]);

    if (!location) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.header} />
                <Text style={styles.loadingText}>{uiTexts.waitingLocation}</Text>
            </View>
        );
    }

    return (
        <MapView
            style={styles.map}
            followsUserLocation={true}
            initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }}
            rotateEnabled={true}
            zoomControlEnabled={true}
            zoomEnabled={true}
        >
            <Marker
                coordinate={location}
                title={uiTexts.companion}
                pinColor={colors.azureblue}
            />
            <Marker
                coordinate={destination}
                title={uiTexts.serviceLocation}
                pinColor={colors.danger}
            />
            <MapViewDirections
                origin={location}
                destination={destination}
                apikey={process.env.GOOGLE_MAPS_API_KEY}
                strokeWidth={4}
                strokeColor={colors.success}
            />
        </MapView>
    );
};

export default ServiceTrackingScreen;

const styles = StyleSheet.create({
    map: {
        flex: 1
    },
    loadingContainer: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center'
    },
    loadingText: {
        color: colors.black,
        fontSize: 16,
        marginTop: 12
    }
});
