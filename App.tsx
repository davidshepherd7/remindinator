import 'react-native-gesture-handler';

import * as React from 'react';
import { Provider } from 'react-redux'
import { Platform } from 'react-native'
import { PersistGate } from 'redux-persist/integration/react'
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { setNotificationHandler } from 'expo-notifications';
import { Provider as PaperProvider } from 'react-native-paper';
import { RootSiblingParent } from 'react-native-root-siblings';

import { store, recacheScheduledNotifications } from './store';
import { persistStore } from 'redux-persist';
import { CreateReminderScreen } from './create-screen';
import { HomeScreen } from './home-screen';
import { configureCategories, configureListeners } from './notification-ui';

store.subscribe(() => console.log("updated"))

export const persistor = persistStore(store)

const Stack = createStackNavigator();

if (Platform.OS !== "web") {
    setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: false,
            shouldSetBadge: false,
        }),
    });
    configureCategories()
    configureListeners()
}

// Regularly query the notification state
setInterval(() => recacheScheduledNotifications(store.dispatch), 30000)

export default function App() {
    return (
        <Provider store={store}>
            <PaperProvider>
                <RootSiblingParent>
                    <PersistGate loading={null} persistor={persistor}>
                        <NavigationContainer>
                            <Stack.Navigator>
                                <Stack.Screen name="Remindinator" component={HomeScreen} />
                                <Stack.Screen name="New Reminder" component={CreateReminderScreen} />
                            </Stack.Navigator>
                        </NavigationContainer>
                    </PersistGate>
                </RootSiblingParent>
            </PaperProvider>
        </Provider>
    );
};

