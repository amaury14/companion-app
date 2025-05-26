import { Ionicons } from '@expo/vector-icons';
import { createDrawerNavigator } from '@react-navigation/drawer';

import CustomDrawerContent from '../../components/CustomDrawerContent';
import { colors } from '../../theme/colors';
import { AppStackParamList } from '../../types/stack-param-list';
import { uiTexts } from '../../utils/data/ui-text-data';
import CompanionStack from '../CompanionStack/CompanionStack';

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
                name="CompanionHome"
                component={CompanionStack}
                options={{
                    headerShown: false,
                    title: uiTexts.home,
                    drawerIcon: () => (
                        <Ionicons name="home-outline" color={colors.white} size={28} />
                    )
                }}
            />
        </Drawer.Navigator>
    );
}
