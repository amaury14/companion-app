import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    Pressable,
    TouchableOpacity
} from 'react-native';
import { DrawerContentComponentProps, DrawerContentScrollView, DrawerItemList, DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';

import { useUser } from '../context/UserContext';
import { auth } from '../services/firebase';
import { colors } from '../theme/colors';
import { AppStackParamList } from '../types/stack-param-list';
import { UserData } from '../types/user';
import { uiTexts } from '../utils/data/ui-text-data';

const CustomDrawerContent = (props: DrawerContentComponentProps) => {
    const navigation = useNavigation<DrawerNavigationProp<AppStackParamList>>();
    const { user } = useUser();

    const logout = async () => {
        await auth.signOut();
    };

    const handleViewUser = (user: UserData | null) => {
        if (user?.id?.length) {
            navigation.navigate('UserProfile', { userId: user.id });
        }
    };

    return (
        <DrawerContentScrollView {...props} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => handleViewUser(user)}>
                    <Image
                        source={require('../../assets/profile.png')}
                        style={styles.avatar}
                    />
                </TouchableOpacity>
                <Text style={styles.name}>{user?.name}</Text>
                <Text style={styles.role}>{user?.type === 'companion' ? uiTexts.companion : uiTexts.user}</Text>
            </View>

            <DrawerItemList {...props} />

            <View style={styles.footer}>
                <Pressable style={styles.logoutButton} onPress={logout}>
                    <Ionicons name="log-out-outline" size={28} color="white" />
                    <Text style={styles.logoutText}>{uiTexts.closeSession}</Text>
                </Pressable>
            </View>
        </DrawerContentScrollView>
    );
};

export default CustomDrawerContent;

const styles = StyleSheet.create({
    content: { flex: 1, backgroundColor: colors.argentinianblue },
    header: {
        alignItems: 'center',
        backgroundColor: colors.header,
        borderRadius: 10,
        marginBottom: 10,
        padding: 20
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        marginBottom: 10
    },
    name: {
        color: colors.white,
        fontSize: 20,
        fontWeight: 'bold'
    },
    role: {
        color: colors.white,
        fontSize: 16,
        marginTop: 4
    },
    footer: {
        marginTop: 'auto',
        padding: 20
    },
    logoutButton: {
        alignItems: 'center',
        backgroundColor: colors.danger,
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        padding: 10
    },
    logoutText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 10,
        textAlign: 'center'
    }
});
