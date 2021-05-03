import 'react-native-gesture-handler';

import React from 'react';
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Notifications from 'expo-notifications';

import { store } from './store';
import { ListRemindersScreen } from './list-screen'
import { persistStore } from 'redux-persist';
import { CreateReminderScreen } from './create-screen';
import { HomeScreen } from './home-screen';

store.subscribe(() => console.log(store.getState().reminders.reminders))

export const persistor = persistStore(store)

const Stack = createStackNavigator();

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

export default function App() {
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <NavigationContainer>
                    <Stack.Navigator>
                        <Stack.Screen name="Home" component={HomeScreen} />
                        <Stack.Screen name="Create" component={CreateReminderScreen} />
                        <Stack.Screen name="List" component={ListRemindersScreen} />
                    </Stack.Navigator>
                </NavigationContainer>
            </PersistGate>
        </Provider>
    );
};


