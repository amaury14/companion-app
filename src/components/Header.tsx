import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { auth } from '../services/firebase';
import { colors } from '../theme/colors';
import { useUser } from './UserContext';

export default function Header() {
    const { user } = useUser();

    const logout = () => {
        auth.signOut();
    };

    return (
        <View style={styles.header}>
            <Text style={styles.headerText}>Hola, {user?.name ?? 'Usuario'}</Text>
            <TouchableOpacity style={styles.exitButton} onPress={logout}>
                <Text style={styles.exitButtonText}>Salir</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'space-between',
        flexDirection: 'row',
        backgroundColor: colors.header,
        padding: 10
    },
    headerText: { color: colors.white, fontSize: 20, fontWeight: 'bold' },
    exitButton: {
        alignItems: 'center',
        backgroundColor: colors.azureblue,
        borderRadius: 8,
        marginTop: 0,
        paddingHorizontal: 10,
        paddingVertical: 5
    },
    exitButtonText: {
        color: colors.white,
        fontWeight: 'bold'
    }
});
