import 'react-native-gesture-handler';

import React, { useState } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux'
import { createSlice, configureStore, combineReducers, getDefaultMiddleware } from '@reduxjs/toolkit'
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PersistGate } from 'redux-persist/integration/react'
import { StyleSheet, Text, View, Button, TextInput } from 'react-native'
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Notifications from 'expo-notifications';
import { v4 as uuid } from 'uuid';



interface Reminder {
    id: string
    hours: number
    minutes: number
}

function mkReminder(hours: string, minutes: string): Reminder {
    return {
        id: uuid(),
        hours: parseInt(hours),
        minutes: parseInt(minutes),
    }
}

function scheduleNotify(reminder: Reminder) {
    Notifications.scheduleNotificationAsync({
        content: {
            title: "Do the thing",
            body: 'Please :)',
        },
        trigger: {
            hour: reminder.hours,
            minute: reminder.minutes,
            repeats: true
        },
    });
}


const reminderSlice = createSlice({
    name: 'reminders',
    initialState: {
        reminders: [] as Reminder[]
    },
    reducers: {
        addReminder: (state, action) => {
            const { hours, minutes } = action.payload
            const r = mkReminder(hours, minutes)
            scheduleNotify(r)
            return { reminders: [...state.reminders, r] }
        }
    }
})
const { addReminder } = reminderSlice.actions

const reducers = combineReducers({ reminders: reminderSlice.reducer })
const persistConfig = {
    key: 'root',
    version: 1,
    storage: AsyncStorage,
}
const persistedReducer = persistReducer(persistConfig, reducers);
const store = configureStore({
    reducer: persistedReducer, middleware: getDefaultMiddleware({
        serializableCheck: {
            ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
        }
    })
})
const persistor = persistStore(store)
store.subscribe(() => console.log(store.getState().reminders.reminders))

const Stack = createStackNavigator();

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default function App() {
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <NavigationContainer>
                    <Stack.Navigator>
                        <Stack.Screen name="Home" component={HomeScreen} />
                        <Stack.Screen name="Create" component={CreateReminder} />
                        <Stack.Screen name="List" component={ListReminders} />
                    </Stack.Navigator>
                </NavigationContainer>
            </PersistGate>
        </Provider>
    );
};


/////////////// Components

export function HomeScreen({ navigation }: any) {
    return (
        <View style={styles.container}>
            <Text>Remind me to:</Text>
            <Button title="Take my meds every day" onPress={(_) => navigation.navigate('Create')}></Button>
            <Button title="All reminders" onPress={() => navigation.navigate('List')}></Button>
        </View>
    );
}

export function CreateReminder({ navigation }: any) {
    const [minutes, setMinutes] = useState('')
    const [hours, setHours] = useState('')

    const dispatch = useDispatch()

    const onPress = () => {
        dispatch(addReminder({ hours, minutes }))
        navigation.navigate("Home")
    }

    return (
        <View style={styles.container}>
            <TextInput placeholder="Hours" onChangeText={t => setHours(t)}></TextInput>
            <TextInput placeholder="Minutes" onChangeText={t => setMinutes(t)}></TextInput>
            <Button title="Create" onPress={onPress} />
        </View >
    )
}

export function ListReminders() {
    const reminders = useSelector<any>(state => state.reminders.reminders) as Reminder[]

    let content;
    if (reminders.length === 0) {
        content = <Text>No reminders yet, why not create one?</Text>
    }
    else {
        content = reminders.map((r) => <View key={r.id}><Text>Reminder at {r.hours}:{r.minutes}</Text></View>)
    }

    return (
        <View style={styles.container}>
            {content}
        </View>
    )
}
