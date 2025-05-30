import { Ionicons } from '@expo/vector-icons';
import { createDrawerNavigator } from '@react-navigation/drawer';

import CustomDrawerContent from '../../components/CustomDrawerContent';
import SettingsScreen from '../../screens/Settings/SettingsScreen';
import CreateServiceScreen from '../../screens/User/CreateServiceScreen';
import { colors } from '../../theme/colors';
import { AppStackParamList } from '../../types/stack-param-list';
import { uiTexts } from '../../utils/data/ui-text-data';
import ClaimStack from '../UserStack/ClaimStack';
import UserStack from '../UserStack/UserStack';

const Drawer = createDrawerNavigator<AppStackParamList>();

export default function UserDrawer() {
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
                name="UserStack"
                component={UserStack}
                options={{
                    headerShown: false,
                    title: uiTexts.home,
                    drawerIcon: () => (
                        <Ionicons name="home" color={colors.white} size={28} />
                    )
                }}
            />
            <Drawer.Screen
                name="CreateService"
                component={CreateServiceScreen}
                options={{
                    headerShown: false,
                    title: uiTexts.newService,
                    drawerIcon: () => (
                        <Ionicons name="add-circle" color={colors.white} size={28} />
                    )
                }}
            />
            <Drawer.Screen
                name="ClaimStack"
                component={ClaimStack}
                options={{
                    headerShown: false,
                    title: uiTexts.viewClaims,
                    drawerIcon: () => (
                        <Ionicons name="warning" color={colors.white} size={28} />
                    )
                }}
            />
            <Drawer.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    headerShown: false,
                    title: uiTexts.settings,
                    drawerIcon: () => (
                        <Ionicons name="cog" color={colors.white} size={28} />
                    )
                }}
            />
        </Drawer.Navigator>
    );
}
