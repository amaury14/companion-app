import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { Service } from '../types/service';
import { reminderKeys } from './keys/db-keys';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true
    })
});

export async function requestNotificationPermissions() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync(reminderKeys.remindersId, {
            name: reminderKeys.remindersName,
            importance: Notifications.AndroidImportance.MAX,
            enableVibrate: true,
            showBadge: true,
            vibrationPattern: [0, 250, 250, 250]
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            return;
        }
        try {
            const projectId =
                Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
            if (!projectId) {
                throw new Error('Project ID not found');
            }
            token = (
                await Notifications.getExpoPushTokenAsync({
                    projectId
                })
            ).data;
        } catch (e) {
            token = `${e}`;
        }
    }

    return token;
}

export async function scheduleReminder(service: Service, minutesBefore: number, title: string, body: string) {
    const notificationTime = new Date(service?.date?.toDate()?.getTime() - minutesBefore).getSeconds();

    await Notifications.scheduleNotificationAsync({
        content: {
            body,
            data: { ...service },
            sound: true,
            title
        },
        trigger: {
            channelId: reminderKeys.remindersId,
            seconds: notificationTime,
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL
        }
    });
}

export async function scheduleTextReminder(title: string, body: string) {
    const notificationTime = new Date().getSeconds();

    await Notifications.scheduleNotificationAsync({
        content: {
            body,
            sound: true,
            title
        },
        trigger: {
            channelId: reminderKeys.remindersId,
            seconds: notificationTime,
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL
        }
    });
}
