import { Ionicons } from '@expo/vector-icons';
import { createDrawerNavigator } from '@react-navigation/drawer';

import CustomDrawerContent from '../../components/CustomDrawerContent';
import { colors } from '../../theme/colors';
import { AppStackParamList } from '../../types/stack-param-list';
import { uiTexts } from '../../utils/data/ui-text-data';
import CompanionStack from '../CompanionStack/CompanionStack';
import PaymentsStack from '../CompanionStack/PaymentsStack';
import ClaimStack from '../UserStack/ClaimStack';

const Drawer = createDrawerNavigator<AppStackParamList>();

export default function CompanionDrawer() {
    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                drawerActiveTintColor: colors.white,   // active item color
                drawerInactiveTintColor: colors.black,    // inactive item color
                drawerActiveBackgroundColor: colors.azureblue, // background for active item
                drawerLabelStyle: {
                    fontSize: 18,
                    fontWeight: '600'
                },
                drawerStyle: {
                    backgroundColor: colors.white,
                    width: 300
                },
                headerStyle: {
                    backgroundColor: colors.azureblue
                },
                headerTintColor: colors.white
            }}
        >
            <Drawer.Screen
                name="CompanionStack"
                component={CompanionStack}
                options={{
                    headerShown: false,
                    title: uiTexts.home,
                    drawerIcon: () => (
                        <Ionicons name="home" color={colors.white} size={28} />
                    )
                }}
            />
            <Drawer.Screen
                name="ClaimStack"
                component={ClaimStack}
                options={{
                    headerShown: false,
                    title: uiTexts.claimsReceived,
                    drawerIcon: () => (
                        <Ionicons name="warning" color={colors.white} size={28} />
                    )
                }}
            />
            <Drawer.Screen
                name="PaymentsStack"
                component={PaymentsStack}
                options={{
                    headerShown: false,
                    title: uiTexts.payments,
                    drawerIcon: () => (
                        <Ionicons name="wallet" color={colors.white} size={28} />
                    )
                }}
            />
        </Drawer.Navigator>
    );
}
